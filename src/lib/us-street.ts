/**
 * Public Wall Street feeds. Broker PDFs are paywalled, so this module only
 * keeps ratings and headlines that the source page actually published.
 */

export type UsStreetNote = {
  id: string;
  symbol: string;
  broker: string;
  action: string;
  actionKo: string;
  rating: string;
  target: string | null;
  date: string;
  summary: string;
  pageUrl: string;
  sourceLabel: string;
};

export type UsHeadline = {
  id: string;
  symbol: string;
  title: string;
  source: string;
  url: string;
  when: string;
};

export type UsConsensus = {
  symbol: string;
  mean: number | null;
  low: number | null;
  high: number | null;
  buy: number;
  hold: number;
  sell: number;
  summary: string;
  pageUrl: string;
};

export type UsStreetPack = {
  notes: UsStreetNote[];
  headlines: UsHeadline[];
  consensus: UsConsensus[];
  note: string;
  fetchedAt: string;
};

export const US_STREET_SYMBOLS = [
  "NVDA",
  "AAPL",
  "MSFT",
  "AMZN",
  "GOOGL",
  "META",
  "AVGO",
  "TSLA",
  "AMD",
  "TSM",
] as const;

const ANALYST_HEADLINE =
  /upgrade|downgrade|price target|initiates|reiterate|overweight|outperform|underweight|goldman|morgan stanley|jpmorgan|bank of america|barclays|wells fargo|\bubs\b|citi|deutsche|hsbc|jefferies|piper|evercore|cowen|bofa|target price/i;

export function actionKo(action: string): string {
  const a = action.toLowerCase();
  if (a.includes("upgrade")) return "상향";
  if (a.includes("downgrade")) return "하향";
  if (a.includes("initiat")) return "개시";
  if (a.includes("reiterat")) return "유지";
  return action.trim() || "의견";
}

function cleanText(raw: string): string {
  return raw
    .replace(/\\u0026rarr;|\\u0026rArr;|\\u0026amp;/gi, (token) =>
      /amp/i.test(token) ? "\u0026" : "\u2192",
    )
    .replace(/\u0026amp;/gi, "\u0026")
    .replace(/\u0026nbsp;/gi, " ")
    .replace(/\u0026#39;|\u0026apos;/gi, "'")
    .replace(/\u0026quot;/gi, '"')
    .replace(/\u0026rarr;|\u0026rArr;|&#8594;/gi, "\u2192")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isoDate(seconds: number): string | null {
  if (!Number.isFinite(seconds) || seconds < 1_000_000_000) return null;
  const d = new Date(seconds * 1000);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function parseFinvizRatings(html: string, symbol: string): UsStreetNote[] {
  const ticker = symbol.trim().toUpperCase();
  const re = /"dateTimestamp":(\d+),"eventType":"chartEvent\/ratings","ratings":(\[[\s\S]*?\])\}/g;
  const seen = new Set<string>();
  const out: UsStreetNote[] = [];
  for (const match of html.matchAll(re)) {
    const date = isoDate(Number(match[1]));
    if (!date) continue;
    let rows: { action?: string; analyst?: string; rating?: string; targetPrice?: string }[] = [];
    try {
      rows = JSON.parse(match[2]!) as typeof rows;
    } catch {
      continue;
    }
    for (const row of rows) {
      const broker = cleanText(String(row.analyst ?? ""));
      const action = cleanText(String(row.action ?? ""));
      const rating = cleanText(String(row.rating ?? ""));
      if (!broker || !action) continue;
      const target = cleanText(String(row.targetPrice ?? "")) || null;
      const id = `${ticker}|${date}|${broker}|${action}|${rating}`;
      if (seen.has(id)) continue;
      seen.add(id);
      const targetBit = target ? ` 목표가 ${target}.` : " 목표가는 이 행에 없습니다.";
      out.push({
        id,
        symbol: ticker,
        broker,
        action,
        actionKo: actionKo(action),
        rating: rating || "—",
        target,
        date,
        summary: `${broker}가 등급을 ${actionKo(action)}했습니다. 표시된 등급은 ${rating || "미기재"}입니다.${targetBit} 증권사 PDF 원문은 공개되어 있지 않습니다.`,
        pageUrl: `https://finviz.com/quote.ashx?t=${encodeURIComponent(ticker)}`,
        sourceLabel: "Finviz 공개 등급 테이블",
      });
    }
  }
  out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.symbol.localeCompare(b.symbol)));
  return out;
}

export function parseFinvizHeadlines(html: string, symbol: string): UsHeadline[] {
  const ticker = symbol.trim().toUpperCase();
  const re = /<a class="tab-link-news" href="(https?:[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  const out: UsHeadline[] = [];
  const seen = new Set<string>();
  for (const match of html.matchAll(re)) {
    const url = match[1]!;
    const title = cleanText(match[2] ?? "");
    if (!title || !ANALYST_HEADLINE.test(title)) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    const before = html.slice(Math.max(0, match.index! - 280), match.index);
    const when = before.match(/((?:Today|Yesterday)\s+\d{1,2}:\d{2}[AP]M|[A-Z][a-z]{2}-\d{2}-\d{2}\s+\d{1,2}:\d{2}[AP]M)/)?.[1] ?? "";
    out.push({
      id: `${ticker}|${url}`,
      symbol: ticker,
      title,
      source: "기사",
      url,
      when: when || ticker,
    });
    if (out.length >= 6) break;
  }
  return out;
}

function num(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

export function parseNasdaqTarget(json: unknown, symbol: string): UsConsensus | null {
  const ticker = symbol.trim().toUpperCase();
  const root = json && typeof json === "object" ? (json as { data?: { consensusOverview?: Record<string, unknown> } }) : null;
  const overview = root?.data?.consensusOverview;
  if (!overview) return null;
  const mean = num(overview.priceTarget);
  const low = num(overview.lowPriceTarget);
  const high = num(overview.highPriceTarget);
  const buy = num(overview.buy) ?? 0;
  const hold = num(overview.hold) ?? 0;
  const sell = num(overview.sell) ?? 0;
  if (mean == null && buy + hold + sell === 0) return null;
  const meanText = mean == null ? "목표가 평균 없음" : `평균 목표가 $${mean.toFixed(2)}`;
  const rangeText =
    low != null && high != null ? ` (하단 $${low.toFixed(2)} · 상단 $${high.toFixed(2)})` : "";
  return {
    symbol: ticker,
    mean,
    low,
    high,
    buy,
    hold,
    sell,
    summary: `${ticker} ${meanText}${rangeText}. 매수 ${buy} · 보유 ${hold} · 매도 ${sell}. Nasdaq에 모인 공개 추정치이며 개별 투자은행 보고서 전문이 아닙니다.`,
    pageUrl: `https://www.nasdaq.com/market-activity/stocks/${ticker.toLowerCase()}/analyst-research`,
  };
}

export function safeExternalUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

const BROKER_NEEDLES: { test: RegExp; keys: string[] }[] = [
  { test: /j\.?\s*p\.?\s*morgan|jpmorgan|\bjpm\b/i, keys: ["jpmorgan", "jp morgan", "j.p. morgan"] },
  { test: /goldman/i, keys: ["goldman"] },
  { test: /morgan stanley/i, keys: ["morgan stanley"] },
  { test: /bank of america|\bbofa\b|\bb of a\b/i, keys: ["bofa", "bank of america"] },
  { test: /barclays/i, keys: ["barclays"] },
  { test: /wells fargo/i, keys: ["wells fargo"] },
  { test: /citigroup|\bciti\b/i, keys: ["citi", "citigroup"] },
  { test: /\bubs\b/i, keys: ["ubs"] },
  { test: /hsbc/i, keys: ["hsbc"] },
  { test: /jefferies/i, keys: ["jefferies"] },
  { test: /evercore/i, keys: ["evercore"] },
  { test: /deutsche/i, keys: ["deutsche"] },
  { test: /piper/i, keys: ["piper"] },
];

function brokerNeedles(broker: string): string[] {
  const keys = new Set<string>();
  const token = broker
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .find((word) => word.length >= 4);
  if (token) keys.add(token);
  for (const row of BROKER_NEEDLES) {
    if (!row.test.test(broker)) continue;
    for (const key of row.keys) keys.add(key);
  }
  return [...keys];
}

export type StreetOriginal = {
  url: string;
  kind: "article" | "table";
  articleUrl: string | null;
  tableUrl: string;
};

/** Prefer the article that names the broker. The ratings table stays as the second link. */
export function originalUrlForNote(note: UsStreetNote, headlines: UsHeadline[]): StreetOriginal {
  const needles = brokerNeedles(note.broker);
  const article = headlines.find((item) => {
    if (item.symbol !== note.symbol) return false;
    if (!safeExternalUrl(item.url)) return false;
    const title = item.title.toLowerCase();
    return needles.some((needle) => title.includes(needle));
  });
  const tableUrl = note.pageUrl;
  const articleUrl = article ? article.url : null;
  if (articleUrl) return { url: articleUrl, kind: "article", articleUrl, tableUrl };
  return { url: tableUrl, kind: "table", articleUrl: null, tableUrl };
}

const EMPTY_NOTE =
  "미국 투자은행 PDF는 고객에게만 배포됩니다. 여기에는 Finviz에 올라온 등급·목표가 변경과, 제목이 애널리스트 의견인 기사 원문, Nasdaq 컨센서스만 표시합니다. 없는 보고서는 만들지 않습니다.";

export function emptyUsStreetPack(note = EMPTY_NOTE): UsStreetPack {
  return { notes: [], headlines: [], consensus: [], note, fetchedAt: new Date().toISOString() };
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function getText(url: string, headers: HeadersInit): Promise<string | null> {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(12_000) });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

let cache: { rev: string; at: number; data: UsStreetPack } | null = null;
const TTL_MS = 30 * 60 * 1000;
const CACHE_REV = "entities-2";

type SymbolPage = {
  notes: UsStreetNote[];
  headlines: UsHeadline[];
  consensus: UsConsensus | null;
};

async function loadSymbolPage(symbol: string): Promise<SymbolPage> {
  const ticker = symbol.trim().toUpperCase();
  const [html, target] = await Promise.all([
    getText(`https://finviz.com/quote.ashx?t=${encodeURIComponent(ticker)}`, {
      "User-Agent": UA,
      Accept: "text/html",
    }),
    getText(`https://api.nasdaq.com/api/analyst/${encodeURIComponent(ticker)}/targetprice`, {
      "User-Agent": UA,
      Accept: "application/json",
      Origin: "https://www.nasdaq.com",
      Referer: "https://www.nasdaq.com/",
    }),
  ]);
  let consensus: UsConsensus | null = null;
  if (target) {
    try {
      consensus = parseNasdaqTarget(JSON.parse(target) as unknown, ticker);
    } catch {
      consensus = null;
    }
  }
  return {
    notes: html ? parseFinvizRatings(html, ticker) : [],
    headlines: html ? parseFinvizHeadlines(html, ticker) : [],
    consensus,
  };
}

function packFromPages(pages: SymbolPage[], emptyNote: string): UsStreetPack {
  const notes = pages
    .flatMap((page) => page.notes)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.symbol.localeCompare(b.symbol)))
    .slice(0, 60);
  const headlines = pages.flatMap((page) => page.headlines).slice(0, 40);
  const consensus = pages.flatMap((page) => (page.consensus ? [page.consensus] : []));
  return {
    notes,
    headlines,
    consensus,
    note: notes.length || headlines.length || consensus.length ? EMPTY_NOTE : emptyNote,
    fetchedAt: new Date().toISOString(),
  };
}

const symbolCache = new Map<string, { rev: string; at: number; data: UsStreetPack }>();

export async function fetchUsStreetSymbol(symbol: string): Promise<UsStreetPack> {
  const ticker = symbol.trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9.]{0,9}$/.test(ticker) || ticker.startsWith(".") || ticker.endsWith(".")) {
    return emptyUsStreetPack("미국 티커로 읽지 못했습니다. 등급을 추정해 채우지 않습니다.");
  }
  const now = Date.now();
  const hit = symbolCache.get(ticker);
  if (hit && hit.rev === CACHE_REV && now - hit.at < TTL_MS) return hit.data;
  const page = await loadSymbolPage(ticker);
  const data = packFromPages(
    [page],
    `${ticker}의 공개 등급·컨센서스를 받지 못했습니다. 없는 보고서는 만들지 않습니다.`,
  );
  if (page.notes.length || page.consensus) symbolCache.set(ticker, { rev: CACHE_REV, at: now, data });
  return data;
}

export async function fetchUsStreetPack(): Promise<UsStreetPack> {
  const now = Date.now();
  if (cache && cache.rev === CACHE_REV && now - cache.at < TTL_MS) return cache.data;
  const pages = await Promise.all(US_STREET_SYMBOLS.map((symbol) => loadSymbolPage(symbol)));
  const data = packFromPages(pages, "월가 공개 피드를 받지 못했습니다. 등급을 추정해 채우지 않습니다.");
  if (data.notes.length || data.consensus.length) cache = { rev: CACHE_REV, at: now, data };
  return data;
}
