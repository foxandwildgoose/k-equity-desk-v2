import { useEffect, useMemo, useRef, useState } from "react";
import { LineSeries, type IChartApi, type ISeriesApi, type SeriesType } from "lightweight-charts";
import { computeSeriesRangePosition } from "@/lib/chart-indicators";
import { RangePositionStrip } from "@/components/stocks/RangePositionStrip";
import { ChartShell } from "@/components/charts/core/ChartShell";
import { createProChart } from "@/components/charts/core/create-pro-chart";
import { readChartTheme } from "@/components/charts/core/theme";
import { exportChartPng, exportRowsCsv, RangePresets, ScaleToggle, useChartChrome } from "@/components/charts/core/chrome";

export type DualPoint = {
  time: string;
  a: number | null;
  b: number | null;
};

/** Export × KOSPI dual-axis chart (F7.16 Tier B): shared chrome, left/right scales, range presets, PNG/CSV. */
export function ExportDualChart({
  data,
  aName,
  bName,
  aColor = "#d4a017",
  bColor = "#3b82f6",
  source = "FRED/OECD · Yahoo",
  asOf = null,
  mode = "월간",
}: {
  data: DualPoint[];
  aName: string;
  bName: string;
  aColor?: string;
  bColor?: string;
  source?: string;
  asOf?: string | null;
  mode?: string;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [series, setSeries] = useState<{ a: ISeriesApi<SeriesType> | null; b: ISeriesApi<SeriesType> | null }>({ a: null, b: null });
  const rows = useMemo(() => data.map((d) => ({ ...d, time: toDay(d.time) })), [data]);
  const hasData = data.some((d) => d.a != null || d.b != null);

  const aStats = useMemo(
    () => computeSeriesRangePosition(data.filter((d) => d.a != null && Number.isFinite(d.a)).map((d) => ({ value: d.a as number, date: d.time }))),
    [data],
  );
  const bStats = useMemo(
    () => computeSeriesRangePosition(data.filter((d) => d.b != null && Number.isFinite(d.b)).map((d) => ({ value: d.b as number, date: d.time }))),
    [data],
  );

  useEffect(() => {
    const el = elRef.current;
    if (!el || !hasData) return;
    const c = createProChart(el, readChartTheme(), "US");
    c.applyOptions({
      localization: { locale: "ko-KR", priceFormatter: (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 2 }) },
      leftPriceScale: { visible: true, borderColor: "rgba(148,163,184,0.2)" },
      timeScale: { timeVisible: false, rightOffset: 2 },
    });
    const a = c.addSeries(LineSeries, { color: aColor, lineWidth: 2, title: aName, priceLineVisible: false, priceScaleId: "left" });
    const b = c.addSeries(LineSeries, { color: bColor, lineWidth: 2, title: bName, priceLineVisible: false, priceScaleId: "right" });
    a.setData(rows.filter((d) => d.a != null && Number.isFinite(d.a)).map((d) => ({ time: d.time as "2020-01-01", value: d.a as number })));
    b.setData(rows.filter((d) => d.b != null && Number.isFinite(d.b)).map((d) => ({ time: d.time as "2020-01-01", value: d.b as number })));
    c.timeScale().fitContent();
    setChart(c);
    setSeries({ a, b });
    return () => {
      setChart(null);
      setSeries({ a: null, b: null });
      c.remove();
    };
  }, [rows, aName, bName, aColor, bColor, hasData]);

  const { legend, hud } = useChartChrome(chart, [
    { id: "a", label: `${aName} (좌)`, color: aColor, api: series.a },
    { id: "b", label: `${bName} (우)`, color: bColor, api: series.b },
  ]);

  if (!hasData) {
    return <div className="flex h-[380px] items-center justify-center text-sm text-muted-foreground">그릴 관측값이 없습니다.</div>;
  }

  return (
    <div>
      <RangePositionStrip stats={aStats} compact caption={`${aName} · 현재값 기준 구간 고저 · 최근 고/저는 확인된 스윙.`} />
      <RangePositionStrip stats={bStats} compact caption={`${bName} · 현재값 기준 구간 고저 · 최근 고/저는 확인된 스윙.`} />
      <ChartShell
        title={`${aName} × ${bName}`}
        toolbar={
          <>
            <RangePresets chart={chart} first={rows[0]?.time} last={rows.at(-1)?.time} />
            <ScaleToggle chart={chart} allowed={["normal", "log", "percent"]} priceScaleIds={["left", "right"]} />
          </>
        }
        hud={hud}
        legend={legend}
        status={{ source, mode, updatedAt: asOf }}
        onExportPng={() => exportChartPng(chart, "KR", "EXPORT", "export-kospi")}
        onExportCsv={() => exportRowsCsv(chart, rows, [{ name: aName, get: (r) => r.a }, { name: bName, get: (r) => r.b }], "KR", "EXPORT", "export-kospi")}
        height={380}
        testId="export-dual-chart"
      >
        <div ref={elRef} className="absolute inset-0" />
      </ChartShell>
    </div>
  );
}

function toDay(period: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) return period;
  if (/^\d{4}-\d{2}$/.test(period)) return `${period}-01`;
  return period.slice(0, 10);
}
