import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { fetchUsdKrw } from "@/server/etf-market";
import { fetchOhlc, fetchRealtimeQuotes } from "@/server/naver-market";
import { UNIVERSE } from "@/data/universe";

export type MacroPoint = { date: string; value: number };

async function yahooMonthly(symbol: string): Promise<MacroPoint[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1mo&range=10y`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 KoreaExportDesk/1.0" },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as {
      chart?: {
        result?: {
          timestamp?: number[];
          indicators?: { quote?: { close?: (number | null)[] }[] };
        }[];
      };
    };
    const r = data.chart?.result?.[0];
    const ts = r?.timestamp ?? [];
    const cl = r?.indicators?.quote?.[0]?.close ?? [];
    const out: MacroPoint[] = [];
    for (let i = 0; i < ts.length; i++) {
      const c = cl[i];
      if (c == null || !Number.isFinite(c)) continue;
      const d = new Date(ts[i]! * 1000 + 9 * 3600 * 1000);
      const date = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      out.push({ date, value: c });
    }
    return out;
  } finally {
    clearTimeout(t);
  }
}

async function naverIndexMonthly(symbol: string): Promise<MacroPoint[]> {
  const url = `https://fchart.stock.naver.com/sise.nhn?symbol=${encodeURIComponent(symbol)}&timeframe=month&count=180&requestType=0`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 KoreaExportDesk/1.0" },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const out: MacroPoint[] = [];
    for (const m of xml.matchAll(/<item data="([^"]+)"/g)) {
      const parts = m[1]!.split("|");
      const ymd = parts[0] ?? "";
      const close = Number(parts[4]);
      if (ymd.length < 8 || !Number.isFinite(close) || close <= 0) continue;
      const date = `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
      out.push({ date, value: close });
    }
    return out;
  } finally {
    clearTimeout(t);
  }
}

export const getExportMacro = createServerFn({ method: "GET" }).handler(async () => {
  const [kospiNaver, kospiYahoo, fxSeries, spotFx] = await Promise.all([
    naverIndexMonthly("KOSPI").catch(() => [] as MacroPoint[]),
    yahooMonthly("%5EKS11").catch(() => [] as MacroPoint[]),
    yahooMonthly("USDKRW%3DX").catch(() => [] as MacroPoint[]),
    fetchUsdKrw().catch(() => 0),
  ]);
  const kospi = kospiNaver.length >= 12 ? kospiNaver : kospiYahoo;
  return {
    kospi,
    fx: fxSeries,
    spotUsdKrw: spotFx,
    source: kospiNaver.length >= 12 ? "Naver fchart KOSPI monthly" : "Yahoo Finance ^KS11",
    fetchedAt: new Date().toISOString(),
  };
});

function isPreferredName(name: string): boolean {
  return /우$|우B$|우C$|우선|1우|2우|3우/.test(name.replace(/\s/g, ""));
}

export async function fetchKospiMarketSum(pages = 4): Promise<
  {
    ticker: string;
    name: string;
    marketCap: number;
    price: number;
    changePct: number;
    isPreferred: boolean;
  }[]
> {
  const rows: {
    ticker: string;
    name: string;
    marketCap: number;
    price: number;
    changePct: number;
    isPreferred: boolean;
  }[] = [];
  const seen = new Set<string>();
  for (let page = 1; page <= pages; page++) {
    const url = `https://finance.naver.com/sise/sise_market_sum.naver?sosok=0&page=${page}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 KoreaExportDesk/1.0" },
    });
    if (!res.ok) break;
    const buf = await res.arrayBuffer();
    const html = new TextDecoder("utf-8").decode(buf);
    const table = html.match(/<table[^>]*class="type_2"[\s\S]*?<\/table>/i)?.[0] ?? "";
    const trs = table.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) ?? [];
    for (const tr of trs) {
      const code = tr.match(/code=(\d{6})/)?.[1];
      const name = tr.match(/class="tltle">([^<]+)/)?.[1]?.trim();
      if (!code || !name || seen.has(code)) continue;
      const nums = [...tr.matchAll(/<td class="number">([\s\S]*?)<\/td>/gi)].map((m) =>
        Number(
          m[1]!.replace(/<[^>]+>/g, "")
            .replace(/,/g, "")
            .replace(/[^\d.+-]/g, "")
            .trim(),
        ),
      );
      const price = nums[0] ?? 0;
      const changePct = nums[2] ?? 0;
      const marketCap = nums[4] ?? 0;
      if (!(marketCap > 0)) continue;
      seen.add(code);
      rows.push({
        ticker: code,
        name,
        marketCap,
        price,
        changePct,
        isPreferred: isPreferredName(name),
      });
    }
  }
  return rows;
}

export const getKospiCapQuotes = createServerFn({ method: "GET" }).handler(async () => {
  const ranked = await fetchKospiMarketSum(4).catch(() => []);
  if (ranked.length > 0) {
    return {
      quotes: ranked.map((q) => ({
        ticker: q.ticker,
        name: q.name,
        price: q.price,
        changePct: q.changePct,
        marketCap: q.marketCap,
        market: "KOSPI" as const,
        isPreferred: q.isPreferred,
      })),
      fetchedAt: new Date().toISOString(),
      source: "Naver 시가총액 (KOSPI)",
    };
  }
  const kospi = UNIVERSE.filter((u) => u.market === "KOSPI").map((u) => u.code);
  const quotes = await fetchRealtimeQuotes(kospi);
  return {
    quotes: quotes.map((q) => ({
      ticker: q.code,
      name: q.nameKo,
      price: q.price,
      changePct: q.changePct,
      marketCap: q.marketCap ?? 0,
      market: q.market,
      isPreferred: false,
    })),
    fetchedAt: new Date().toISOString(),
    source: "Naver realtime fallback",
  };
});

export const getIndustryMonthlyPrices = createServerFn({ method: "GET" })
  .validator(z.object({ tickers: z.array(z.string().min(4).max(8)).max(12) }))
  .handler(async ({ data }) => {
    const series: Record<string, MacroPoint[]> = {};
    await Promise.all(
      data.tickers.map(async (code) => {
        const pack = await fetchOhlc({
          code,
          market: "KOSPI",
          interval: "month",
          range: "10y",
        }).catch(() => ({ bars: [] as { date: string; close: number }[] }));
        series[code] = pack.bars.map((b) => ({ date: b.date, value: b.close }));
      }),
    );
    return {
      series,
      fetchedAt: new Date().toISOString(),
      source: "Yahoo/Naver monthly close",
    };
  });
