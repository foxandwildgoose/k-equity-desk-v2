import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { inferMarket, inferSectorId } from "@/lib/infer-sector";
import { UNIVERSE } from "@/data/universe";
import { matchesSearchQuery, rankByQuery, scoreSearchHit } from "@/lib/search-match";

const UA = "Mozilla/5.0 KoreaEquityCommand/1.0";

export interface ListedSearchHit {
  code: string;
  nameKo: string;
  nameEn: string;
  market: "KOSPI" | "KOSDAQ";
  sectorId: import("@/data/types").SectorId;
  isEtf: boolean;
  source: "naver-autocomplete" | "universe";
}

async function naverAutoComplete(query: string): Promise<ListedSearchHit[]> {
  const url = `https://m.stock.naver.com/front-api/search/autoComplete?query=${encodeURIComponent(query)}&target=stock`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8_000);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
        Referer: "https://m.stock.naver.com/",
      },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = (await res.json()) as {
      result?: {
        items?: {
          code?: string;
          name?: string;
          typeCode?: string;
          typeName?: string;
          isEtf?: boolean;
          nationCode?: string;
        }[];
      };
    };
    const out: ListedSearchHit[] = [];
    for (const it of j.result?.items ?? []) {
      if (it.nationCode && it.nationCode !== "KOR") continue;
      const code = String(it.code ?? "").trim();
      if (!/^\d{6}$/.test(code)) continue;
      const nameKo = String(it.name ?? "").trim();
      if (!nameKo) continue;
      out.push({
        code,
        nameKo,
        nameEn: nameKo,
        market: inferMarket(it.typeCode, it.typeName),
        sectorId: inferSectorId(nameKo),
        isEtf: Boolean(it.isEtf),
        source: "naver-autocomplete",
      });
    }
    return out;
  } finally {
    clearTimeout(t);
  }
}

function universeHits(query: string): ListedSearchHit[] {
  const hits = UNIVERSE.filter((x) =>
    matchesSearchQuery(query, [x.nameKo, x.nameEn, x.code]),
  );
  return rankByQuery(hits, query, (x) => ({ name: x.nameKo, code: x.code })).map(
    (x) => ({
      code: x.code,
      nameKo: x.nameKo,
      nameEn: x.nameEn,
      market: x.market,
      sectorId: x.sectorId,
      isEtf: false,
      source: "universe" as const,
    }),
  );
}

export async function searchListedSecurities(query: string): Promise<ListedSearchHit[]> {
  const q = query.trim();
  if (q.length < 1) return [];
  const local = universeHits(q);
  const remote = await naverAutoComplete(q).catch(() => [] as ListedSearchHit[]);
  const byCode = new Map<string, ListedSearchHit>();
  for (const h of [...remote, ...local]) {
    const prev = byCode.get(h.code);
    if (!prev || h.source === "naver-autocomplete") byCode.set(h.code, h);
  }
  // 6-digit code typed but missing from both
  if (/^\d{6}$/.test(q) && !byCode.has(q)) {
    byCode.set(q, {
      code: q,
      nameKo: q,
      nameEn: q,
      market: "KOSPI",
      sectorId: "electronics",
      isEtf: false,
      source: "universe",
    });
  }
  return [...byCode.values()]
    .sort(
      (a, b) =>
        scoreSearchHit(q, b.nameKo, b.code) - scoreSearchHit(q, a.nameKo, a.code),
    )
    .slice(0, 24);
}

export const getSecuritySearch = createServerFn({ method: "GET" })
  .validator(z.object({ q: z.string().min(1).max(80) }))
  .handler(async ({ data }) => {
    const hits = await searchListedSecurities(data.q);
    return {
      q: data.q,
      hits,
      fetchedAt: new Date().toISOString(),
      source: "Naver stock autocomplete + desk universe",
    };
  });
