import { useEffect, useMemo, useRef } from "react";
import { ColorType, LineSeries, createChart } from "lightweight-charts";
import { computeSeriesRangePosition } from "@/lib/chart-indicators";
import { RangePositionStrip } from "@/components/stocks/RangePositionStrip";

export type DualPoint = {
  time: string;
  a: number | null;
  b: number | null;
};

export function ExportDualChart({
  data,
  aName,
  bName,
  aColor = "#d4a017",
  bColor = "#3b82f6",
}: {
  data: DualPoint[];
  aName: string;
  bName: string;
  aColor?: string;
  bColor?: string;
}) {
  const elRef = useRef<HTMLDivElement>(null);

  const aStats = useMemo(
    () =>
      computeSeriesRangePosition(
        data
          .filter((d) => d.a != null && Number.isFinite(d.a))
          .map((d) => ({ value: d.a as number, date: d.time })),
      ),
    [data],
  );
  const bStats = useMemo(
    () =>
      computeSeriesRangePosition(
        data
          .filter((d) => d.b != null && Number.isFinite(d.b))
          .map((d) => ({ value: d.b as number, date: d.time })),
      ),
    [data],
  );

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94a3b8",
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(148,163,184,0.1)" },
        horzLines: { color: "rgba(148,163,184,0.1)" },
      },
      rightPriceScale: { borderColor: "rgba(148,163,184,0.2)", scaleMargins: { top: 0.08, bottom: 0.08 } },
      timeScale: { borderColor: "rgba(148,163,184,0.2)", rightOffset: 2 },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });
    const a = chart.addSeries(LineSeries, {
      color: aColor,
      lineWidth: 2,
      title: aName,
      priceLineVisible: false,
    });
    const b = chart.addSeries(LineSeries, {
      color: bColor,
      lineWidth: 2,
      title: bName,
      priceLineVisible: false,
    });
    const aData = data
      .filter((d) => d.a != null && Number.isFinite(d.a))
      .map((d) => ({ time: toDay(d.time) as "2020-01-01", value: d.a as number }));
    const bData = data
      .filter((d) => d.b != null && Number.isFinite(d.b))
      .map((d) => ({ time: toDay(d.time) as "2020-01-01", value: d.b as number }));
    a.setData(aData);
    b.setData(bData);
    chart.timeScale().fitContent();
    const ro = new ResizeObserver(() => {
      if (el.clientWidth > 0) chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [data, aName, bName, aColor, bColor]);

  if (!data.some((d) => d.a != null || d.b != null)) {
    return (
      <div className="flex h-[380px] items-center justify-center text-sm text-muted-foreground">
        그릴 관측값이 없습니다.
      </div>
    );
  }

  return (
    <div>
      <RangePositionStrip
        stats={aStats}
        compact
        caption={`${aName} · 현재값 기준 구간 고저 · 최근 고/저는 확인된 스윙.`}
      />
      <RangePositionStrip
        stats={bStats}
        compact
        caption={`${bName} · 현재값 기준 구간 고저 · 최근 고/저는 확인된 스윙.`}
      />
      <div ref={elRef} className="h-[380px] w-full min-h-[380px]" />
    </div>
  );
}

function toDay(period: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) return period;
  if (/^\d{4}-\d{2}$/.test(period)) return `${period}-01`;
  return period.slice(0, 10);
}
