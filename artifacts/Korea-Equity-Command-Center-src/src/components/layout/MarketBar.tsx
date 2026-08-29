import { DATA_LABEL } from "@/data/market";
import { useMarketIndices } from "@/lib/use-market";
import { usePriceColors } from "@/lib/store";
import { formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

function statusLabel(ms?: string): string | null {
  if (!ms) return null;
  const u = ms.toUpperCase();
  if (u === "OPEN") return "개장";
  if (u === "CLOSE" || u === "CLOSED") return "마감";
  if (u === "PREOPEN" || u === "PRE") return "장전";
  if (u === "AFTER" || u === "AFTERHOURS") return "시간외";
  return ms;
}

export function MarketBar() {
  const colors = usePriceColors();
  const { data, isLoading, isError } = useMarketIndices();
  const indices = data?.indices ?? [];
  const anyOpen = indices.some((i) => i.marketStatus?.toUpperCase() === "OPEN");
  const status = statusLabel(indices[0]?.marketStatus);
  const source = data?.source ?? indices[0]?.source ?? "naver-finance-snapshot";
  const modeLabel =
    source === "kis-krx-websocket" ? "KIS·KRX LIVE" : "스냅샷(네이버)";

  return (
    <div className="market-tape">
      <div className="flex items-center gap-0 overflow-x-auto scroll-thin max-w-full">
        {isLoading && indices.length === 0 && (
          <div className="px-3 py-2 text-[11px] text-muted-foreground">
            지수 수신 중…
          </div>
        )}
        {isError && (
          <div className="px-3 py-2 text-[11px] text-price-down">
            지수 조회 실패
          </div>
        )}
        {status && (
          <div className="market-tape-item flex shrink-0 items-center gap-1.5 border-r border-border">
            <span
              className={cn(
                "size-1.5 rounded-full",
                anyOpen ? "bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" : "bg-muted-foreground",
              )}
            />
            <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              {status}
            </span>
            <span
              className={cn(
                "rounded px-1 py-0.5 text-[9px] font-semibold tracking-wide",
                source === "kis-krx-websocket"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {modeLabel}
            </span>
          </div>
        )}
        {indices.map((idx, i) => {
          const up = idx.changePct > 0;
          const flat = idx.changePct === 0;
          const color = flat
            ? "text-muted-foreground"
            : up
              ? colors.up
              : colors.down;
          return (
            <div
              key={idx.id}
              className={cn(
                "market-tape-item flex shrink-0 items-baseline gap-2",
                i > 0 && "border-l border-border",
              )}
              title={`${idx.nameEn} · ${idx.source}`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {idx.nameKo}
              </span>
              <span className="text-xs font-semibold tabular text-foreground">
                {idx.value.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className={cn("text-[11px] font-medium tabular", color)}>
                {up ? "+" : ""}
                {idx.change.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}{" "}
                ({formatPct(idx.changePct)})
              </span>
            </div>
          );
        })}
        <div className="ml-auto shrink-0 px-3 py-2">
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {DATA_LABEL}
          </span>
        </div>
      </div>
    </div>
  );
}
