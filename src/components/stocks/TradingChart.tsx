import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Market } from "@/data/types";
import type { ChartInterval, MinuteSize, OhlcBar } from "@/server/naver-market";
import { useChartData } from "@/lib/use-market";
import { formatPrice, formatVolume } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  atr as calcAtr,
  bollinger,
  findPivots,
  lastNumber,
  macd as calcMacd,
  rsi as calcRsi,
  vwap as calcVwap,
} from "@/lib/chart-indicators";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  CrosshairMode,
  LineStyle,
  PriceScaleMode,
  type IChartApi,
  type ISeriesApi,
  type IPriceLine,
  type Time,
  type MouseEventParams,
  type CandlestickData,
  type HistogramData,
  type LineData,
  type LogicalRange,
  createSeriesMarkers,
} from "lightweight-charts";
import {
  Loader2,
  MousePointer2,
  Minus,
  TrendingUp,
  Trash2,
  Eraser,
  Magnet,
  ZoomIn,
  Maximize2,
  Ruler,
  Crosshair,
  Layers,
} from "lucide-react";

const INTERVALS: { id: ChartInterval; label: string }[] = [
  { id: "minute", label: "분" },
  { id: "day", label: "일" },
  { id: "week", label: "주" },
  { id: "month", label: "월" },
  { id: "year", label: "년" },
];

const MINUTE_SIZES: MinuteSize[] = [1, 3, 5, 10, 15, 30, 60];

const RANGES: { id: string; label: string }[] = [
  { id: "1mo", label: "1M" },
  { id: "3mo", label: "3M" },
  { id: "6mo", label: "6M" },
  { id: "1y", label: "1Y" },
  { id: "2y", label: "2Y" },
  { id: "5y", label: "5Y" },
  { id: "max", label: "MAX" },
];

/** Professional minute history windows (Yahoo hard limits). */
function minuteRangesFor(size: MinuteSize): { id: string; label: string }[] {
  if (size <= 1) {
    return [
      { id: "1d", label: "1일" },
      { id: "5d", label: "5일" },
      { id: "7d", label: "7일" },
    ];
  }
  if (size === 3) {
    // True 3m = bucketed 1m; Yahoo 1m history ≤7d
    return [
      { id: "1d", label: "1일" },
      { id: "5d", label: "5일" },
      { id: "7d", label: "7일" },
    ];
  }
  if (size < 60) {
    return [
      { id: "1d", label: "1일" },
      { id: "5d", label: "5일" },
      { id: "1mo", label: "1개월" },
      { id: "60d", label: "60일" },
    ];
  }
  return [
    { id: "1mo", label: "1개월" },
    { id: "3mo", label: "3개월" },
    { id: "6mo", label: "6개월" },
    { id: "1y", label: "1년" },
    { id: "2y", label: "2년" },
  ];
}

function defaultMinuteRange(size: MinuteSize): string {
  if (size <= 1) return "7d";
  if (size === 3) return "7d";
  if (size < 60) return "60d";
  return "1y";
}

const MA_META = [
  { key: "ma5" as const, label: "MA5", color: "#f59e0b" },
  { key: "ma20" as const, label: "MA20", color: "#a78bfa" },
  { key: "ma60" as const, label: "MA60", color: "#38bdf8" },
  { key: "ma120" as const, label: "MA120", color: "#94a3b8" },
];

type DrawTool =
  | "cursor"
  | "hline"
  | "trend"
  | "ray"
  | "fib"
  | "measure"
  | "erase";

type HLineDrawing = {
  id: string;
  type: "hline";
  price: number;
  color: string;
  label: string;
};

type SegDrawing = {
  id: string;
  type: "trend" | "ray" | "fib" | "measure";
  t1: number; // index into bars
  p1: number;
  t2: number;
  p2: number;
  color: string;
};

type Drawing = HLineDrawing | SegDrawing;

function barTime(bar: OhlcBar): Time {
  if (bar.date.includes(" ")) {
    // "YYYY-MM-DD HH:mm" KST → unix
    const iso = bar.date.replace(" ", "T") + ":00+09:00";
    const ms = Date.parse(iso);
    if (!Number.isNaN(ms)) return Math.floor(ms / 1000) as Time;
  }
  // business day
  return bar.date.slice(0, 10) as Time;
}

function loadDrawings(code: string): Drawing[] {
  try {
    const raw = localStorage.getItem(`ke-chart-draw:${code}`);
    if (!raw) return [];
    return JSON.parse(raw) as Drawing[];
  } catch {
    return [];
  }
}

function saveDrawings(code: string, items: Drawing[]) {
  try {
    localStorage.setItem(`ke-chart-draw:${code}`, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function TradingChart({
  code,
  market,
  eventMarkers = [],
}: {
  code: string;
  market: Market;
  /** Optional disclosure/event dates (YYYY-MM-DD) for chart markers */
  eventMarkers?: { time: string; title: string }[];
}) {
  const [interval, setInterval] = useState<ChartInterval>("day");
  const [minuteSize, setMinuteSize] = useState<MinuteSize>(5);
  const [range, setRange] = useState("2y");
  const [showMa, setShowMa] = useState({
    ma5: true,
    ma20: true,
    ma60: true,
    ma120: false,
  });
  const [showBb, setShowBb] = useState(false);
  const [showAtr, setShowAtr] = useState(true);
  const [showVwap, setShowVwap] = useState(true);
  const [showRsi, setShowRsi] = useState(true);
  const [showMacd, setShowMacd] = useState(false);
  const [logScale, setLogScale] = useState(false);
  const [magnet, setMagnet] = useState(true);
  const [tool, setTool] = useState<DrawTool>("cursor");
  const [chartH, setChartH] = useState(480);
  const [drawings, setDrawings] = useState<Drawing[]>(() => loadDrawings(code));
  const [hover, setHover] = useState<OhlcBar | null>(null);
  const [measureLabel, setMeasureLabel] = useState<string | null>(null);
  const [pending, setPending] = useState<{
    t: number;
    p: number;
  } | null>(null);

  // Keep range valid for interval / minute size (pro default = max useful history)
  useEffect(() => {
    if (interval === "minute") {
      const opts = minuteRangesFor(minuteSize);
      if (!opts.some((o) => o.id === range)) {
        setRange(defaultMinuteRange(minuteSize));
      }
    } else if (!RANGES.some((o) => o.id === range)) {
      setRange("2y");
    }
  }, [interval, minuteSize]); // eslint-disable-line react-hooks/exhaustive-deps

  const convention = useAppStore((s) => s.colorConvention);
  const upColor = convention === "korea" ? "#ef4444" : "#22c55e";
  const downColor = convention === "korea" ? "#3b82f6" : "#ef4444";

  const minuteRangeOpts = minuteRangesFor(minuteSize);
  const { data, isLoading, isError, isFetching, refetch } = useChartData({
    code,
    market,
    interval,
    minuteSize,
    range,
  });

  const bars = data?.bars ?? [];
  const source = data?.source ?? "";

  // reload drawings when ticker changes
  useEffect(() => {
    setDrawings(loadDrawings(code));
    setPending(null);
    setMeasureLabel(null);
  }, [code]);

  useEffect(() => {
    saveDrawings(code, drawings);
  }, [code, drawings]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const maRefs = useRef<Record<string, ISeriesApi<"Line"> | null>>({});
  const bbRefs = useRef<{
    mid: ISeriesApi<"Line"> | null;
    upper: ISeriesApi<"Line"> | null;
    lower: ISeriesApi<"Line"> | null;
  }>({ mid: null, upper: null, lower: null });
  const vwapRef = useRef<ISeriesApi<"Line"> | null>(null);
  const rsiRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdRef = useRef<{
    macd: ISeriesApi<"Line"> | null;
    signal: ISeriesApi<"Line"> | null;
    hist: ISeriesApi<"Histogram"> | null;
  }>({ macd: null, signal: null, hist: null });
  const priceLinesRef = useRef<Map<string, IPriceLine>>(new Map());
  const overlayRef = useRef<SVGSVGElement>(null);
  const barsRef = useRef(bars);
  barsRef.current = bars;
  const toolRef = useRef(tool);
  toolRef.current = tool;
  const magnetRef = useRef(magnet);
  magnetRef.current = magnet;
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  const drawingsRef = useRef(drawings);
  drawingsRef.current = drawings;

  const last = bars[bars.length - 1];
  const first = bars[0];
  const rangeChg =
    last && first && first.open
      ? ((last.close - first.open) / first.open) * 100
      : 0;

    const displayBar = hover ?? last;

  const atrHud = useMemo(() => {
    if (!showAtr || bars.length < 15) return null;
    const a = calcAtr(
      bars.map((b) => b.high),
      bars.map((b) => b.low),
      bars.map((b) => b.close),
      14,
    );
    const v = lastNumber(a);
    if (v == null || !last?.close) return null;
    return { atr: v, pct: (v / last.close) * 100 };
  }, [bars, showAtr, last]);

  // Disclosure markers on daily bars
  useEffect(() => {
    const series = candleRef.current;
    if (!series) return;
    if (interval === "minute" || !eventMarkers.length || bars.length === 0) {
      try {
        createSeriesMarkers(series, []);
      } catch {
        /* */
      }
      return;
    }
    const byDay = new Set<string>();
    for (const m of eventMarkers) {
      const d = m.time.slice(0, 10);
      if (d) byDay.add(d);
    }
    const markers = bars
      .filter((b) => byDay.has(b.date.slice(0, 10)))
      .slice(-25)
      .map((b) => ({
        time: barTime(b),
        position: "aboveBar" as const,
        color: "#e5b84c",
        shape: "circle" as const,
        text: "공시",
      }));
    try {
      createSeriesMarkers(series, markers);
    } catch {
      /* API variance */
    }
  }, [bars, eventMarkers, interval]);

  // ── Chart lifecycle ──────────────────────────────────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { color: "transparent" },
        textColor: "#94a3b8",
        fontSize: 12,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(148,163,184,0.08)" },
        horzLines: { color: "rgba(148,163,184,0.08)" },
      },
      crosshair: {
        mode: CrosshairMode.MagnetOHLC,
        vertLine: {
          color: "rgba(148,163,184,0.35)",
          labelBackgroundColor: "#1e293b",
        },
        horzLine: {
          color: "rgba(148,163,184,0.35)",
          labelBackgroundColor: "#1e293b",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(148,163,184,0.15)",
        scaleMargins: { top: 0.08, bottom: 0.2 },
      },
      timeScale: {
        borderColor: "rgba(148,163,184,0.15)",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 6,
        barSpacing: 8,
        minBarSpacing: 2,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: { time: true, price: true },
        axisDoubleClickReset: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    const candles = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      borderUpColor: upColor,
      borderDownColor: downColor,
      wickUpColor: upColor,
      wickDownColor: downColor,
      priceLineVisible: true,
      lastValueVisible: true,
    });

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
    });
    chart.priceScale("vol").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    for (const m of MA_META) {
      maRefs.current[m.key] = chart.addSeries(LineSeries, {
        color: m.color,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
    }

    bbRefs.current.mid = chart.addSeries(LineSeries, {
      color: "#64748b",
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    bbRefs.current.upper = chart.addSeries(LineSeries, {
      color: "#64748b",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    bbRefs.current.lower = chart.addSeries(LineSeries, {
      color: "#64748b",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    vwapRef.current = chart.addSeries(LineSeries, {
      color: "#eab308",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    // RSI pane
    rsiRef.current = chart.addSeries(
      LineSeries,
      {
        color: "#c084fc",
        lineWidth: 1,
        priceScaleId: "rsi",
        priceLineVisible: false,
        lastValueVisible: true,
        crosshairMarkerVisible: false,
      },
      1,
    );
    chart.priceScale("rsi", 1).applyOptions({
      scaleMargins: { top: 0.15, bottom: 0.15 },
      borderVisible: false,
    });
    chart.panes()[1]?.setHeight(72);

    // MACD pane
    macdRef.current.hist = chart.addSeries(
      HistogramSeries,
      {
        priceScaleId: "macd",
        priceLineVisible: false,
        lastValueVisible: false,
      },
      2,
    );
    macdRef.current.macd = chart.addSeries(
      LineSeries,
      {
        color: "#38bdf8",
        lineWidth: 1,
        priceScaleId: "macd",
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      },
      2,
    );
    macdRef.current.signal = chart.addSeries(
      LineSeries,
      {
        color: "#f472b6",
        lineWidth: 1,
        priceScaleId: "macd",
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      },
      2,
    );
    chart.priceScale("macd", 2).applyOptions({
      scaleMargins: { top: 0.1, bottom: 0.1 },
      borderVisible: false,
    });
    chart.panes()[2]?.setHeight(72);

    chartRef.current = chart;
    candleRef.current = candles;
    volRef.current = volume;

    const onCross = (param: MouseEventParams<Time>) => {
      if (!param.time || !param.seriesData.size) {
        setHover(null);
        return;
      }
      const idx = barsRef.current.findIndex((b) => {
        const t = barTime(b);
        return String(t) === String(param.time);
      });
      if (idx >= 0) setHover(barsRef.current[idx]!);
    };
    chart.subscribeCrosshairMove(onCross);

    const onClick = (param: MouseEventParams<Time>) => {
      const t = toolRef.current;
      if (t === "cursor" || t === "erase") return;
      if (!param.point || param.time == null) return;
      const series = candleRef.current;
      if (!series) return;
      const priceRaw = series.coordinateToPrice(param.point.y);
      if (priceRaw == null) return;
      let price = Number(priceRaw);
      if (!Number.isFinite(price)) return;

      // find nearest bar index
      let idx = barsRef.current.findIndex(
        (b) => String(barTime(b)) === String(param.time),
      );
      if (idx < 0) idx = barsRef.current.length - 1;
      const bar = barsRef.current[idx];
      if (!bar) return;

      // magnet to OHLC
      if (magnetRef.current) {
        const candidates = [bar.open, bar.high, bar.low, bar.close];
        let best = candidates[0]!;
        let bestD = Math.abs(price - best);
        for (const c of candidates) {
          const d = Math.abs(price - c);
          if (d < bestD) {
            best = c;
            bestD = d;
          }
        }
        if (bestD / best < 0.004 || bestD < best * 0.002) price = best;
      }

      if (t === "hline") {
        const d: HLineDrawing = {
          id: uid(),
          type: "hline",
          price: Math.round(price),
          color: "#e5b84c",
          label: `S/R ${Math.round(price).toLocaleString("ko-KR")}`,
        };
        setDrawings((prev) => [...prev, d]);
        return;
      }

      if (t === "trend" || t === "ray" || t === "fib" || t === "measure") {
        const p = pendingRef.current;
        if (!p) {
          setPending({ t: idx, p: price });
          return;
        }
        const seg: SegDrawing = {
          id: uid(),
          type: t,
          t1: p.t,
          p1: p.p,
          t2: idx,
          p2: price,
          color:
            t === "fib"
              ? "#a78bfa"
              : t === "measure"
                ? "#38bdf8"
                : "#f59e0b",
        };
        if (t === "measure") {
          const chg = price - p.p;
          const pct = p.p ? (chg / p.p) * 100 : 0;
          setMeasureLabel(
            `${chg >= 0 ? "+" : ""}${Math.round(chg).toLocaleString("ko-KR")} (${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%) · ${Math.abs(idx - p.t)}봉`,
          );
        }
        setDrawings((prev) => [...prev, seg]);
        setPending(null);
        if (t === "measure") setTool("cursor");
      }
    };
    chart.subscribeClick(onClick);

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
      redrawOverlay();
    });
    ro.observe(el);

    const onRange = () => redrawOverlay();
    chart.timeScale().subscribeVisibleLogicalRangeChange(onRange);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volRef.current = null;
      priceLinesRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upColor, downColor]);

  // log scale toggle
  useEffect(() => {
    chartRef.current?.priceScale("right").applyOptions({
      mode: logScale ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal,
    });
  }, [logScale]);

  // crosshair magnet
  useEffect(() => {
    chartRef.current?.applyOptions({
      crosshair: {
        mode: magnet ? CrosshairMode.MagnetOHLC : CrosshairMode.Normal,
      },
    });
  }, [magnet]);

  // pane visibility heights
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    try {
      const panes = chart.panes();
      if (panes[1]) panes[1].setHeight(showRsi ? 80 : 0);
      if (panes[2]) panes[2].setHeight(showMacd ? 80 : 0);
    } catch {
      /* pane API */
    }
  }, [showRsi, showMacd, bars.length]);

  // ── Data push ────────────────────────────────────────────────────
  useEffect(() => {
    const candles = candleRef.current;
    const vol = volRef.current;
    const chart = chartRef.current;
    if (!candles || !vol || !chart || bars.length === 0) return;

    const candleData: CandlestickData<Time>[] = bars.map((b) => ({
      time: barTime(b),
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
    }));
    candles.setData(candleData);

    const volData: HistogramData<Time>[] = bars.map((b) => ({
      time: barTime(b),
      value: b.volume,
      color: b.bullish ? upColor + "66" : downColor + "66",
    }));
    vol.setData(volData);

    for (const m of MA_META) {
      const series = maRefs.current[m.key];
      if (!series) continue;
      if (!showMa[m.key]) {
        series.setData([]);
        continue;
      }
      const data: LineData<Time>[] = [];
      for (const b of bars) {
        const v = b[m.key];
        if (v != null) data.push({ time: barTime(b), value: v });
      }
      series.setData(data);
    }

    const closes = bars.map((b) => b.close);
    const highs = bars.map((b) => b.high);
    const lows = bars.map((b) => b.low);
    const volumes = bars.map((b) => b.volume);

    // Bollinger
    if (showBb) {
      const bb = bollinger(closes, 20, 2);
      const toLine = (arr: (number | null)[]) => {
        const out: LineData<Time>[] = [];
        arr.forEach((v, i) => {
          if (v != null) out.push({ time: barTime(bars[i]!), value: v });
        });
        return out;
      };
      bbRefs.current.mid?.setData(toLine(bb.mid));
      bbRefs.current.upper?.setData(toLine(bb.upper));
      bbRefs.current.lower?.setData(toLine(bb.lower));
    } else {
      bbRefs.current.mid?.setData([]);
      bbRefs.current.upper?.setData([]);
      bbRefs.current.lower?.setData([]);
    }

    // Session VWAP (minute: reset each KRX day) / daily anchored cumulative
    if (showVwap) {
      const sessionKeys =
        interval === "minute"
          ? bars.map((b) => b.date.slice(0, 10))
          : undefined;
      const vw = calcVwap(highs, lows, closes, volumes, sessionKeys);
      const data: LineData<Time>[] = [];
      vw.forEach((v, i) => {
        if (v != null) data.push({ time: barTime(bars[i]!), value: v });
      });
      vwapRef.current?.setData(data);
    } else {
      vwapRef.current?.setData([]);
    }

    // ATR as optional thin line on main scale (for scale awareness)
    // stored on last bar label in HUD via atrHud

    // RSI
    if (showRsi) {
      const r = calcRsi(closes, 14);
      const data: LineData<Time>[] = [];
      r.forEach((v, i) => {
        if (v != null) data.push({ time: barTime(bars[i]!), value: v });
      });
      rsiRef.current?.setData(data);
      rsiRef.current?.applyOptions({ visible: true });
    } else {
      rsiRef.current?.setData([]);
    }

    // MACD
    if (showMacd) {
      const m = calcMacd(closes);
      const macdData: LineData<Time>[] = [];
      const sigData: LineData<Time>[] = [];
      const histData: HistogramData<Time>[] = [];
      m.macd.forEach((v, i) => {
        if (v != null)
          macdData.push({ time: barTime(bars[i]!), value: v });
      });
      m.signal.forEach((v, i) => {
        if (v != null)
          sigData.push({ time: barTime(bars[i]!), value: v });
      });
      m.hist.forEach((v, i) => {
        if (v != null)
          histData.push({
            time: barTime(bars[i]!),
            value: v,
            color: v >= 0 ? upColor + "99" : downColor + "99",
          });
      });
      macdRef.current.macd?.setData(macdData);
      macdRef.current.signal?.setData(sigData);
      macdRef.current.hist?.setData(histData);
    } else {
      macdRef.current.macd?.setData([]);
      macdRef.current.signal?.setData([]);
      macdRef.current.hist?.setData([]);
    }

    chart.timeScale().fitContent();
    // after fit, redraw
    requestAnimationFrame(redrawOverlay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bars,
    showMa,
    showBb,
    showVwap,
    showRsi,
    showMacd,
    upColor,
    downColor,
  ]);

  // ── Price lines for hlines + fib ─────────────────────────────────
  useEffect(() => {
    const series = candleRef.current;
    if (!series) return;

    // clear old
    for (const [, pl] of priceLinesRef.current) {
      try {
        series.removePriceLine(pl);
      } catch {
        /* */
      }
    }
    priceLinesRef.current.clear();

    for (const d of drawings) {
      if (d.type === "hline") {
        const pl = series.createPriceLine({
          price: d.price,
          color: d.color,
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: d.label,
        });
        priceLinesRef.current.set(d.id, pl);
      }
      if (d.type === "fib") {
        const hi = Math.max(d.p1, d.p2);
        const lo = Math.min(d.p1, d.p2);
        const span = hi - lo || 1;
        const levels = [
          { r: 0, c: "#94a3b8" },
          { r: 0.236, c: "#f472b6" },
          { r: 0.382, c: "#fb923c" },
          { r: 0.5, c: "#eab308" },
          { r: 0.618, c: "#34d399" },
          { r: 0.786, c: "#38bdf8" },
          { r: 1, c: "#94a3b8" },
        ];
        levels.forEach((lv, i) => {
          const price = hi - span * lv.r;
          const pl = series.createPriceLine({
            price,
            color: lv.c,
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: `Fib ${lv.r} ${Math.round(price).toLocaleString("ko-KR")}`,
          });
          priceLinesRef.current.set(`${d.id}-f${i}`, pl);
        });
      }
    }
    redrawOverlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawings, bars.length]);

  const redrawOverlay = useCallback(() => {
    const svg = overlayRef.current;
    const chart = chartRef.current;
    const series = candleRef.current;
    if (!svg || !chart || !series) return;
    const w = svg.clientWidth || svg.parentElement?.clientWidth || 0;
    const h = svg.clientHeight || svg.parentElement?.clientHeight || 0;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    // clear
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const barsNow = barsRef.current;
    const ts = chart.timeScale();

    const toXY = (barIdx: number, price: number) => {
      const bar = barsNow[barIdx];
      if (!bar) return null;
      const x = ts.timeToCoordinate(barTime(bar));
      const y = series.priceToCoordinate(price);
      if (x == null || y == null) return null;
      return { x, y };
    };

    for (const d of drawingsRef.current) {
      if (d.type !== "trend" && d.type !== "ray" && d.type !== "measure")
        continue;
      const a = toXY(d.t1, d.p1);
      const b = toXY(d.t2, d.p2);
      if (!a || !b) continue;

      let x1 = Number(a.x);
      let y1 = Number(a.y);
      let x2 = Number(b.x);
      let y2 = Number(b.y);

      if (d.type === "ray") {
        const dx = x2 - x1;
        const dy = y2 - y1;
        if (dx !== 0 || dy !== 0) {
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const scale = 5000 / len;
          x2 = x1 + dx * scale;
          y2 = y1 + dy * scale;
        }
      }

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", String(x1));
      line.setAttribute("y1", String(y1));
      line.setAttribute("x2", String(x2));
      line.setAttribute("y2", String(y2));
      line.setAttribute("stroke", d.color);
      line.setAttribute("stroke-width", d.type === "measure" ? "1.5" : "2");
      if (d.type === "measure")
        line.setAttribute("stroke-dasharray", "4 3");
      line.setAttribute("stroke-linecap", "round");
      svg.appendChild(line);

      // price labels at endpoints
      for (const [px, py, price] of [
        [a.x, a.y, d.p1],
        [b.x, b.y, d.p2],
      ] as const) {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        const label = Math.round(price).toLocaleString("ko-KR");
        text.textContent = label;
        text.setAttribute("x", String(px + 6));
        text.setAttribute("y", String(py - 6));
        text.setAttribute("fill", d.color);
        text.setAttribute("font-size", "11");
        text.setAttribute("font-weight", "600");
        text.setAttribute("font-family", "ui-sans-serif, system-ui");
        // rough bg
        rect.setAttribute("x", String(px + 4));
        rect.setAttribute("y", String(py - 18));
        rect.setAttribute("width", String(label.length * 7 + 8));
        rect.setAttribute("height", "16");
        rect.setAttribute("rx", "3");
        rect.setAttribute("fill", "rgba(15,23,42,0.85)");
        rect.setAttribute("stroke", d.color);
        rect.setAttribute("stroke-width", "0.5");
        g.appendChild(rect);
        g.appendChild(text);
        svg.appendChild(g);
      }

      if (d.type === "measure") {
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        const chg = d.p2 - d.p1;
        const pct = d.p1 ? (chg / d.p1) * 100 : 0;
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        text.textContent = `${chg >= 0 ? "+" : ""}${Math.round(chg).toLocaleString("ko-KR")} (${pct.toFixed(2)}%)`;
        text.setAttribute("x", String(midX));
        text.setAttribute("y", String(midY - 8));
        text.setAttribute("fill", "#38bdf8");
        text.setAttribute("font-size", "12");
        text.setAttribute("font-weight", "700");
        text.setAttribute("text-anchor", "middle");
        svg.appendChild(text);
      }
    }

    // pending first point marker
    const p = pendingRef.current;
    if (p) {
      const pt = toXY(p.t, p.p);
      if (pt) {
        const c = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle",
        );
        c.setAttribute("cx", String(pt.x));
        c.setAttribute("cy", String(pt.y));
        c.setAttribute("r", "4");
        c.setAttribute("fill", "#e5b84c");
        svg.appendChild(c);
      }
    }
  }, []);

  // erase click: remove nearest hline by price
  useEffect(() => {
    if (tool !== "erase") return;
    const chart = chartRef.current;
    if (!chart) return;
    const handler = (param: MouseEventParams<Time>) => {
      if (!param.point) return;
      const series = candleRef.current;
      if (!series) return;
      const priceN = series.coordinateToPrice(param.point.y);
      if (priceN == null) return;
      const price = Number(priceN);
      setDrawings((prev) => {
        if (prev.length === 0) return prev;
        let bestI = -1;
        let bestD = Infinity;
        prev.forEach((d, i) => {
          if (d.type === "hline") {
            const dist = Math.abs(d.price - price);
            if (dist < bestD) {
              bestD = dist;
              bestI = i;
            }
          } else if (d.type === "trend" || d.type === "ray" || d.type === "fib") {
            const dist = Math.min(
              Math.abs(d.p1 - price),
              Math.abs(d.p2 - price),
            );
            if (dist < bestD) {
              bestD = dist;
              bestI = i;
            }
          }
        });
        if (bestI < 0 || bestD > price * 0.01) return prev;
        return prev.filter((_, i) => i !== bestI);
      });
    };
    chart.subscribeClick(handler);
    return () => {
      try {
        chart.unsubscribeClick(handler);
      } catch {
        /* */
      }
    };
  }, [tool]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const k = e.key.toLowerCase();
      if (k === "escape") {
        setTool("cursor");
        setPending(null);
      }
      if (k === "h") setTool("hline");
      if (k === "t") setTool("trend");
      if (k === "r") setTool("ray");
      if (k === "f") setTool("fib");
      if (k === "m") setTool("measure");
      if (k === "v") setTool("cursor");
      if (e.key === "1") {
        setInterval("minute");
        setRange(defaultMinuteRange(minuteSize));
      }
      if (e.key === "2") {
        setInterval("day");
        setRange("2y");
      }
      if (e.key === "3") {
        setInterval("week");
        setRange("5y");
      }
      if (e.key === "4") {
        setInterval("month");
        setRange("max");
      }
      if (e.key === "0") chartRef.current?.timeScale().fitContent();
      if (e.key === "Delete" || e.key === "Backspace") {
        setDrawings((prev) => prev.slice(0, -1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fitContent = () => {
    chartRef.current?.timeScale().fitContent();
    redrawOverlay();
  };

  const zoomInBars = () => {
    const ts = chartRef.current?.timeScale();
    if (!ts) return;
    const r = ts.getVisibleLogicalRange();
    if (!r) return;
    const mid = (r.from + r.to) / 2;
    const half = (r.to - r.from) / 2 / 1.4;
    ts.setVisibleLogicalRange({
      from: mid - half,
      to: mid + half,
    } as LogicalRange);
    redrawOverlay();
  };

  const zoomOutBars = () => {
    const ts = chartRef.current?.timeScale();
    if (!ts) return;
    const r = ts.getVisibleLogicalRange();
    if (!r) return;
    const mid = (r.from + r.to) / 2;
    const half = ((r.to - r.from) / 2) * 1.4;
    ts.setVisibleLogicalRange({
      from: mid - half,
      to: mid + half,
    } as LogicalRange);
    redrawOverlay();
  };

  const autoSR = () => {
    if (bars.length < 20) return;
    const highs = bars.map((b) => b.high);
    const lows = bars.map((b) => b.low);
    const { highIdx, lowIdx } = findPivots(highs, lows, 4, 4);
    // take most recent significant pivots
    const recentH = highIdx.slice(-5);
    const recentL = lowIdx.slice(-5);
    const next: Drawing[] = [];
    for (const i of recentH) {
      const price = bars[i]!.high;
      next.push({
        id: uid(),
        type: "hline",
        price,
        color: "#f87171",
        label: `R ${price.toLocaleString("ko-KR")}`,
      });
    }
    for (const i of recentL) {
      const price = bars[i]!.low;
      next.push({
        id: uid(),
        type: "hline",
        price,
        color: "#4ade80",
        label: `S ${price.toLocaleString("ko-KR")}`,
      });
    }
    // cluster near-duplicates
    const merged: Drawing[] = [];
    for (const d of next) {
      if (d.type !== "hline") continue;
      const near = merged.find(
        (m) =>
          m.type === "hline" &&
          Math.abs(m.price - d.price) / d.price < 0.008,
      );
      if (!near) merged.push(d);
    }
    setDrawings((prev) => [
      ...prev.filter(
        (x) =>
          !(
            x.type === "hline" &&
            (x.label.startsWith("R ") || x.label.startsWith("S "))
          ),
      ),
      ...merged,
    ]);
  };

  const clearDrawings = () => {
    setDrawings([]);
    setPending(null);
    setMeasureLabel(null);
  };

  // height drag
  const dragH = useRef<{ y: number; h: number } | null>(null);
  const onHeightDown = (e: React.MouseEvent) => {
    dragH.current = { y: e.clientY, h: chartH };
    const onMove = (ev: MouseEvent) => {
      if (!dragH.current) return;
      const nh = Math.min(900, Math.max(320, dragH.current.h + (ev.clientY - dragH.current.y)));
      setChartH(nh);
    };
    const onUp = () => {
      dragH.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      redrawOverlay();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const tools: {
    id: DrawTool;
    label: string;
    icon: React.ReactNode;
    tip: string;
  }[] = [
    {
      id: "cursor",
      label: "선택",
      icon: <MousePointer2 className="size-3.5" />,
      tip: "드래그 이동 · 휠 줌 (V)",
    },
    {
      id: "hline",
      label: "수평선",
      icon: <Minus className="size-3.5" />,
      tip: "지지/저항 수평선 + 가격 (H)",
    },
    {
      id: "trend",
      label: "추세선",
      icon: <TrendingUp className="size-3.5" />,
      tip: "두 점 클릭 추세선 (T)",
    },
    {
      id: "ray",
      label: "레이",
      icon: <TrendingUp className="size-3.5 rotate-12" />,
      tip: "연장 추세선 (R)",
    },
    {
      id: "fib",
      label: "피보",
      icon: <Layers className="size-3.5" />,
      tip: "피보나치 되돌림 (F)",
    },
    {
      id: "measure",
      label: "측정",
      icon: <Ruler className="size-3.5" />,
      tip: "가격·% 거리 측정 (M)",
    },
    {
      id: "erase",
      label: "지우기",
      icon: <Eraser className="size-3.5" />,
      tip: "가까운 선 클릭 삭제",
    },
  ];

  return (
    <div className="desk-card desk-card-navy overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-2.5 py-2">
        <div className="flex flex-wrap gap-0.5 rounded-md bg-muted p-0.5">
          {INTERVALS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setInterval(item.id);
                if (item.id === "minute") setRange(defaultMinuteRange(minuteSize));
                else if (item.id === "day") setRange("2y");
                else if (item.id === "week") setRange("5y");
                else setRange("max");
              }}
              className={cn(
                "rounded px-2 py-1 text-xs font-medium min-h-8",
                interval === item.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {interval === "minute" ? (
          <>
            <div className="flex flex-wrap gap-0.5">
              {MINUTE_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setMinuteSize(s);
                    setRange(defaultMinuteRange(s));
                  }}
                  className={cn(
                    "rounded px-1.5 py-1 text-[11px] tabular min-h-8",
                    minuteSize === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {s}m
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-0.5">
              {minuteRangeOpts.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRange(r.id)}
                  className={cn(
                    "rounded px-1.5 py-1 text-[11px] min-h-8",
                    range === r.id
                      ? "bg-desk-gold/25 text-desk-gold ring-1 ring-desk-gold/40"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-0.5">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                className={cn(
                  "rounded px-1.5 py-1 text-[11px] min-h-8",
                  range === r.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Drawing tools */}
        <div className="flex flex-wrap gap-0.5">
          {tools.map((t) => (
            <button
              key={t.id}
              type="button"
              title={t.tip}
              onClick={() => {
                setTool(t.id);
                setPending(null);
              }}
              className={cn(
                "inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium min-h-8",
                tool === t.id
                  ? "bg-desk-gold/20 text-desk-gold ring-1 ring-desk-gold/40"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          title="자석 (OHLC 스냅)"
          onClick={() => setMagnet((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] min-h-8",
            magnet
              ? "bg-desk-teal/20 text-desk-teal"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Magnet className="size-3.5" /> 자석
        </button>

        <button
          type="button"
          title="피봇 기반 자동 지지/저항"
          onClick={autoSR}
          className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-[11px] min-h-8 text-muted-foreground hover:text-foreground"
        >
          <Crosshair className="size-3.5" /> Auto S/R
        </button>

        <button
          type="button"
          onClick={clearDrawings}
          className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-[11px] min-h-8 text-desk-rose"
        >
          <Trash2 className="size-3.5" /> 전체삭제
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        <button
          type="button"
          onClick={zoomInBars}
          className="rounded bg-muted px-2 py-1 text-[11px] min-h-8"
          title="구간 확대"
        >
          <ZoomIn className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={zoomOutBars}
          className="rounded bg-muted px-2 py-1 text-[11px] min-h-8"
          title="구간 축소"
        >
          <ZoomIn className="size-3.5 rotate-180 scale-x-[-1]" />
        </button>
        <button
          type="button"
          onClick={fitContent}
          className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-[11px] min-h-8"
          title="전체 보기"
        >
          <Maximize2 className="size-3.5" /> Fit
        </button>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded bg-muted px-2 py-1 text-[11px] min-h-8"
          title="차트 데이터 강제 갱신"
        >
          갱신
        </button>

        <button
          type="button"
          onClick={() => setLogScale((v) => !v)}
          className={cn(
            "rounded px-2 py-1 text-[11px] min-h-8",
            logScale
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          Log
        </button>

        {(isLoading || isFetching) && (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground ml-auto" />
        )}
      </div>

      {/* Indicator toggles + OHLC HUD */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-1.5 text-xs">
        {MA_META.map((m) => (
          <label
            key={m.key}
            className="inline-flex items-center gap-1 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={showMa[m.key]}
              onChange={() =>
                setShowMa((s) => ({ ...s, [m.key]: !s[m.key] }))
              }
              className="size-3 accent-primary"
            />
            <span style={{ color: m.color }}>{m.label}</span>
          </label>
        ))}
        <label className="inline-flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={showBb}
            onChange={() => setShowBb((v) => !v)}
            className="size-3 accent-primary"
          />
          BB(20)
        </label>
        <label className="inline-flex items-center gap-1 cursor-pointer" title="분봉: 세션(일) 리셋 VWAP / 일봉: 누적">
          <input
            type="checkbox"
            checked={showVwap}
            onChange={() => setShowVwap((v) => !v)}
            className="size-3 accent-primary"
          />
          {interval === "minute" ? "세션VWAP" : "VWAP"}
        </label>
        <label className="inline-flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={showAtr}
            onChange={() => setShowAtr((v) => !v)}
            className="size-3 accent-primary"
          />
          ATR
        </label>
        <label className="inline-flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={showRsi}
            onChange={() => setShowRsi((v) => !v)}
            className="size-3 accent-primary"
          />
          RSI(14)
        </label>
        <label className="inline-flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={showMacd}
            onChange={() => setShowMacd((v) => !v)}
            className="size-3 accent-primary"
          />
          MACD
        </label>

        {displayBar && (
          <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-0.5 tabular text-[11px] sm:text-xs">
            <span className="text-muted-foreground">{displayBar.date}</span>
            <span>
              O <b>{formatPrice(displayBar.open)}</b>
            </span>
            <span>
              H <b>{formatPrice(displayBar.high)}</b>
            </span>
            <span>
              L <b>{formatPrice(displayBar.low)}</b>
            </span>
            <span>
              C{" "}
              <b
                style={{
                  color: displayBar.bullish ? upColor : downColor,
                }}
              >
                {formatPrice(displayBar.close)}
              </b>
            </span>
            <span className="text-muted-foreground">
              V {formatVolume(displayBar.volume)}
            </span>
            {Number.isFinite(rangeChg) && (
              <span
                style={{
                  color: rangeChg >= 0 ? upColor : downColor,
                }}
              >
                구간 {rangeChg >= 0 ? "+" : ""}
                {rangeChg.toFixed(2)}%
              </span>
            )}
            {atrHud && (
              <span className="text-muted-foreground">
                ATR14 {formatPrice(Math.round(atrHud.atr))} (
                {atrHud.pct.toFixed(2)}%)
              </span>
            )}
          </div>
        )}
      </div>

      <div className="border-b border-border bg-muted/20 px-3 py-1 text-[10px] text-muted-foreground leading-relaxed">
        차트 OHLC: Yahoo/네이버 비공식 경로 · 체결 스트림과 마지막 봉이 어긋날 수 있음 ·
        실주문 전 HTS 재확인 · 휠=줌 · 드래그=이동 · H 수평선 T 추세선
      </div>

      {tool !== "cursor" && (
        <div className="bg-desk-gold/10 px-3 py-1.5 text-xs text-desk-gold border-b border-border">
          {tool === "hline" &&
            "차트 클릭 → 지지/저항 수평선 (가격 라벨 자동). Esc 취소"}
          {tool === "trend" &&
            "시작점 클릭 후 끝점 클릭 → 추세선 + 양끝 가격"}
          {tool === "ray" && "두 점 클릭 → 우측 연장 레이"}
          {tool === "fib" && "스윙 저점·고점 두 클릭 → 피보나치 레벨"}
          {tool === "measure" && "두 점 사이 가격·%·봉수 측정"}
          {tool === "erase" && "지울 선 근처 클릭 (Backspace=마지막 삭제)"}
          {pending && " · 첫 점 고정됨 — 두 번째 점을 클릭하세요"}
          {measureLabel && ` · 측정: ${measureLabel}`}
        </div>
      )}

      {/* Chart canvas */}
      <div className="relative" style={{ height: chartH }}>
        {isLoading && bars.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin mr-2" /> 차트 로딩…
          </div>
        )}
        {isError && bars.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-price-down">
            차트 데이터를 불러오지 못했습니다
          </div>
        )}
        <div
          ref={wrapRef}
          className="absolute inset-0"
          style={{
            cursor:
              tool === "cursor"
                ? "crosshair"
                : tool === "erase"
                  ? "pointer"
                  : "cell",
          }}
        />
        <svg
          ref={overlayRef}
          className="pointer-events-none absolute inset-0 z-[5]"
          width="100%"
          height="100%"
        />
      </div>

      {/* Resize handle */}
      <div
        role="separator"
        aria-label="차트 높이 조절"
        onMouseDown={onHeightDown}
        className="flex h-3 cursor-ns-resize items-center justify-center border-t border-border bg-muted/30 hover:bg-desk-gold/20"
      >
        <div className="h-0.5 w-10 rounded bg-border" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 text-[10px] text-muted-foreground border-t border-border">
        <span>
          휠=줌 · 드래그=이동 · 축 드래그=가격/시간 스케일 · 더블클릭 축=리셋 ·
          그림은 종목별 자동 저장
        </span>
        <span>
          OHLC {source || "—"} · {bars.length.toLocaleString("ko-KR")}봉 · 드로잉{" "}
          {drawings.length}
          {interval === "minute"
            ? " · 분봉은 봉주기별 최대 기간 지원(1m≤7일, 5~30m≤60일, 60m≤2년)"
            : ""}
        </span>
      </div>
    </div>
  );
}
