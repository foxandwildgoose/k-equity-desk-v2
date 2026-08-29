export type ImporterId =
  | "MTI_MONTHLY_EXPORT"
  | "HS_MONTHLY_EXPORT"
  | "MTI_TAXONOMY"
  | "HSK_MTI_CROSSWALK"
  | "REGIONAL_EXPORT"
  | "KOSPI_INDEX_DAILY"
  | "KOSPI_STOCK_DAILY"
  | "LISTED_SECURITY_MASTER"
  | "FX_USDKRW_DAILY";

export interface TradeObservation {
  period: string;
  categoryId: string;
  categoryName?: string;
  valueUsd: number;
  classification: "MTI" | "HS" | "HSK" | "TOTAL";
  geo?: string;
  workingDays?: number;
  vintage?: string;
  releasedAt?: string;
  sourceFile: string;
}

export interface ValidationIssue {
  row: number;
  message: string;
}

export interface ImportResult {
  ok: boolean;
  importer: ImporterId;
  rows: TradeObservation[];
  issues: ValidationIssue[];
  filename: string;
  importedAt: string;
}

const PERIOD_RE = [
  /^(20\d{2})[-./]?(0?[1-9]|1[0-2])$/,
  /^(20\d{2})년\s*(0?[1-9]|1[0-2])월$/,
];

export function parsePeriod(raw: string): string | null {
  const s = String(raw ?? "").trim();
  if (/^\d{4}-\d{2}$/.test(s)) return s;
  if (/^\d{6}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}`;
  const m1 = s.match(/^(20\d{2})[-./](0?[1-9]|1[0-2])$/);
  if (m1) return `${m1[1]}-${String(m1[2]).padStart(2, "0")}`;
  const m2 = s.match(/^(20\d{2})년\s*(0?[1-9]|1[0-2])월$/);
  if (m2) return `${m2[1]}-${String(m2[2]).padStart(2, "0")}`;
  for (const re of PERIOD_RE) {
    const m = s.match(re);
    if (m) return `${m[1]}-${String(m[2]).padStart(2, "0")}`;
  }
  return null;
}

export function parseKoreanNumber(raw: string, unitHint?: string): number | null {
  if (raw == null) return null;
  let s = String(raw).trim();
  if (!s || s === "-" || s === "N/A" || s === "na") return null;
  s = s.replace(/,/g, "").replace(/\s/g, "");
  const n = Number(s.replace(/[^\d.+-]/g, ""));
  if (!Number.isFinite(n)) return null;
  const u = (unitHint ?? "").toLowerCase();
  if (/천달러|thousand/.test(u)) return n * 1_000;
  if (/백만불|million|백만달러/.test(u)) return n * 1_000_000;
  if (/억달러|억불/.test(u)) return n * 100_000_000;
  return n;
}

const HEADER_ALIASES: Record<string, string[]> = {
  period: ["기간", "년월", "period", "date", "yyyymm", "월", "기준년월"],
  value: ["수출액", "수출", "export", "value", "금액", "usd", "수출금액"],
  category: ["품목", "품목명", "item", "category", "mti", "hs", "코드명"],
  code: ["코드", "code", "mti코드", "hs코드", "품목코드"],
  geo: ["지역", "시도", "국가", "region", "sido", "country"],
  workingDays: ["가동일", "조업일수", "workingdays", "일수"],
};

function normHeader(h: string): string {
  return h.replace(/\s+/g, "").toLowerCase();
}

export function detectColumns(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  headers.forEach((h, i) => {
    const n = normHeader(h);
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.some((a) => n.includes(normHeader(a))) && map[field] == null) {
        map[field] = i;
      }
    }
  });
  return map;
}

export function parseCsv(text: string): string[][] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim().length);
  return lines.map((line) => {
    const cells: string[] = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]!;
      if (ch === '"') {
        q = !q;
        continue;
      }
      if (ch === "," && !q) {
        cells.push(cur.trim());
        cur = "";
        continue;
      }
      cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  });
}

export function importTradeCsv(
  text: string,
  filename: string,
  importer: ImporterId,
): ImportResult {
  const table = parseCsv(text);
  const issues: ValidationIssue[] = [];
  if (table.length < 2) {
    return {
      ok: false,
      importer,
      rows: [],
      issues: [{ row: 0, message: "헤더+데이터 행이 필요합니다." }],
      filename,
      importedAt: new Date().toISOString(),
    };
  }
  const headers = table[0]!;
  const cols = detectColumns(headers);
  if (cols.period == null || cols.value == null) {
    return {
      ok: false,
      importer,
      rows: [],
      issues: [
        {
          row: 0,
          message: `필수 열 없음 (기간/수출액). 감지된 헤더: ${headers.join(", ")}`,
        },
      ],
      filename,
      importedAt: new Date().toISOString(),
    };
  }
  const unitHint = headers.join(" ");
  const classification =
    importer === "HS_MONTHLY_EXPORT" ? "HS" : importer === "MTI_MONTHLY_EXPORT" ? "MTI" : "TOTAL";
  const rows: TradeObservation[] = [];
  for (let i = 1; i < table.length; i++) {
    const rec = table[i]!;
    const period = parsePeriod(rec[cols.period] ?? "");
    const valueUsd = parseKoreanNumber(rec[cols.value] ?? "", unitHint);
    if (!period) {
      issues.push({ row: i + 1, message: `기간 파싱 실패: ${rec[cols.period]}` });
      continue;
    }
    if (valueUsd == null) {
      issues.push({ row: i + 1, message: `금액 파싱 실패: ${rec[cols.value]}` });
      continue;
    }
    if (valueUsd < 0) {
      issues.push({ row: i + 1, message: "음수 수출액은 거부합니다." });
      continue;
    }
    const categoryId =
      (cols.code != null ? rec[cols.code] : undefined) ||
      (cols.category != null ? rec[cols.category] : undefined) ||
      "TOTAL";
    rows.push({
      period,
      categoryId: String(categoryId),
      categoryName: cols.category != null ? rec[cols.category] : categoryId,
      valueUsd,
      classification,
      geo: cols.geo != null ? rec[cols.geo] : undefined,
      workingDays:
        cols.workingDays != null
          ? Number(String(rec[cols.workingDays]).replace(/[^\d.]/g, "")) || undefined
          : undefined,
      vintage: new Date().toISOString().slice(0, 10),
      sourceFile: filename,
    });
  }
  if (rows.length === 0) {
    return {
      ok: false,
      importer,
      rows: [],
      issues: issues.length ? issues : [{ row: 0, message: "유효 행이 없습니다." }],
      filename,
      importedAt: new Date().toISOString(),
    };
  }
  return {
    ok: true,
    importer,
    rows,
    issues,
    filename,
    importedAt: new Date().toISOString(),
  };
}

export interface IndexDailyRow {
  date: string;
  close: number;
  sourceFile: string;
}

export function importIndexCsv(text: string, filename: string): {
  ok: boolean;
  rows: IndexDailyRow[];
  issues: ValidationIssue[];
} {
  const table = parseCsv(text);
  if (table.length < 2) return { ok: false, rows: [], issues: [{ row: 0, message: "빈 파일" }] };
  const headers = table[0]!.map((h) => h.toLowerCase());
  const di = headers.findIndex((h) => /date|일자|날짜/.test(h));
  const ci = headers.findIndex((h) => /close|종가|index|지수/.test(h));
  if (di < 0 || ci < 0) {
    return { ok: false, rows: [], issues: [{ row: 0, message: "일자/종가 열 없음" }] };
  }
  const rows: IndexDailyRow[] = [];
  const issues: ValidationIssue[] = [];
  for (let i = 1; i < table.length; i++) {
    const dateRaw = table[i]![di] ?? "";
    const date = dateRaw.replace(/\./g, "-").slice(0, 10);
    const close = Number(String(table[i]![ci]).replace(/,/g, ""));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(close)) {
      issues.push({ row: i + 1, message: "일자/종가 파싱 실패" });
      continue;
    }
    rows.push({ date, close, sourceFile: filename });
  }
  return { ok: rows.length > 0, rows, issues };
}
