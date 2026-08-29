import { useQuery } from "@tanstack/react-query";
import {
  getMarketQuotes,
  getStockBundle,
  getChartData,
  getMarketIndices,
  getResearchPdf,
  getResearchDesk,
  getIndustryResearch,
  getEtfMarket,
  getEtfListingNews,
  getEtfBundle,
  getUsLinkDesk,
  getSecuritySearch,
  getQuotesByCodes,
} from "@/lib/market-fns";
import type { ChartInterval, MinuteSize, LiveQuote } from "@/server/naver-market";
import type { SectorId } from "@/data/types";
import { normalizeKrTicker, isKrTicker, isDigitTicker } from "@/lib/infer-sector";
import type { EtfMarketBucket } from "@/server/etf-market";
import { UNIVERSE } from "@/data/universe";
import { US_LINKED_CODES } from "@/data/us-link";

/** Coverage-universe snapshot quotes (Naver). KIS ticks overlay via useMarketStream. */
export function useMarketQuotes(refetchMs = 45_000) {
  return useQuery({
    queryKey: ["market-quotes"],
    queryFn: () => getMarketQuotes(),
    staleTime: 40_000,
    refetchInterval: refetchMs,
    refetchOnWindowFocus: false,
  });
}

export function useQuoteMap() {
  const q = useMarketQuotes();
  const map = new Map<string, LiveQuote>();
  for (const quote of q.data?.quotes ?? []) {
    map.set(quote.code, quote);
  }
  return { ...q, map };
}

export function useSectorStocks(sectorId: SectorId) {
  const { map, ...rest } = useQuoteMap();
  const list =
    sectorId === "us-linked"
      ? US_LINKED_CODES.map((c) => UNIVERSE.find((u) => u.code === c)).filter(
          (u): u is (typeof UNIVERSE)[number] => Boolean(u),
        )
      : UNIVERSE.filter((u) => u.sectorId === sectorId);
  const stocks = list.map((u) => {
    const q = map.get(u.code);
    return {
      ...u,
      price: q?.price ?? null,
      change: q?.change ?? null,
      changePct: q?.changePct ?? null,
      volume: q?.volume ?? null,
      marketCap: q?.marketCap ?? null,
      high52: q?.high52 ?? null,
      low52: q?.low52 ?? null,
      quote: q ?? null,
    };
  });
  return { stocks, ...rest };
}

export function useStockBundle(code: string) {
  const padded = normalizeKrTicker(code);
  return useQuery({
    queryKey: ["stock-bundle", padded],
    queryFn: () => getStockBundle({ data: { code: padded } }),
    staleTime: 25_000,
    refetchInterval: 45_000,
    refetchOnWindowFocus: false,
    enabled: isDigitTicker(padded),
  });
}

export function useChartData(opts: {
  code: string;
  market: "KOSPI" | "KOSDAQ";
  interval: ChartInterval;
  minuteSize?: MinuteSize;
  range?: string;
  enabled?: boolean;
}) {
  const code = normalizeKrTicker(opts.code);
  return useQuery({
    queryKey: [
      "chart",
      code,
      opts.market,
      opts.interval,
      opts.minuteSize ?? 1,
      opts.range ?? "default",
    ],
    queryFn: () =>
      getChartData({
        data: {
          code,
          market: opts.market,
          interval: opts.interval,
          minuteSize: opts.minuteSize,
          range: opts.range,
        },
      }),
    staleTime: opts.interval === "minute" ? 15_000 : 60_000,
    enabled: (opts.enabled ?? true) && isKrTicker(code),
    refetchOnWindowFocus: false,
  });
}

export function useMarketIndices() {
  return useQuery({
    queryKey: ["market-indices"],
    queryFn: () => getMarketIndices(),
    staleTime: 20_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useResearchPdf(
  researchId: number | undefined,
  category?: "company" | "industry" | "market" | "economy",
) {
  return useQuery({
    queryKey: ["research-pdf", researchId, category],
    queryFn: () =>
      getResearchPdf({
        data: { researchId: researchId!, category },
      }),
    enabled: researchId != null,
    staleTime: 10 * 60_000,
  });
}

export function useResearchDesk(opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["research-desk"],
    queryFn: () => getResearchDesk(),
    staleTime: 5 * 60_000,
    enabled: opts?.enabled ?? true,
    refetchOnWindowFocus: false,
  });
}

export function useIndustryResearch(sectorId?: string) {
  return useQuery({
    queryKey: ["industry-research", sectorId],
    queryFn: () => getIndustryResearch({ data: { sectorId: sectorId! } }),
    enabled: Boolean(sectorId),
    staleTime: 3 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useEtfMarket(opts: {
  bucket?: EtfMarketBucket;
  q?: string;
  limit?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["etf-market", opts.bucket ?? "all", opts.q ?? "", opts.limit ?? 100],
    queryFn: () =>
      getEtfMarket({
        data: {
          bucket: opts.bucket,
          q: opts.q,
          limit: opts.limit,
        },
      }),
    staleTime: 45_000,
    enabled: opts.enabled ?? true,
    refetchOnWindowFocus: false,
  });
}

export function useEtfListingNews(opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["etf-listing-news"],
    queryFn: () => getEtfListingNews(),
    staleTime: 5 * 60_000,
    enabled: opts?.enabled ?? true,
    refetchOnWindowFocus: false,
  });
}

export function useEtfBundle(code: string) {
  const normalized = normalizeKrTicker(code);
  return useQuery({
    queryKey: ["etf-bundle", normalized],
    queryFn: () => getEtfBundle({ data: { code: normalized } }),
    staleTime: 30_000,
    enabled: isKrTicker(normalized),
    refetchOnWindowFocus: false,
  });
}

export function useUsLinkDesk() {
  return useQuery({
    queryKey: ["us-link-desk"],
    queryFn: () => getUsLinkDesk(),
    staleTime: 90_000,
    refetchInterval: 180_000,
    refetchOnWindowFocus: false,
  });
}

export function useSecuritySearch(q: string) {
  const needle = q.trim();
  return useQuery({
    queryKey: ["security-search", needle],
    queryFn: () => getSecuritySearch({ data: { q: needle } }),
    enabled: needle.length >= 1,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useQuotesByCodes(codes: string[]) {
  const key = [...codes].sort().join(",");
  return useQuery({
    queryKey: ["quotes-by-codes", key],
    queryFn: () => getQuotesByCodes({ data: { codes } }),
    enabled: codes.length > 0,
    staleTime: 30_000,
  });
}
