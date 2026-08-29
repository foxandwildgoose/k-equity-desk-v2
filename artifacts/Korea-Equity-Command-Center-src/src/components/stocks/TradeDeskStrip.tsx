import { useMemo } from "react";
import type { LiveQuote } from "@/server/naver-market";
import type { OhlcBar } from "@/server/naver-market";
import { formatPrice, formatVolume, formatPct } from "@/lib/format";
import { usePriceColors } from "@/lib/store";
import { cn } from "@/lib/utils";
import { atr, lastNumber } from "@/lib/chart-indicators";
import { AlertTriangle, Radio, ShieldAlert } from "lucide-react";

/**
 * Institutional pre-trade strip: levels, gap, RVOL, ATR, data honesty.
 * Red Team requirement — never trade header price without knowing session context.
 */
export function TradeDeskStrip({
  quote,
  basic,
  dayBars,
  liveConnected,
  dataUpdatedAt,
  chartSource,
}: {
  quote: LiveQuote | null;
  basic?: {
    per?: string;
    pbr?: string;
    foreignRate?: string;
    marketCapLabel?: string;
  } | null;
  dayBars?: OhlcBar[];
  liveConnected?: boolean;
  dataUpdatedAt?: number;
  chartSource?: string;
}) {
  const colors = usePriceColors();

  const metrics = useMemo(() => {
    if (!quote) return null;
    const prev = quote.prevClose || quote.price - quote.change;
    const gapPct = prev ? ((quote.open - prev) / prev) * 100 : 0;
    const dayRange =
      quote.high > quote.low
        ? ((quote.price - quote.low) / (quote.high - quote.low)) * 100
        : 50;
    const dayRangePct =
      quote.low > 0 ? ((quote.high - quote.low) / quote.low) * 100 : 0;
    const fromHigh52 =
      quote.high52 > 0
        ? ((quote.price - quote.high52) / quote.high52) * 100
        : null;
    const fromLow52 =
      quote.low52 > 0
        ? ((quote.price - quote.low52) / quote.low52) * 100
        : null;

    let rvol: number | null = null;
    let atr14: number | null = null;
    let atrPct: number | null = null;
    if (dayBars && dayBars.length >= 20) {
      const vols = dayBars.map((b) => b.volume);
      const avg20 =
        vols.slice(-21, -1).reduce((s, v) => s + v, 0) /
        Math.max(1, Math.min(20, vols.length - 1));
      if (avg20 > 0) rvol = quote.volume / avg20;
      const a = atr(
        dayBars.map((b) => b.high),
        dayBars.map((b) => b.low),
        dayBars.map((b) => b.close),
        14,
      );
      atr14 = lastNumber(a);
      if (atr14 && quote.price) atrPct = (atr14 / quote.price) * 100;
    }

    // MA structure from day bars
    const last = dayBars?.[dayBars.length - 1];
    const maBias = last
      ? {
          aboveMa20: last.ma20 != null ? last.close >= last.ma20 : null,
          ma20Above60:
            last.ma20 != null && last.ma60 != null
              ? last.ma20 >= last.ma60
              : null,
        }
      : null;

    const ageMs =
      dataUpdatedAt != null ? Date.now() - dataUpdatedAt : null;

    return {
      prev,
      gapPct,
      dayRange,
      dayRangePct,
      fromHigh52,
      fromLow52,
      rvol,
      atr14,
      atrPct,
      maBias,
      ageMs,
    };
  }, [quote, dayBars, dataUpdatedAt]);

  if (!quote || !metrics) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        시세 로딩 중 — 트레이드 데스크 대기
      </div>
    );
  }

  const stale =
    metrics.ageMs != null &&
    metrics.ageMs > 45_000 &&
    !liveConnected;
  const isLive =
    liveConnected || quote.source === "kis-krx-websocket";

  return (
    <section className="desk-card desk-card-navy overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          트레이드 데스크
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold",
              isLive
                ? "bg-price-up/15 text-price-up"
                : stale
                  ? "bg-price-down/15 text-price-down"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {isLive ? (
              <>
                <Radio className="size-3" /> LIVE
              </>
            ) : stale ? (
              <>
                <AlertTriangle className="size-3" /> STALE{" "}
                {Math.round((metrics.ageMs ?? 0) / 1000)}s
              </>
            ) : (
              <>스냅샷</>
            )}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          차트 소스 {chartSource || "—"} · 헤더 시세와 분봉은 공급원이 다를 수
          있음
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-px bg-border">
        <Cell label="시가" value={formatPrice(quote.open)} />
        <Cell label="고가" value={formatPrice(quote.high)} />
        <Cell label="저가" value={formatPrice(quote.low)} />
        <Cell label="종가/현재" value={formatPrice(quote.price)} emphasize />
        <Cell label="전일" value={formatPrice(metrics.prev)} />
        <Cell
          label="갭"
          value={`${metrics.gapPct >= 0 ? "+" : ""}${metrics.gapPct.toFixed(2)}%`}
          tone={
            metrics.gapPct > 0 ? "up" : metrics.gapPct < 0 ? "down" : undefined
          }
        />
        <Cell
          label="일중 위치"
          value={`${metrics.dayRange.toFixed(0)}%`}
          sub={`고저폭 ${metrics.dayRangePct.toFixed(2)}%`}
        />
        <Cell label="거래량" value={formatVolume(quote.volume)} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-3">
        <Mini
          label="RVOL (20일)"
          value={
            metrics.rvol != null ? `${metrics.rvol.toFixed(2)}x` : "—"
          }
          hint="당일 거래량 ÷ 최근 20일 평균"
          hot={metrics.rvol != null && metrics.rvol >= 1.5}
        />
        <Mini
          label="ATR(14)"
          value={
            metrics.atr14 != null
              ? `${formatPrice(Math.round(metrics.atr14))}${
                  metrics.atrPct != null
                    ? ` (${metrics.atrPct.toFixed(2)}%)`
                    : ""
                }`
              : "—"
          }
          hint="변동성 단위 — 손절·목표가 폭 참고"
        />
        <Mini
          label="52주 고점 대비"
          value={
            metrics.fromHigh52 != null
              ? formatPct(metrics.fromHigh52)
              : "—"
          }
          tone={
            metrics.fromHigh52 != null && metrics.fromHigh52 < 0
              ? "down"
              : undefined
          }
        />
        <Mini
          label="52주 저점 대비"
          value={
            metrics.fromLow52 != null ? formatPct(metrics.fromLow52) : "—"
          }
          tone={
            metrics.fromLow52 != null && metrics.fromLow52 > 0
              ? "up"
              : undefined
          }
        />
        <Mini
          label="추세 (일봉 MA)"
          value={
            metrics.maBias?.aboveMa20 == null
              ? "—"
              : [
                  metrics.maBias.aboveMa20 ? "가≥MA20" : "가<MA20",
                  metrics.maBias.ma20Above60 == null
                    ? ""
                    : metrics.maBias.ma20Above60
                      ? "· 정배열"
                      : "· 역배열",
                ].join(" ")
          }
          hint="종가 vs MA20, MA20 vs MA60"
        />
        <Mini
          label="밸류·수급"
          value={[
            basic?.per ? `PER ${basic.per}` : null,
            basic?.pbr ? `PBR ${basic.pbr}` : null,
            basic?.foreignRate ? `외인 ${basic.foreignRate}` : null,
          ]
            .filter(Boolean)
            .join(" · ") || "—"}
        />
      </div>

      <div className="flex flex-wrap items-start gap-2 border-t border-border px-3 py-2 text-[11px] text-muted-foreground leading-relaxed">
        <ShieldAlert className="size-3.5 shrink-0 mt-0.5 text-desk-gold" />
        <span>
          <b className="text-foreground">데스크 주의:</b> 본 화면은 리서치·워크플로
          도구이며 투자 권유·주문 실행이 아닙니다. 시세는 스냅샷/스트림 혼합, 차트
          OHLC는 Yahoo·네이버 비공식 경로일 수 있습니다. 실주문 전 증권사 HTS/MTS
          호가·잔량·VI를 재확인하세요.
          {stale && (
            <span className={cn("ml-1 font-semibold", colors.down)}>
              데이터가 지연 중입니다 — 매매 판단 보류를 권고합니다.
            </span>
          )}
        </span>
      </div>
    </section>
  );
}

function Cell({
  label,
  value,
  sub,
  emphasize,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  emphasize?: boolean;
  tone?: "up" | "down";
}) {
  const colors = usePriceColors();
  return (
    <div className="bg-card px-2.5 py-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div
        className={cn(
          "text-sm font-semibold tabular",
          emphasize && "text-base",
          tone === "up" && colors.up,
          tone === "down" && colors.down,
        )}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[10px] text-muted-foreground tabular">{sub}</div>
      )}
    </div>
  );
}

function Mini({
  label,
  value,
  hint,
  hot,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  hot?: boolean;
  tone?: "up" | "down";
}) {
  const colors = usePriceColors();
  return (
    <div
      className={cn(
        "rounded-lg border border-border px-2.5 py-2",
        hot && "border-desk-gold/50 bg-desk-gold/5",
      )}
      title={hint}
    >
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 text-xs font-semibold tabular leading-snug",
          tone === "up" && colors.up,
          tone === "down" && colors.down,
        )}
      >
        {value}
      </div>
    </div>
  );
}
