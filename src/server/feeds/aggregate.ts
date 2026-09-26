/**
 * Feed aggregation (B0.7 / F8.1): fan out to registry sources under an 8 s
 * budget, then merge → cluster → score → sort newest first → page.
 */
import { SOURCE_REGISTRY } from "@/server/feeds/registry";
import { runSources, type RunResult } from "@/server/feeds/adapters";
import { clusterItems } from "@/lib/feed/cluster";
import { scoreImportance } from "@/lib/feed/importance";
import { pageAfterCursor, sortNewestFirst } from "@/lib/feed/sort";
import type { FeedItem, FeedPage, FeedSourceResult, ItemKind, Region } from "@/lib/feed/types";

export const FEED_SOURCES: Record<Region, string[]> = {
  KR: [
    "naver-flash",
    "naver-main",
    "naver-focus-401",
    "naver-focus-402",
    "naver-focus-404",
    "naver-focus-406",
    "naver-focus-429",
    "hankyung-finance",
    "hankyung-economy",
    "yonhap-market",
    "yonhap-economy",
    "mk-rss",
    "gn-kr-market",
    "krx-disclosures",
    "kis-news-title",
  ],
  US: [
    "bloomberg-markets",
    "bloomberg-economics",
    "bloomberg-technology",
    "bloomberg-politics",
    "bloomberg-wealth",
    "gn-bloomberg",
    "naver-worldnews",
    "naver-focus-403",
    "fed-press",
    "sec-8k-atom",
    "finviz-ratings",
    "cnbc-rss",
    "marketwatch-rss",
    "yahoo-finance-rss",
    "gn-us-market",
    "finnhub-news",
  ],
  GLOBAL: [],
};
FEED_SOURCES.GLOBAL = [...FEED_SOURCES.KR, ...FEED_SOURCES.US, "hankyung-international"];

const KIND_BY_ID = new Map(SOURCE_REGISTRY.map((s) => [s.id, s.kind]));

export interface FeedQuery {
  regions: Region[];
  kinds?: ItemKind[];
  topics?: string[];
  tickers?: string[];
  cursor?: string | null;
  limit?: number;
  /** Extra source ids (e.g. robotics/etf groups). */
  sourceIds?: string[];
  budgetMs?: number;
  now?: number;
}

function sourceIdsFor(q: FeedQuery): string[] {
  const ids = new Set<string>(q.sourceIds ?? []);
  if (!q.sourceIds?.length) for (const r of q.regions) for (const id of FEED_SOURCES[r]) ids.add(id);
  const kinds = new Set(q.kinds ?? []);
  return [...ids].filter((id) => !kinds.size || kinds.has(KIND_BY_ID.get(id) ?? "news"));
}

export function sourceResults(results: RunResult[]): FeedSourceResult[] {
  return results.map((r) => ({
    id: r.id,
    ok: r.state === "ok" || r.state === "empty",
    count: r.items.length,
    state: r.state === "no-adapter" ? "error" : r.state,
  }));
}

const aggCache = new Map<string, { at: number; items: FeedItem[]; sources: FeedSourceResult[]; partial: boolean; generatedAt: string }>();
const AGG_TTL_MS = 15_000;

/** Merge + cluster + score + sort (full list, newest first). */
export async function collectFeed(q: FeedQuery): Promise<{ items: FeedItem[]; sources: FeedSourceResult[]; partial: boolean; generatedAt: string }> {
  const ids = sourceIdsFor(q).sort();
  const key = ids.join(",");
  const hit = aggCache.get(key);
  const now = q.now ?? Date.now();
  if (hit && now - hit.at < AGG_TTL_MS) return hit;
  const { results, partial } = await runSources(ids, { budgetMs: q.budgetMs ?? 7_500, perSourceMs: 7_000, now });
  const merged = results.flatMap((r) => r.items);
  const clustered = clusterItems(merged).map((it) => ({ ...it, importance: scoreImportance(it, { now }) }));
  const out = {
    at: now,
    items: sortNewestFirst(clustered),
    sources: sourceResults(results),
    partial,
    generatedAt: new Date(now).toISOString(),
  };
  aggCache.set(key, out);
  if (aggCache.size > 40) aggCache.delete(aggCache.keys().next().value!);
  return out;
}

export async function aggregateFeed(q: FeedQuery): Promise<FeedPage> {
  const all = await collectFeed(q);
  const topics = new Set(q.topics ?? []);
  const tickers = new Set((q.tickers ?? []).map((t) => t.toUpperCase()));
  const filtered = all.items.filter((it) => {
    if (topics.size && !it.topics.some((t) => topics.has(t))) return false;
    if (tickers.size && !it.tickers.some((t) => tickers.has(t.code.toUpperCase()) || tickers.has(`${t.market}:${t.code}`.toUpperCase()))) return false;
    return true;
  });
  const page = pageAfterCursor(filtered, q.cursor ?? null, Math.min(Math.max(q.limit ?? 50, 1), 200));
  return { items: page.items, nextCursor: page.nextCursor, partial: all.partial, sources: all.sources, generatedAt: all.generatedAt };
}
