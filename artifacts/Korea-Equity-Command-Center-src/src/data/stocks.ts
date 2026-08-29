/**
 * Stock universe accessors. Prices are NOT stored here —
 * load live quotes via getMarketQuotes / useMarketQuotes.
 */
import { UNIVERSE, UNIVERSE_BY_CODE, type UniverseItem } from "./universe";
import type { SectorId, Stock } from "./types";
import type { LiveQuote } from "@/server/naver-market";
import { US_LINKED_CODES } from "./us-link";
import { matchesSearchQuery, rankByQuery } from "@/lib/search-match";
import { SECTOR_BY_ID } from "./sectors";

export { UNIVERSE, UNIVERSE_BY_CODE };
export type { UniverseItem };

export function normalizeCode(code: string): string {
  const digits = code.replace(/\D/g, "");
  return digits.padStart(6, "0");
}

export function getUniverseItem(code: string): UniverseItem | undefined {
  return UNIVERSE_BY_CODE[normalizeCode(code)];
}

export function stocksBySector(sectorId: SectorId | string): UniverseItem[] {
  if (sectorId === "us-linked") {
    return US_LINKED_CODES.map((c) => UNIVERSE_BY_CODE[c]).filter(
      Boolean,
    ) as UniverseItem[];
  }
  return UNIVERSE.filter((s) => s.sectorId === sectorId);
}

export const getStocksBySector = stocksBySector;

export function searchUniverse(q: string): UniverseItem[] {
  const s = q.trim();
  if (!s) return [];
  const hits = UNIVERSE.filter((x) =>
    matchesSearchQuery(s, [
      x.nameKo,
      x.nameEn,
      x.code,
      SECTOR_BY_ID[x.sectorId]?.nameKo,
      SECTOR_BY_ID[x.sectorId]?.nameEn,
    ]),
  );
  return rankByQuery(hits, s, (x) => ({ name: x.nameKo, code: x.code })).slice(
    0,
    20,
  );
}

export function searchEtfs(q: string): { code: string; nameKo: string }[] {
  // Live ETF search is handled by useEtfMarket server query; keep stub for command palette fallback.
  void q;
  return [];
}

export const searchStocks = searchUniverse;

export function mergeQuote(
  meta: UniverseItem,
  q: LiveQuote | undefined | null,
): Stock {
  const price = q?.price ?? 0;
  const marketCap = q?.marketCap ?? 0;
  return {
    code: meta.code,
    nameKo: meta.nameKo,
    nameEn: meta.nameEn,
    sectorId: meta.sectorId,
    market: meta.market,
    price,
    change: q?.change ?? 0,
    changePct: q?.changePct ?? 0,
    volume: q?.volume ?? 0,
    marketCap,
    high52: q?.high52 ?? 0,
    low52: q?.low52 ?? 0,
    sparkline: [],
    capBand:
      marketCap >= 100_000 ? "대형" : marketCap >= 20_000 ? "중형" : "소형",
  };
}

export function quoteToStock(q: LiveQuote): Stock {
  return mergeQuote(
    {
      code: q.code,
      nameKo: q.nameKo,
      nameEn: q.nameEn,
      sectorId: q.sectorId,
      market: q.market,
    },
    q,
  );
}

export function marketMoversFromQuotes(
  quotes: LiveQuote[],
  n = 6,
): { gainers: Stock[]; losers: Stock[] } {
  const sorted = [...quotes].filter((q) => q.price > 0);
  const byPct = [...sorted].sort((a, b) => b.changePct - a.changePct);
  return {
    gainers: byPct.slice(0, n).map(quoteToStock),
    losers: [...byPct].reverse().slice(0, n).map(quoteToStock),
  };
}

export function sectorStatsFromQuotes(
  sectorId: string,
  quotes: LiveQuote[],
): {
  count: number;
  avgChangePct: number;
  topGainer: Stock | null;
  topLoser: Stock | null;
} {
  const codes =
    sectorId === "us-linked"
      ? new Set(US_LINKED_CODES)
      : new Set(
          UNIVERSE.filter((u) => u.sectorId === sectorId).map((u) => u.code),
        );
  const list = quotes.filter((q) => codes.has(q.code) && q.price > 0);
  if (!list.length) {
    return { count: 0, avgChangePct: 0, topGainer: null, topLoser: null };
  }
  const avg =
    list.reduce((s, q) => s + q.changePct, 0) / Math.max(1, list.length);
  const sorted = [...list].sort((a, b) => b.changePct - a.changePct);
  return {
    count: list.length,
    avgChangePct: avg,
    topGainer: quoteToStock(sorted[0]!),
    topLoser: quoteToStock(sorted[sorted.length - 1]!),
  };
}
