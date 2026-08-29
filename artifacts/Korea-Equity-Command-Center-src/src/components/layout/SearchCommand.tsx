import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, X, Layers, Loader2 } from "lucide-react";
import { searchUniverse } from "@/data/stocks";
import { formatPrice } from "@/lib/format";
import { PriceChange } from "@/components/stocks/PriceChange";
import { useQuoteMap, useEtfMarket, useSecuritySearch } from "@/lib/use-market";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { matchesSearchQuery } from "@/lib/search-match";
import type { ListedSearchHit } from "@/server/security-search";

const RECENT_KEY = "kx-search-recent-v1";

function loadRecent(): ListedSearchHit[] {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(raw) ? raw.slice(0, 8) : [];
  } catch {
    return [];
  }
}

function pushRecent(hit: ListedSearchHit) {
  const prev = loadRecent().filter((x) => x.code !== hit.code);
  localStorage.setItem(RECENT_KEY, JSON.stringify([hit, ...prev].slice(0, 8)));
}

export function SearchCommand({ className }: { className?: string }) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { map } = useQuoteMap();

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(q.trim()), 180);
    return () => window.clearTimeout(id);
  }, [q]);

  const live = useSecuritySearch(debounced);
  const localStocks = useMemo(() => searchUniverse(q), [q]);
  const etfQ = useEtfMarket({
    bucket: "all",
    q: debounced.length >= 2 ? debounced : undefined,
    limit: 20,
    enabled: debounced.length >= 2,
  });

  const stockHits: ListedSearchHit[] = useMemo(() => {
    const by = new Map<string, ListedSearchHit>();
    for (const s of localStocks) {
      by.set(s.code, {
        code: s.code,
        nameKo: s.nameKo,
        nameEn: s.nameEn,
        market: s.market,
        sectorId: s.sectorId,
        isEtf: false,
        source: "universe",
      });
    }
    for (const h of live.data?.hits ?? []) {
      if (!h.isEtf) by.set(h.code, h);
    }
    return [...by.values()];
  }, [localStocks, live.data?.hits]);

  const etfResults = useMemo(() => {
    const fromLive = (live.data?.hits ?? []).filter((h) => h.isEtf);
    const needle = q.trim();
    if (needle.length < 2) return fromLive;
    const extra = (etfQ.data?.etfs ?? [])
      .filter((etf) =>
        matchesSearchQuery(needle, [etf.nameKo, etf.code, etf.tabLabel, etf.issuer]),
      )
      .map(
        (etf): ListedSearchHit => ({
          code: etf.code,
          nameKo: etf.nameKo,
          nameEn: etf.nameKo,
          market: "KOSPI",
          sectorId: "electronics",
          isEtf: true,
          source: "naver-autocomplete",
        }),
      );
    const by = new Map<string, ListedSearchHit>();
    for (const h of [...fromLive, ...extra]) by.set(h.code, h);
    return [...by.values()];
  }, [live.data?.hits, etfQ.data?.etfs, q]);

  const rows = useMemo(() => {
    const list: { kind: "stock" | "etf"; hit: ListedSearchHit }[] = [
      ...stockHits.map((hit) => ({ kind: "stock" as const, hit })),
      ...etfResults.map((hit) => ({ kind: "etf" as const, hit })),
    ];
    return list.slice(0, 20);
  }, [stockHits, etfResults]);

  useEffect(() => setHi(0), [q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        wrapRef.current?.querySelector("input")?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(hit: ListedSearchHit) {
    pushRecent(hit);
    try {
      sessionStorage.setItem("kx-last-security", JSON.stringify(hit));
    } catch {
      /* ignore */
    }
    if (hit.isEtf) navigate({ to: "/etfs/$code", params: { code: hit.code } });
    else navigate({ to: "/stock/$ticker", params: { ticker: hit.code } });
    setOpen(false);
    setQ("");
  }

  const fetching = live.isFetching || etfQ.isFetching;
  const empty = !fetching && q.trim().length > 0 && rows.length === 0;

  return (
    <div ref={wrapRef} className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHi((i) => Math.min(i + 1, Math.max(rows.length - 1, 0)));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHi((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && rows[hi]) {
              e.preventDefault();
              go(rows[hi]!.hit);
            }
          }}
          placeholder="코스피·코스닥 전 종목 · ETF · 코드 (⌘K)"
          className="h-10 pl-9 pr-8 bg-muted/40 border-border text-sm"
          aria-label="종목 검색"
          autoComplete="off"
        />
        {q && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setQ("");
              setOpen(false);
            }}
            aria-label="검색 지우기"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {!q.trim() ? (
            <RecentList onPick={go} />
          ) : empty ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              검색 결과 없음
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto scroll-thin py-1">
              {fetching && rows.length === 0 && (
                <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" /> 전 종목 검색 중
                </div>
              )}
              <ul>
                {rows.map((row, i) => {
                  const quote = map.get(row.hit.code);
                  return (
                    <li key={`${row.kind}-${row.hit.code}`}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/50",
                          i === hi && "bg-muted/60",
                        )}
                        onMouseEnter={() => setHi(i)}
                        onClick={() => go(row.hit)}
                      >
                        {row.kind === "etf" ? (
                          <Layers className="size-3.5 text-desk-gold shrink-0" />
                        ) : (
                          <span className="w-10 shrink-0 text-[10px] font-semibold text-muted-foreground">
                            {row.hit.market === "KOSDAQ" ? "코스닥" : "코스피"}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{row.hit.nameKo}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {row.hit.code}
                            {row.kind === "etf" ? " · ETF" : ""}
                          </div>
                        </div>
                        {quote && (
                          <div className="text-right shrink-0">
                            <div className="text-xs font-semibold tabular">
                              {formatPrice(quote.price)}
                            </div>
                            <PriceChange
                              change={quote.change}
                              changePct={quote.changePct}
                              size="sm"
                            />
                          </div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecentList({ onPick }: { onPick: (h: ListedSearchHit) => void }) {
  const recent = typeof window === "undefined" ? [] : loadRecent();
  if (!recent.length) {
    return (
      <div className="px-3 py-4 text-[11px] text-muted-foreground">
        코스피·코스닥 전 종목 검색. 종목명 또는 6자리 코드를 입력하세요.
      </div>
    );
  }
  return (
    <div className="py-1">
      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        최근 검색
      </div>
      <ul>
        {recent.map((h) => (
          <li key={h.code}>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50"
              onClick={() => onPick(h)}
            >
              <span className="text-[10px] text-muted-foreground w-10">
                {h.isEtf ? "ETF" : h.market === "KOSDAQ" ? "코스닥" : "코스피"}
              </span>
              <span className="truncate">{h.nameKo}</span>
              <span className="ml-auto text-[10px] tabular text-muted-foreground">{h.code}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
