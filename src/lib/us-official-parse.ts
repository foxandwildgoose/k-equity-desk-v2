/** Pure parsers for official US research. No network. No invented figures. */

export const RESEARCH_DISCLAIMER =
  "Summaries are for informational purposes only and are not investment advice. Always read the original document. Lines below are extracts or structured fields from a document this server retrieved. If a document was not retrieved, the card says so and does not fill the gap.";

export const RESEARCH_DISCLAIMER_KO =
  "요약은 정보 제공용이며 투자 조언이 아닙니다. 항상 원문을 읽으세요. 아래 문장은 서버가 받아 온 문서의 발췌 또는 구조화 필드입니다. 문서를 받지 못하면 비워 두고, 지어내지 않습니다.";

export const PAID_SOURCE_NOTE =
  "Paid industry products such as IBISWorld, CFRA Industry Surveys, and Gartner are typically available through a broker or library. This site does not host those PDFs and does not summarize them.";

export type SummaryStatus = "document-extract" | "xbrl-extract" | "not-retrieved";

export type ReportKind =
  | "10-K"
  | "10-Q"
  | "8-K"
  | "DEF 14A"
  | "4"
  | "13F-HR"
  | "earnings-release"
  | "fomc-statement"
  | "fomc-minutes"
  | "fomc-sep"
  | "fomc-press"
  | "fomc-implementation"
  | "beige-book"
  | "bea-release"
  | "bls-series"
  | "industry";

export type SourceClass = "official" | "company-ir" | "analyst";

export type KeyFigure = {
  metric: string;
  period: string;
  actual: string;
  prior: string | null;
  source: string;
};

export type OfficialReport = {
  id: string;
  title: string;
  titleKo: string;
  kind: ReportKind;
  badge: string;
  badgeKo: string;
  sourceClass: SourceClass;
  sourceName: string;
  publishedAt: string | null;
  tickers: string[];
  sectors: string[];
  url: string | null;
  pdfUrl: string | null;
  indexUrl: string | null;
  accession: string | null;
  summaryStatus: SummaryStatus;
  summaryLabel: string | null;
  bottomLine: string | null;
  bullets: string[];
  keyFigures: KeyFigure[];
  whatChanged: string | null;
  risks: string[];
  implications: string | null;
  nextWatch: string | null;
  notes: string[];
};

export type CalendarEvent = {
  id: string;
  iso: string | null;
  dateLabel: string;
  timeLabel: string | null;
  title: string;
  sourceName: string;
  url: string | null;
  kind: "released" | "scheduled";
};

export type OfficialHub = {
  id: string;
  label: string;
  labelKo: string;
  url: string | null;
  note: string;
};

export type UsOfficialPolicy = {
  fetchedAt: string;
  featured: OfficialReport[];
  macro: OfficialReport[];
  industry: OfficialReport[];
  calendar: CalendarEvent[];
  hubs: OfficialHub[];
  errors: string[];
  paidNote: string;
};

export type UsOfficialUniverse = {
  fetchedAt: string;
  filings: OfficialReport[];
  earnings: OfficialReport[];
  featuredFiling: OfficialReport | null;
  errors: string[];
};

export type UsOfficialCompany = {
  fetchedAt: string;
  symbol: string;
  name: string | null;
  cik: string | null;
  sic: string | null;
  website: string | null;
  investorWebsite: string | null;
  filings: OfficialReport[];
  earnings: OfficialReport[];
  form4: OfficialReport[];
  holdings: OfficialReport[];
  errors: string[];
};

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

export function decodeEntities(raw: string): string {
  return raw
    .replace(/\u0026nbsp;/gi, " ")
    .replace(/\u0026#160;/gi, " ")
    .replace(/\u0026rsquo;|\u0026lsquo;|\u0026#8217;|\u0026#8216;/gi, "'")
    .replace(/\u0026rdquo;|\u0026ldquo;|\u0026#8220;|\u0026#8221;/gi, '"')
    .replace(/\u0026mdash;/gi, "—")
    .replace(/\u0026ndash;/gi, "–")
    .replace(/\u0026amp;/gi, "\u0026")
    .replace(/\u0026quot;/gi, '"')
    .replace(/\u0026#39;|\u0026apos;/gi, "'")
    .replace(/\u0026#x27;/gi, "'")
    .replace(/\u0026lt;/gi, "<")
    .replace(/\u0026gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, d: string) => {
      const n = Number(d);
      return n > 0 && n < 65536 ? String.fromCharCode(n) : "";
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => {
      const n = parseInt(h, 16);
      return n > 0 && n < 65536 ? String.fromCharCode(n) : "";
    });
}

export function isoFromParts(year: number, monthName: string, day: number): string | null {
  const mi = MONTHS.indexOf(monthName.toLowerCase());
  if (mi < 0 || day < 1 || day > 31 || year < 1990 || year > 2100) return null;
  const dt = new Date(Date.UTC(year, mi, day));
  if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== mi || dt.getUTCDate() !== day) {
    return null;
  }
  return dt.toISOString().slice(0, 10);
}

export function formatDay(iso: string | null): string {
  if (!iso) return "Date not stated";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const dt = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function badgeTone(kind: ReportKind): string {
  if (
    kind === "10-K" ||
    kind === "10-Q" ||
    kind === "8-K" ||
    kind === "DEF 14A" ||
    kind === "4" ||
    kind === "13F-HR"
  ) {
    return "border-desk-navy/40 bg-desk-navy/15 text-desk-navy";
  }
  if (kind === "earnings-release") {
    return "border-price-up-global/40 bg-price-up-global/15 text-price-up-global";
  }
  if (kind === "industry") {
    return "border-desk-teal/40 bg-desk-teal/15 text-desk-teal";
  }
  if (kind === "bls-series" || kind === "bea-release" || kind.startsWith("fomc") || kind === "beige-book") {
    return "border-desk-gold/40 bg-desk-gold/15 text-desk-gold";
  }
  return "border-border bg-muted text-muted-foreground";
}

export function absFederalReserve(href: string): string | null {
  const trimmed = href.trim();
  let url: URL;
  try {
    if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) url = new URL(trimmed);
    else if (trimmed.startsWith("//")) url = new URL(`https:${trimmed}`);
    else if (trimmed.startsWith("/")) url = new URL(`https://www.federalreserve.gov${trimmed}`);
    else return null;
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.hostname !== "www.federalreserve.gov" && url.hostname !== "federalreserve.gov") return null;
  url.hostname = "www.federalreserve.gov";
  return url.toString();
}

export function absBea(href: string): string | null {
  try {
    const url = href.startsWith("http") ? new URL(href) : new URL(href, "https://www.bea.gov");
    if (url.protocol !== "https:" || url.hostname !== "www.bea.gov") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export type FedLinkKind =
  | "statement-pdf"
  | "statement-html"
  | "implementation"
  | "minutes-pdf"
  | "minutes-html"
  | "sep-pdf"
  | "sep-html"
  | "press"
  | "other";

export function classifyFedLink(url: string): FedLinkKind {
  const u = url.toLowerCase();
  if (u.includes("fomcminutes") && u.endsWith(".pdf")) return "minutes-pdf";
  if (u.includes("fomcminutes")) return "minutes-html";
  if (u.includes("fomcprojtabl") && u.endsWith(".pdf")) return "sep-pdf";
  if (u.includes("fomcprojtabl")) return "sep-html";
  if (u.includes("fomcpresconf") || u.includes("fomcpressconf")) return "press";
  if (/monetary\d{8}a1\.pdf/.test(u)) return "statement-pdf";
  if (/monetary\d{8}a1\.htm/.test(u)) return "implementation";
  if (/monetary\d{8}a\.htm/.test(u)) return "statement-html";
  return "other";
}

export type FomcMeeting = {
  year: number;
  month: string;
  dateRaw: string;
  iso: string | null;
  dateLabel: string;
  links: { url: string; kind: FedLinkKind }[];
};

export function parseFomcCalendar(html: string): FomcMeeting[] {
  const out: FomcMeeting[] = [];
  const re = /<h4[^>]*>[\s\S]*?(20\d\d)\s+FOMC Meetings[\s\S]*?<\/h4>/gi;
  const marks: { year: number; contentStart: number; headingStart: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    marks.push({
      year: Number(m[1]),
      headingStart: m.index,
      contentStart: m.index + m[0].length,
    });
  }
  for (let i = 0; i < marks.length; i++) {
    const end = marks[i + 1]?.headingStart ?? html.length;
    const chunk = html.slice(marks[i]!.contentStart, end);
    for (const block of chunk.split("fomc-meeting__month").slice(1)) {
      const month = block.match(/<strong>([A-Za-z]+)<\/strong>/)?.[1];
      const dateRaw = block.match(/fomc-meeting__date[^>]*>([^<]+)/)?.[1]?.replace(/\s+/g, " ").trim();
      if (!month || !dateRaw) continue;
      const dayNums = dateRaw.match(/\d{1,2}/g)?.map(Number) ?? [];
      const endDay = dayNums.length ? dayNums[dayNums.length - 1]! : null;
      const iso = endDay != null ? isoFromParts(marks[i]!.year, month, endDay) : null;
      const links: FomcMeeting["links"] = [];
      for (const href of block.matchAll(/href="([^"]+)"/g)) {
        const url = absFederalReserve(href[1] ?? "");
        if (!url) continue;
        const kind = classifyFedLink(url);
        if (kind === "other") continue;
        if (!links.some((l) => l.url === url)) links.push({ url, kind });
      }
      const star = dateRaw.includes("*");
      out.push({
        year: marks[i]!.year,
        month,
        dateRaw,
        iso,
        dateLabel: `${month} ${dateRaw.replace(/\*/g, "").trim()}, ${marks[i]!.year}${star ? " (* as printed on the FOMC calendar)" : ""}`,
        links,
      });
    }
  }
  return out;
}

export type BeigeRow = {
  year: number;
  label: string;
  iso: string | null;
  htmlUrl: string | null;
  pdfUrl: string | null;
  scheduledOnly: boolean;
};

export function parseBeigeIndex(html: string): BeigeRow[] {
  const out: BeigeRow[] = [];
  const parts = html.split(/<th[^>]*id="year"[^>]*>/i);
  for (const part of parts.slice(1)) {
    const year = Number(part.match(/^\s*(20\d\d)/)?.[1]);
    if (!year) continue;
    const body = part.split(/<th[^>]*id="year"/i)[0] ?? part;
    for (const row of body.matchAll(/<td>([\s\S]*?)<\/td>/gi)) {
      const inner = row[1] ?? "";
      const label = decodeEntities(inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim();
      if (!label || !/^[A-Za-z]+\s+\d{1,2}/.test(label)) continue;
      const month = label.match(/^([A-Za-z]+)/)?.[1] ?? "";
      const day = Number(label.match(/^[A-Za-z]+\s+(\d{1,2})/)?.[1]);
      const dateLabel = label.match(/^([A-Za-z]+\s+\d{1,2})/)?.[1] ?? label;
      const links = [...inner.matchAll(/href="([^"]+)"/g)]
        .map((h) => absFederalReserve(h[1] ?? ""))
        .filter((u): u is string => Boolean(u));
      out.push({
        year,
        label: dateLabel,
        iso: isoFromParts(year, month, day),
        htmlUrl: links.find((u) => /beigebook/i.test(u) && /\.htm/i.test(u)) ?? null,
        pdfUrl: links.find((u) => /beigebook/i.test(u) && /\.pdf/i.test(u)) ?? null,
        scheduledOnly: links.length === 0,
      });
    }
  }
  return out;
}

export type BeaRelease = { url: string; title: string };

export function parseBeaCurrentReleases(html: string): BeaRelease[] {
  const out: BeaRelease[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(/href="(\/news\/20\d\d\/[^"#]+)"[^>]*>([^<]+)/gi)) {
    const url = absBea(m[1] ?? "");
    const title = decodeEntities((m[2] ?? "").replace(/\s+/g, " ")).trim();
    if (!url || title.length < 8 || seen.has(url)) continue;
    seen.add(url);
    out.push({ url, title });
  }
  return out;
}

export type BeaScheduleRow = {
  iso: string | null;
  dateLabel: string;
  timeLabel: string | null;
  title: string;
};

export function parseBeaSchedule(html: string): BeaScheduleRow[] {
  const year = Number(html.match(/Year\s+(20\d\d)/)?.[1]);
  if (!year) return [];
  const out: BeaScheduleRow[] = [];
  const re =
    /class="release-date">\s*([A-Za-z]+\s+\d{1,2})\s*<\/div>\s*<small[^>]*>\s*([^<]*)<\/small>[\s\S]*?class="release-title[^"]*"[^>]*>([\s\S]*?)<\/td>/gi;
  for (const m of html.matchAll(re)) {
    const dateLabel = (m[1] ?? "").trim();
    const timeLabel = (m[2] ?? "").replace(/\s+/g, " ").trim() || null;
    const title = decodeEntities((m[3] ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim();
    const month = dateLabel.match(/^([A-Za-z]+)/)?.[1] ?? "";
    const day = Number(dateLabel.match(/(\d{1,2})$/)?.[1]);
    if (!title) continue;
    out.push({
      iso: isoFromParts(year, month, day),
      dateLabel: `${dateLabel}, ${year}`,
      timeLabel,
      title,
    });
  }
  return out;
}

const BOILER =
  /official website|skip to main|media inquiries|subscribe to (rss|email)|share sensitive information|an official website of the united states|back to home|the central bank of the united states/i;

export function linesFromHtml(html: string, limit = 120_000): string[] {
  const cut = html.slice(0, limit);
  const stripped = cut
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|li|h1|h2|h3|td)>/gi, "\n");
  const text = decodeEntities(stripped.replace(/<[^>]+>/g, " "));
  return text
    .split(/\n+/)
    .map((l) => l.replace(/[ \t\f\v]+/g, " ").trim())
    .filter((l) => l.length > 0);
}

export function articleLines(html: string): string[] {
  const start = html.search(/id="article"/i);
  const slice = start >= 0 ? html.slice(start, start + 100_000) : html.slice(0, 100_000);
  const end = slice.search(/id="lastUpdate"/i);
  return linesFromHtml(end > 0 ? slice.slice(0, end) : slice);
}

function clipLine(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const dot = cut.lastIndexOf(". ");
  if (dot > 80) return cut.slice(0, dot + 1);
  return `${cut.replace(/\s+\S*$/, "")}…`;
}

export function usefulLines(lines: string[], min = 70, max = 420): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    if (line.length < min || line.length > 900) continue;
    if (BOILER.test(line)) continue;
    const clipped = clipLine(line, max);
    const key = clipped.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clipped);
  }
  return out;
}

export function factLines(lines: string[]): string[] {
  const useful = usefulLines(lines, 40, 380);
  const facts = useful.filter((l) =>
    /\$|\bpercent\b|revenue|margin|income|earnings|dividend|outlook|billion|million|employment|inflation|gdp|price|committee|target range/i.test(
      l,
    ),
  );
  return (facts.length >= 4 ? facts : useful).slice(0, 8);
}

export function riskLines(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of usefulLines(lines, 40, 380)) {
    if (!/risk|uncertain|not assuming|downside|elevated|geopolitical/i.test(line)) continue;
    out.push(line);
    if (out.length >= 3) break;
  }
  return out;
}

export function rateSentence(text: string): string | null {
  const m = text.match(/target range for the federal funds rate[^.]{0,240}\./i);
  return m ? m[0].replace(/\s+/g, " ").trim() : null;
}

export type XbrlFact = {
  start?: string;
  end?: string;
  val?: number;
  accn?: string;
  fy?: number;
  fp?: string;
  form?: string;
  filed?: string;
  frame?: string;
};

export function framedAnnualFacts(facts: XbrlFact[]): XbrlFact[] {
  const framed = facts.filter(
    (f) =>
      typeof f.end === "string" &&
      typeof f.val === "number" &&
      Number.isFinite(f.val) &&
      f.form === "10-K" &&
      f.fp === "FY" &&
      typeof f.frame === "string" &&
      /^CY\d{4}$/.test(f.frame),
  );
  const byFrame = new Map<string, XbrlFact>();
  for (const f of framed) {
    const prev = byFrame.get(f.frame!);
    if (!prev || (f.filed ?? "") >= (prev.filed ?? "")) byFrame.set(f.frame!, f);
  }
  return [...byFrame.values()].sort((a, b) => (a.end! < b.end! ? -1 : a.end! > b.end! ? 1 : 0));
}

export function framedQuarterlyFacts(facts: XbrlFact[]): XbrlFact[] {
  const framed = facts.filter(
    (f) =>
      typeof f.end === "string" &&
      typeof f.val === "number" &&
      Number.isFinite(f.val) &&
      (f.form === "10-Q" || f.form === "10-K") &&
      typeof f.fp === "string" &&
      /^Q[1-4]$/.test(f.fp) &&
      typeof f.frame === "string" &&
      /^CY\d{4}Q[1-4]$/.test(f.frame),
  );
  const byFrame = new Map<string, XbrlFact>();
  for (const f of framed) {
    const prev = byFrame.get(f.frame!);
    if (!prev || (f.filed ?? "") >= (prev.filed ?? "")) byFrame.set(f.frame!, f);
  }
  return [...byFrame.values()].sort((a, b) => (a.end! < b.end! ? -1 : a.end! > b.end! ? 1 : 0));
}

export function formatXbrlNumber(n: number): string {
  if (!Number.isFinite(n)) return "";
  if (Number.isInteger(n)) return n.toLocaleString("en-US");
  return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

export function priorFact(facts: XbrlFact[], latest: XbrlFact): XbrlFact | null {
  const idx = facts.findIndex((f) => f.frame === latest.frame && f.end === latest.end);
  if (idx > 0) return facts[idx - 1] ?? null;
  return null;
}

export function filingArchiveUrl(accession: string, primaryDocument: string): string | null {
  if (!/^\d{10}-\d{2}-\d{6}$/.test(accession)) return null;
  if (!primaryDocument || primaryDocument.includes("..") || primaryDocument.startsWith("/")) return null;
  const cik = String(Number(accession.slice(0, 10)));
  if (!cik || cik === "NaN") return null;
  return `https://www.sec.gov/Archives/edgar/data/${cik}/${accession.replace(/-/g, "")}/${primaryDocument}`;
}

export function filingIndexUrl(accession: string): string | null {
  if (!/^\d{10}-\d{2}-\d{6}$/.test(accession)) return null;
  const cik = String(Number(accession.slice(0, 10)));
  return `https://www.sec.gov/Archives/edgar/data/${cik}/${accession.replace(/-/g, "")}/${accession}-index.html`;
}

export function parseForm4Owner(html: string): string | null {
  const m = html.match(/browse-edgar\?action=getcompany[^>]*>([^<]{2,80})</i);
  if (!m?.[1]) return null;
  const name = decodeEntities(m[1]).replace(/\s+/g, " ").trim();
  return name || null;
}

export function tradesFromLines(lines: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < lines.length; i++) {
    const date = lines[i] ?? "";
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) continue;
    const security = [...lines.slice(Math.max(0, i - 3), i)]
      .reverse()
      .find((l) => /stock|share|option|unit/i.test(l));
    if (!security) continue;
    const window = lines.slice(i + 1, i + 9);
    const code = window.find((l) => /^[ASFMPGCD]$/.test(l));
    const amount = window.find((l) => /^[\d,]{2,}$/.test(l));
    const side = window.find((l) => l === "A" || l === "D");
    const price = window.find((l) => /^[\d,]+\.\d+$/.test(l));
    if (!code || !amount) continue;
    const sentence = `${security}: ${date}, transaction code ${code}, ${amount} shares${
      side ? `, ${side === "A" ? "acquired (A)" : "disposed (D)"}` : ""
    }${price ? `, price ${price} as printed` : ""}.`;
    if (seen.has(sentence)) continue;
    seen.add(sentence);
    out.push(sentence);
    if (out.length >= 4) break;
  }
  return out;
}

export type PolicyTag = "rates" | "inflation" | "labor" | "growth" | "industry";

export function policyTagsForSic(sic: string): PolicyTag[] {
  const s = sic.toLowerCase();
  const tags = new Set<PolicyTag>(["growth"]);
  if (/bank|credit|depository|insurance|mortgage|reit|real estate/.test(s)) tags.add("rates");
  if (/retail|apparel|restaurant|food|beverage|consumer|automotive|auto dealer/.test(s)) {
    tags.add("inflation");
  }
  if (/oil|gas|petroleum|energy|coal|mining|chemical/.test(s)) tags.add("inflation");
  if (/semiconductor|electronic|computer|software|pharmaceutical|biological|medical/.test(s)) {
    tags.add("industry");
  }
  tags.add("labor");
  return [...tags];
}

export function kindPolicyTag(kind: ReportKind, title: string): PolicyTag {
  if (kind.startsWith("fomc")) return "rates";
  if (kind === "beige-book") return "growth";
  if (kind === "industry") return "industry";
  if (kind === "bls-series") {
    if (/CUUR|WPSFD|cpi|ppi/i.test(title)) return "inflation";
    return "labor";
  }
  if (/personal income|outlays|pce/i.test(title)) return "inflation";
  if (/industr/i.test(title)) return "industry";
  return "growth";
}

export function emptyReport(
  partial: Pick<OfficialReport, "id" | "title" | "kind"> & Partial<OfficialReport>,
): OfficialReport {
  return {
    titleKo: partial.title,
    badge: partial.kind,
    badgeKo: partial.kind,
    sourceClass: "official",
    sourceName: "Official source",
    publishedAt: null,
    tickers: [],
    sectors: [],
    url: null,
    pdfUrl: null,
    indexUrl: null,
    accession: null,
    summaryStatus: "not-retrieved",
    summaryLabel: null,
    bottomLine: null,
    bullets: [],
    keyFigures: [],
    whatChanged: null,
    risks: [],
    implications: null,
    nextWatch: null,
    notes: [],
    ...partial,
  };
}
