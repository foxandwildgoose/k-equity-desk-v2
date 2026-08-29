/**
 * New-listing ETF news — Google News RSS (no API key).
 * Goal: surface listing / listing-scheduled stories before the product is already on the tape.
 */
import { fetchGoogleNewsRss } from "@/server/us-link-feed";
import { fetchAllEtfs, type LiveEtfRow } from "@/server/etf-market";

export type EtfListingNewsItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  datetime: string;
  summary?: string;
  matchedCode?: string;
  matchedName?: string;
  stage: "listed" | "scheduled" | "other";
};

const QUERIES = [
  "ETF 신규 상장",
  "ETF 상장예정",
  "한국거래소 ETF 상장",
  "ACE OR TIGER OR KODEX OR PLUS ETF 신규 상장",
];

function stageOf(title: string): EtfListingNewsItem["stage"] {
  if (/상장\s*예정|상장예고|예고|다음주 상장|금주 상장|28일 상장|일 상장 예정/.test(title)) {
    return "scheduled";
  }
  if (/신규\s*상장|상장했|상장한|유가증권시장 상장|신규상장/.test(title)) {
    return "listed";
  }
  return "other";
}

function isListingStory(title: string): boolean {
  const t = title.replace(/\s+/g, " ");
  if (!/ETF|상장지수/.test(t)) return false;
  if (/상장폐지|상장 폐지/.test(t) && !/신규|예정/.test(t)) return false;
  return /상장|출시|신규상장|상장예정|상장 예고/.test(t);
}

function matchEtf(title: string, etfs: LiveEtfRow[]): LiveEtfRow | undefined {
  const compact = title.replace(/\s+/g, "");
  let best: LiveEtfRow | undefined;
  let bestLen = 0;
  for (const e of etfs) {
    const name = e.nameKo.replace(/\s+/g, "");
    if (name.length < 4) continue;
    if (compact.includes(name) && name.length > bestLen) {
      best = e;
      bestLen = name.length;
    }
  }
  return best;
}

export async function fetchEtfListingNews(limit = 40): Promise<{
  items: EtfListingNewsItem[];
  fetchedAt: string;
  queries: string[];
}> {
  const rssPromise = Promise.all(
    QUERIES.map((q) => fetchGoogleNewsRss(q, 18, "ko").catch(() => [])),
  );
  const etfPromise = fetchAllEtfs().catch(() => [] as LiveEtfRow[]);
  const rssLists = await rssPromise;
  const etfs = await Promise.race([
    etfPromise,
    new Promise<LiveEtfRow[]>((resolve) => setTimeout(() => resolve([]), 5_000)),
  ]);

  const seen = new Set<string>();
  const items: EtfListingNewsItem[] = [];
  for (const list of rssLists) {
    for (const raw of list) {
      if (!isListingStory(raw.title)) continue;
      const key = raw.title.replace(/\s+/g, "").slice(0, 80);
      if (seen.has(key) || seen.has(raw.url)) continue;
      seen.add(key);
      seen.add(raw.url);
      const hit = matchEtf(raw.title, etfs);
      items.push({
        id: raw.id,
        title: raw.title,
        url: raw.url,
        source: raw.source,
        datetime: raw.datetime,
        matchedCode: hit?.code,
        matchedName: hit?.nameKo,
        stage: stageOf(raw.title),
      });
    }
  }

  items.sort((a, b) => {
    const ta = Date.parse(a.datetime) || 0;
    const tb = Date.parse(b.datetime) || 0;
    return tb - ta;
  });

  return {
    items: items.slice(0, limit),
    fetchedAt: new Date().toISOString(),
    queries: QUERIES,
  };
}
