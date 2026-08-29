import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { C as Minus, D as LoaderCircle, E as Magnet, T as Maximize2, U as Crosshair, V as Eraser, g as Ruler, j as Layers, o as TrendingUp, s as Trash2, t as ZoomIn, x as MousePointer2 } from "../_libs/lucide-react.mjs";
import { B as formatPrice, H as formatVolume, J as cn, K as useAppStore, v as useChartData } from "./router-B3Rw4zmt.mjs";
import { a as bi, c as nr, i as Qe, l as ye, n as K, o as h, r as Nr, s as le } from "../_libs/lightweight-charts.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/TradingChart-D04RH6MR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Client-side technical indicators used by the pro trading chart. */
function sma(values, period) {
	const out = [];
	let sum = 0;
	for (let i = 0; i < values.length; i++) {
		sum += values[i];
		if (i >= period) sum -= values[i - period];
		out.push(i >= period - 1 ? sum / period : null);
	}
	return out;
}
function ema(values, period) {
	const out = [];
	const k = 2 / (period + 1);
	let prev = null;
	for (let i = 0; i < values.length; i++) {
		const v = values[i];
		if (i < period - 1) {
			out.push(null);
			continue;
		}
		if (prev == null) {
			let s = 0;
			for (let j = i - period + 1; j <= i; j++) s += values[j];
			prev = s / period;
		} else prev = v * k + prev * (1 - k);
		out.push(prev);
	}
	return out;
}
function bollinger(closes, period = 20, mult = 2) {
	const mid = sma(closes, period);
	const upper = [];
	const lower = [];
	for (let i = 0; i < closes.length; i++) {
		if (mid[i] == null) {
			upper.push(null);
			lower.push(null);
			continue;
		}
		let sumSq = 0;
		for (let j = i - period + 1; j <= i; j++) {
			const d = closes[j] - mid[i];
			sumSq += d * d;
		}
		const sd = Math.sqrt(sumSq / period);
		upper.push(mid[i] + mult * sd);
		lower.push(mid[i] - mult * sd);
	}
	return {
		mid,
		upper,
		lower
	};
}
function rsi(closes, period = 14) {
	const out = [null];
	let avgGain = 0;
	let avgLoss = 0;
	for (let i = 1; i < closes.length; i++) {
		const ch = closes[i] - closes[i - 1];
		const gain = Math.max(ch, 0);
		const loss = Math.max(-ch, 0);
		if (i < period) {
			avgGain += gain;
			avgLoss += loss;
			out.push(null);
			continue;
		}
		if (i === period) {
			avgGain = (avgGain + gain) / period;
			avgLoss = (avgLoss + loss) / period;
		} else {
			avgGain = (avgGain * (period - 1) + gain) / period;
			avgLoss = (avgLoss * (period - 1) + loss) / period;
		}
		if (avgLoss === 0) out.push(100);
		else {
			const rs = avgGain / avgLoss;
			out.push(100 - 100 / (1 + rs));
		}
	}
	return out;
}
function macd(closes, fast = 12, slow = 26, signal = 9) {
	const emaFast = ema(closes, fast);
	const emaSlow = ema(closes, slow);
	const macdLine = closes.map((_, i) => emaFast[i] != null && emaSlow[i] != null ? emaFast[i] - emaSlow[i] : null);
	const compact = [];
	const idxMap = [];
	macdLine.forEach((v, i) => {
		if (v != null) {
			compact.push(v);
			idxMap.push(i);
		}
	});
	const sigCompact = ema(compact, signal);
	const signalLine = closes.map(() => null);
	const hist = closes.map(() => null);
	idxMap.forEach((orig, j) => {
		signalLine[orig] = sigCompact[j];
		if (macdLine[orig] != null && sigCompact[j] != null) hist[orig] = macdLine[orig] - sigCompact[j];
	});
	return {
		macd: macdLine,
		signal: signalLine,
		hist
	};
}
/**
* VWAP. For intraday, pass sessionKeys (e.g. YYYY-MM-DD) to reset each KRX session.
* Without keys, computes one cumulative series (daily “anchored” style — label accordingly).
*/
function vwap(highs, lows, closes, volumes, sessionKeys) {
	const out = [];
	let cumPV = 0;
	let cumV = 0;
	let prevKey;
	for (let i = 0; i < closes.length; i++) {
		const key = sessionKeys?.[i];
		if (key != null && prevKey != null && key !== prevKey) {
			cumPV = 0;
			cumV = 0;
		}
		if (key != null) prevKey = key;
		const tp = (highs[i] + lows[i] + closes[i]) / 3;
		const v = Math.max(volumes[i], 0);
		cumPV += tp * v;
		cumV += v;
		out.push(cumV > 0 ? cumPV / cumV : null);
	}
	return out;
}
/** Last non-null ATR value helper */
function lastNumber(arr) {
	for (let i = arr.length - 1; i >= 0; i--) if (arr[i] != null) return arr[i];
	return null;
}
/** Pivot highs/lows for auto support & resistance. */
function findPivots(highs, lows, left = 3, right = 3) {
	const highIdx = [];
	const lowIdx = [];
	for (let i = left; i < highs.length - right; i++) {
		let isH = true;
		let isL = true;
		for (let j = i - left; j <= i + right; j++) {
			if (j === i) continue;
			if (highs[j] > highs[i]) isH = false;
			if (lows[j] < lows[i]) isL = false;
		}
		if (isH) highIdx.push(i);
		if (isL) lowIdx.push(i);
	}
	return {
		highIdx,
		lowIdx
	};
}
function atr(highs, lows, closes, period = 14) {
	const tr = [];
	for (let i = 0; i < highs.length; i++) if (i === 0) tr.push(highs[i] - lows[i]);
	else tr.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
	return sma(tr, period);
}
var INTERVALS = [
	{
		id: "minute",
		label: "분"
	},
	{
		id: "day",
		label: "일"
	},
	{
		id: "week",
		label: "주"
	},
	{
		id: "month",
		label: "월"
	},
	{
		id: "year",
		label: "년"
	}
];
var MINUTE_SIZES = [
	1,
	3,
	5,
	10,
	15,
	30,
	60
];
var RANGES = [
	{
		id: "1mo",
		label: "1M"
	},
	{
		id: "3mo",
		label: "3M"
	},
	{
		id: "6mo",
		label: "6M"
	},
	{
		id: "1y",
		label: "1Y"
	},
	{
		id: "2y",
		label: "2Y"
	},
	{
		id: "5y",
		label: "5Y"
	},
	{
		id: "max",
		label: "MAX"
	}
];
/** Professional minute history windows (Yahoo hard limits). */
function minuteRangesFor(size) {
	if (size <= 1) return [
		{
			id: "1d",
			label: "1일"
		},
		{
			id: "5d",
			label: "5일"
		},
		{
			id: "7d",
			label: "7일"
		}
	];
	if (size === 3) return [
		{
			id: "1d",
			label: "1일"
		},
		{
			id: "5d",
			label: "5일"
		},
		{
			id: "7d",
			label: "7일"
		}
	];
	if (size < 60) return [
		{
			id: "1d",
			label: "1일"
		},
		{
			id: "5d",
			label: "5일"
		},
		{
			id: "1mo",
			label: "1개월"
		},
		{
			id: "60d",
			label: "60일"
		}
	];
	return [
		{
			id: "1mo",
			label: "1개월"
		},
		{
			id: "3mo",
			label: "3개월"
		},
		{
			id: "6mo",
			label: "6개월"
		},
		{
			id: "1y",
			label: "1년"
		},
		{
			id: "2y",
			label: "2년"
		}
	];
}
function defaultMinuteRange(size) {
	if (size <= 1) return "7d";
	if (size === 3) return "7d";
	if (size < 60) return "60d";
	return "1y";
}
var MA_META = [
	{
		key: "ma5",
		label: "MA5",
		color: "#f59e0b"
	},
	{
		key: "ma20",
		label: "MA20",
		color: "#a78bfa"
	},
	{
		key: "ma60",
		label: "MA60",
		color: "#38bdf8"
	},
	{
		key: "ma120",
		label: "MA120",
		color: "#94a3b8"
	}
];
function barTime(bar) {
	if (bar.date.includes(" ")) {
		const iso = bar.date.replace(" ", "T") + ":00+09:00";
		const ms = Date.parse(iso);
		if (!Number.isNaN(ms)) return Math.floor(ms / 1e3);
	}
	return bar.date.slice(0, 10);
}
function loadDrawings(code) {
	try {
		const raw = localStorage.getItem(`ke-chart-draw:${code}`);
		if (!raw) return [];
		return JSON.parse(raw);
	} catch {
		return [];
	}
}
function saveDrawings(code, items) {
	try {
		localStorage.setItem(`ke-chart-draw:${code}`, JSON.stringify(items));
	} catch {}
}
function uid() {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
function TradingChart({ code, market, eventMarkers = [] }) {
	const [interval, setInterval] = (0, import_react.useState)("day");
	const [minuteSize, setMinuteSize] = (0, import_react.useState)(5);
	const [range, setRange] = (0, import_react.useState)("2y");
	const [showMa, setShowMa] = (0, import_react.useState)({
		ma5: true,
		ma20: true,
		ma60: true,
		ma120: false
	});
	const [showBb, setShowBb] = (0, import_react.useState)(false);
	const [showAtr, setShowAtr] = (0, import_react.useState)(true);
	const [showVwap, setShowVwap] = (0, import_react.useState)(true);
	const [showRsi, setShowRsi] = (0, import_react.useState)(true);
	const [showMacd, setShowMacd] = (0, import_react.useState)(false);
	const [logScale, setLogScale] = (0, import_react.useState)(false);
	const [magnet, setMagnet] = (0, import_react.useState)(true);
	const [tool, setTool] = (0, import_react.useState)("cursor");
	const [chartH, setChartH] = (0, import_react.useState)(480);
	const [drawings, setDrawings] = (0, import_react.useState)(() => loadDrawings(code));
	const [hover, setHover] = (0, import_react.useState)(null);
	const [measureLabel, setMeasureLabel] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (interval === "minute") {
			if (!minuteRangesFor(minuteSize).some((o) => o.id === range)) setRange(defaultMinuteRange(minuteSize));
		} else if (!RANGES.some((o) => o.id === range)) setRange("2y");
	}, [interval, minuteSize]);
	const convention = useAppStore((s) => s.colorConvention);
	const upColor = convention === "korea" ? "#ef4444" : "#22c55e";
	const downColor = convention === "korea" ? "#3b82f6" : "#ef4444";
	const minuteRangeOpts = minuteRangesFor(minuteSize);
	const { data, isLoading, isError, isFetching, refetch } = useChartData({
		code,
		market,
		interval,
		minuteSize,
		range
	});
	const bars = data?.bars ?? [];
	const source = data?.source ?? "";
	(0, import_react.useEffect)(() => {
		setDrawings(loadDrawings(code));
		setPending(null);
		setMeasureLabel(null);
	}, [code]);
	(0, import_react.useEffect)(() => {
		saveDrawings(code, drawings);
	}, [code, drawings]);
	const wrapRef = (0, import_react.useRef)(null);
	const chartRef = (0, import_react.useRef)(null);
	const candleRef = (0, import_react.useRef)(null);
	const volRef = (0, import_react.useRef)(null);
	const maRefs = (0, import_react.useRef)({});
	const bbRefs = (0, import_react.useRef)({
		mid: null,
		upper: null,
		lower: null
	});
	const vwapRef = (0, import_react.useRef)(null);
	const rsiRef = (0, import_react.useRef)(null);
	const macdRef = (0, import_react.useRef)({
		macd: null,
		signal: null,
		hist: null
	});
	const priceLinesRef = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const overlayRef = (0, import_react.useRef)(null);
	const barsRef = (0, import_react.useRef)(bars);
	barsRef.current = bars;
	const toolRef = (0, import_react.useRef)(tool);
	toolRef.current = tool;
	const magnetRef = (0, import_react.useRef)(magnet);
	magnetRef.current = magnet;
	const pendingRef = (0, import_react.useRef)(pending);
	pendingRef.current = pending;
	const drawingsRef = (0, import_react.useRef)(drawings);
	drawingsRef.current = drawings;
	const last = bars[bars.length - 1];
	const first = bars[0];
	const rangeChg = last && first && first.open ? (last.close - first.open) / first.open * 100 : 0;
	const displayBar = hover ?? last;
	const atrHud = (0, import_react.useMemo)(() => {
		if (!showAtr || bars.length < 15) return null;
		const v = lastNumber(atr(bars.map((b) => b.high), bars.map((b) => b.low), bars.map((b) => b.close), 14));
		if (v == null || !last?.close) return null;
		return {
			atr: v,
			pct: v / last.close * 100
		};
	}, [
		bars,
		showAtr,
		last
	]);
	(0, import_react.useEffect)(() => {
		const series = candleRef.current;
		if (!series) return;
		if (interval === "minute" || !eventMarkers.length || bars.length === 0) {
			try {
				Nr(series, []);
			} catch {}
			return;
		}
		const byDay = /* @__PURE__ */ new Set();
		for (const m of eventMarkers) {
			const d = m.time.slice(0, 10);
			if (d) byDay.add(d);
		}
		const markers = bars.filter((b) => byDay.has(b.date.slice(0, 10))).slice(-25).map((b) => ({
			time: barTime(b),
			position: "aboveBar",
			color: "#e5b84c",
			shape: "circle",
			text: "공시"
		}));
		try {
			Nr(series, markers);
		} catch {}
	}, [
		bars,
		eventMarkers,
		interval
	]);
	(0, import_react.useEffect)(() => {
		const el = wrapRef.current;
		if (!el) return;
		const chart = le(el, {
			autoSize: true,
			layout: {
				background: { color: "transparent" },
				textColor: "#94a3b8",
				fontSize: 12,
				attributionLogo: false
			},
			grid: {
				vertLines: { color: "rgba(148,163,184,0.08)" },
				horzLines: { color: "rgba(148,163,184,0.08)" }
			},
			crosshair: {
				mode: K.MagnetOHLC,
				vertLine: {
					color: "rgba(148,163,184,0.35)",
					labelBackgroundColor: "#1e293b"
				},
				horzLine: {
					color: "rgba(148,163,184,0.35)",
					labelBackgroundColor: "#1e293b"
				}
			},
			rightPriceScale: {
				borderColor: "rgba(148,163,184,0.15)",
				scaleMargins: {
					top: .08,
					bottom: .2
				}
			},
			timeScale: {
				borderColor: "rgba(148,163,184,0.15)",
				timeVisible: true,
				secondsVisible: false,
				rightOffset: 6,
				barSpacing: 8,
				minBarSpacing: 2
			},
			handleScroll: {
				mouseWheel: true,
				pressedMouseMove: true,
				horzTouchDrag: true,
				vertTouchDrag: true
			},
			handleScale: {
				axisPressedMouseMove: {
					time: true,
					price: true
				},
				axisDoubleClickReset: true,
				mouseWheel: true,
				pinch: true
			}
		});
		const candles = chart.addSeries(Qe, {
			upColor,
			downColor,
			borderUpColor: upColor,
			borderDownColor: downColor,
			wickUpColor: upColor,
			wickDownColor: downColor,
			priceLineVisible: true,
			lastValueVisible: true
		});
		const volume = chart.addSeries(nr, {
			priceFormat: { type: "volume" },
			priceScaleId: "vol"
		});
		chart.priceScale("vol").applyOptions({ scaleMargins: {
			top: .8,
			bottom: 0
		} });
		for (const m of MA_META) maRefs.current[m.key] = chart.addSeries(ye, {
			color: m.color,
			lineWidth: 1,
			priceLineVisible: false,
			lastValueVisible: false,
			crosshairMarkerVisible: false
		});
		bbRefs.current.mid = chart.addSeries(ye, {
			color: "#64748b",
			lineWidth: 1,
			lineStyle: h.Dotted,
			priceLineVisible: false,
			lastValueVisible: false,
			crosshairMarkerVisible: false
		});
		bbRefs.current.upper = chart.addSeries(ye, {
			color: "#64748b",
			lineWidth: 1,
			priceLineVisible: false,
			lastValueVisible: false,
			crosshairMarkerVisible: false
		});
		bbRefs.current.lower = chart.addSeries(ye, {
			color: "#64748b",
			lineWidth: 1,
			priceLineVisible: false,
			lastValueVisible: false,
			crosshairMarkerVisible: false
		});
		vwapRef.current = chart.addSeries(ye, {
			color: "#eab308",
			lineWidth: 2,
			priceLineVisible: false,
			lastValueVisible: false,
			crosshairMarkerVisible: false
		});
		rsiRef.current = chart.addSeries(ye, {
			color: "#c084fc",
			lineWidth: 1,
			priceScaleId: "rsi",
			priceLineVisible: false,
			lastValueVisible: true,
			crosshairMarkerVisible: false
		}, 1);
		chart.priceScale("rsi", 1).applyOptions({
			scaleMargins: {
				top: .15,
				bottom: .15
			},
			borderVisible: false
		});
		chart.panes()[1]?.setHeight(72);
		macdRef.current.hist = chart.addSeries(nr, {
			priceScaleId: "macd",
			priceLineVisible: false,
			lastValueVisible: false
		}, 2);
		macdRef.current.macd = chart.addSeries(ye, {
			color: "#38bdf8",
			lineWidth: 1,
			priceScaleId: "macd",
			priceLineVisible: false,
			lastValueVisible: false,
			crosshairMarkerVisible: false
		}, 2);
		macdRef.current.signal = chart.addSeries(ye, {
			color: "#f472b6",
			lineWidth: 1,
			priceScaleId: "macd",
			priceLineVisible: false,
			lastValueVisible: false,
			crosshairMarkerVisible: false
		}, 2);
		chart.priceScale("macd", 2).applyOptions({
			scaleMargins: {
				top: .1,
				bottom: .1
			},
			borderVisible: false
		});
		chart.panes()[2]?.setHeight(72);
		chartRef.current = chart;
		candleRef.current = candles;
		volRef.current = volume;
		const onCross = (param) => {
			if (!param.time || !param.seriesData.size) {
				setHover(null);
				return;
			}
			const idx = barsRef.current.findIndex((b) => {
				const t = barTime(b);
				return String(t) === String(param.time);
			});
			if (idx >= 0) setHover(barsRef.current[idx]);
		};
		chart.subscribeCrosshairMove(onCross);
		const onClick = (param) => {
			const t = toolRef.current;
			if (t === "cursor" || t === "erase") return;
			if (!param.point || param.time == null) return;
			const series = candleRef.current;
			if (!series) return;
			const priceRaw = series.coordinateToPrice(param.point.y);
			if (priceRaw == null) return;
			let price = Number(priceRaw);
			if (!Number.isFinite(price)) return;
			let idx = barsRef.current.findIndex((b) => String(barTime(b)) === String(param.time));
			if (idx < 0) idx = barsRef.current.length - 1;
			const bar = barsRef.current[idx];
			if (!bar) return;
			if (magnetRef.current) {
				const candidates = [
					bar.open,
					bar.high,
					bar.low,
					bar.close
				];
				let best = candidates[0];
				let bestD = Math.abs(price - best);
				for (const c of candidates) {
					const d = Math.abs(price - c);
					if (d < bestD) {
						best = c;
						bestD = d;
					}
				}
				if (bestD / best < .004 || bestD < best * .002) price = best;
			}
			if (t === "hline") {
				const d = {
					id: uid(),
					type: "hline",
					price: Math.round(price),
					color: "#e5b84c",
					label: `S/R ${Math.round(price).toLocaleString("ko-KR")}`
				};
				setDrawings((prev) => [...prev, d]);
				return;
			}
			if (t === "trend" || t === "ray" || t === "fib" || t === "measure") {
				const p = pendingRef.current;
				if (!p) {
					setPending({
						t: idx,
						p: price
					});
					return;
				}
				const seg = {
					id: uid(),
					type: t,
					t1: p.t,
					p1: p.p,
					t2: idx,
					p2: price,
					color: t === "fib" ? "#a78bfa" : t === "measure" ? "#38bdf8" : "#f59e0b"
				};
				if (t === "measure") {
					const chg = price - p.p;
					const pct = p.p ? chg / p.p * 100 : 0;
					setMeasureLabel(`${chg >= 0 ? "+" : ""}${Math.round(chg).toLocaleString("ko-KR")} (${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%) · ${Math.abs(idx - p.t)}봉`);
				}
				setDrawings((prev) => [...prev, seg]);
				setPending(null);
				if (t === "measure") setTool("cursor");
			}
		};
		chart.subscribeClick(onClick);
		const ro = new ResizeObserver(() => {
			chart.applyOptions({
				width: el.clientWidth,
				height: el.clientHeight
			});
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
	}, [upColor, downColor]);
	(0, import_react.useEffect)(() => {
		chartRef.current?.priceScale("right").applyOptions({ mode: logScale ? bi.Logarithmic : bi.Normal });
	}, [logScale]);
	(0, import_react.useEffect)(() => {
		chartRef.current?.applyOptions({ crosshair: { mode: magnet ? K.MagnetOHLC : K.Normal } });
	}, [magnet]);
	(0, import_react.useEffect)(() => {
		const chart = chartRef.current;
		if (!chart) return;
		try {
			const panes = chart.panes();
			if (panes[1]) panes[1].setHeight(showRsi ? 80 : 0);
			if (panes[2]) panes[2].setHeight(showMacd ? 80 : 0);
		} catch {}
	}, [
		showRsi,
		showMacd,
		bars.length
	]);
	(0, import_react.useEffect)(() => {
		const candles = candleRef.current;
		const vol = volRef.current;
		const chart = chartRef.current;
		if (!candles || !vol || !chart || bars.length === 0) return;
		const candleData = bars.map((b) => ({
			time: barTime(b),
			open: b.open,
			high: b.high,
			low: b.low,
			close: b.close
		}));
		candles.setData(candleData);
		const volData = bars.map((b) => ({
			time: barTime(b),
			value: b.volume,
			color: b.bullish ? upColor + "66" : downColor + "66"
		}));
		vol.setData(volData);
		for (const m of MA_META) {
			const series = maRefs.current[m.key];
			if (!series) continue;
			if (!showMa[m.key]) {
				series.setData([]);
				continue;
			}
			const data = [];
			for (const b of bars) {
				const v = b[m.key];
				if (v != null) data.push({
					time: barTime(b),
					value: v
				});
			}
			series.setData(data);
		}
		const closes = bars.map((b) => b.close);
		const highs = bars.map((b) => b.high);
		const lows = bars.map((b) => b.low);
		const volumes = bars.map((b) => b.volume);
		if (showBb) {
			const bb = bollinger(closes, 20, 2);
			const toLine = (arr) => {
				const out = [];
				arr.forEach((v, i) => {
					if (v != null) out.push({
						time: barTime(bars[i]),
						value: v
					});
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
		if (showVwap) {
			const vw = vwap(highs, lows, closes, volumes, interval === "minute" ? bars.map((b) => b.date.slice(0, 10)) : void 0);
			const data = [];
			vw.forEach((v, i) => {
				if (v != null) data.push({
					time: barTime(bars[i]),
					value: v
				});
			});
			vwapRef.current?.setData(data);
		} else vwapRef.current?.setData([]);
		if (showRsi) {
			const r = rsi(closes, 14);
			const data = [];
			r.forEach((v, i) => {
				if (v != null) data.push({
					time: barTime(bars[i]),
					value: v
				});
			});
			rsiRef.current?.setData(data);
			rsiRef.current?.applyOptions({ visible: true });
		} else rsiRef.current?.setData([]);
		if (showMacd) {
			const m = macd(closes);
			const macdData = [];
			const sigData = [];
			const histData = [];
			m.macd.forEach((v, i) => {
				if (v != null) macdData.push({
					time: barTime(bars[i]),
					value: v
				});
			});
			m.signal.forEach((v, i) => {
				if (v != null) sigData.push({
					time: barTime(bars[i]),
					value: v
				});
			});
			m.hist.forEach((v, i) => {
				if (v != null) histData.push({
					time: barTime(bars[i]),
					value: v,
					color: v >= 0 ? upColor + "99" : downColor + "99"
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
		requestAnimationFrame(redrawOverlay);
	}, [
		bars,
		showMa,
		showBb,
		showVwap,
		showRsi,
		showMacd,
		upColor,
		downColor
	]);
	(0, import_react.useEffect)(() => {
		const series = candleRef.current;
		if (!series) return;
		for (const [, pl] of priceLinesRef.current) try {
			series.removePriceLine(pl);
		} catch {}
		priceLinesRef.current.clear();
		for (const d of drawings) {
			if (d.type === "hline") {
				const pl = series.createPriceLine({
					price: d.price,
					color: d.color,
					lineWidth: 2,
					lineStyle: h.Solid,
					axisLabelVisible: true,
					title: d.label
				});
				priceLinesRef.current.set(d.id, pl);
			}
			if (d.type === "fib") {
				const hi = Math.max(d.p1, d.p2);
				const span = hi - Math.min(d.p1, d.p2) || 1;
				[
					{
						r: 0,
						c: "#94a3b8"
					},
					{
						r: .236,
						c: "#f472b6"
					},
					{
						r: .382,
						c: "#fb923c"
					},
					{
						r: .5,
						c: "#eab308"
					},
					{
						r: .618,
						c: "#34d399"
					},
					{
						r: .786,
						c: "#38bdf8"
					},
					{
						r: 1,
						c: "#94a3b8"
					}
				].forEach((lv, i) => {
					const price = hi - span * lv.r;
					const pl = series.createPriceLine({
						price,
						color: lv.c,
						lineWidth: 1,
						lineStyle: h.Dashed,
						axisLabelVisible: true,
						title: `Fib ${lv.r} ${Math.round(price).toLocaleString("ko-KR")}`
					});
					priceLinesRef.current.set(`${d.id}-f${i}`, pl);
				});
			}
		}
		redrawOverlay();
	}, [drawings, bars.length]);
	const redrawOverlay = (0, import_react.useCallback)(() => {
		const svg = overlayRef.current;
		const chart = chartRef.current;
		const series = candleRef.current;
		if (!svg || !chart || !series) return;
		const w = svg.clientWidth || svg.parentElement?.clientWidth || 0;
		const h = svg.clientHeight || svg.parentElement?.clientHeight || 0;
		svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
		while (svg.firstChild) svg.removeChild(svg.firstChild);
		const barsNow = barsRef.current;
		const ts = chart.timeScale();
		const toXY = (barIdx, price) => {
			const bar = barsNow[barIdx];
			if (!bar) return null;
			const x = ts.timeToCoordinate(barTime(bar));
			const y = series.priceToCoordinate(price);
			if (x == null || y == null) return null;
			return {
				x,
				y
			};
		};
		for (const d of drawingsRef.current) {
			if (d.type !== "trend" && d.type !== "ray" && d.type !== "measure") continue;
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
					const scale = 5e3 / (Math.sqrt(dx * dx + dy * dy) || 1);
					x2 = x1 + dx * scale;
					y2 = y1 + dy * scale;
				}
			}
			const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
			line.setAttribute("x1", String(x1));
			line.setAttribute("y1", String(y1));
			line.setAttribute("x2", String(x2));
			line.setAttribute("y2", String(y2));
			line.setAttribute("stroke", d.color);
			line.setAttribute("stroke-width", d.type === "measure" ? "1.5" : "2");
			if (d.type === "measure") line.setAttribute("stroke-dasharray", "4 3");
			line.setAttribute("stroke-linecap", "round");
			svg.appendChild(line);
			for (const [px, py, price] of [[
				a.x,
				a.y,
				d.p1
			], [
				b.x,
				b.y,
				d.p2
			]]) {
				const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
				const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
				const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
				const label = Math.round(price).toLocaleString("ko-KR");
				text.textContent = label;
				text.setAttribute("x", String(px + 6));
				text.setAttribute("y", String(py - 6));
				text.setAttribute("fill", d.color);
				text.setAttribute("font-size", "11");
				text.setAttribute("font-weight", "600");
				text.setAttribute("font-family", "ui-sans-serif, system-ui");
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
				const pct = d.p1 ? chg / d.p1 * 100 : 0;
				const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
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
		const p = pendingRef.current;
		if (p) {
			const pt = toXY(p.t, p.p);
			if (pt) {
				const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
				c.setAttribute("cx", String(pt.x));
				c.setAttribute("cy", String(pt.y));
				c.setAttribute("r", "4");
				c.setAttribute("fill", "#e5b84c");
				svg.appendChild(c);
			}
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (tool !== "erase") return;
		const chart = chartRef.current;
		if (!chart) return;
		const handler = (param) => {
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
						const dist = Math.min(Math.abs(d.p1 - price), Math.abs(d.p2 - price));
						if (dist < bestD) {
							bestD = dist;
							bestI = i;
						}
					}
				});
				if (bestI < 0 || bestD > price * .01) return prev;
				return prev.filter((_, i) => i !== bestI);
			});
		};
		chart.subscribeClick(handler);
		return () => {
			try {
				chart.unsubscribeClick(handler);
			} catch {}
		};
	}, [tool]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
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
			if (e.key === "Delete" || e.key === "Backspace") setDrawings((prev) => prev.slice(0, -1));
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
			to: mid + half
		});
		redrawOverlay();
	};
	const zoomOutBars = () => {
		const ts = chartRef.current?.timeScale();
		if (!ts) return;
		const r = ts.getVisibleLogicalRange();
		if (!r) return;
		const mid = (r.from + r.to) / 2;
		const half = (r.to - r.from) / 2 * 1.4;
		ts.setVisibleLogicalRange({
			from: mid - half,
			to: mid + half
		});
		redrawOverlay();
	};
	const autoSR = () => {
		if (bars.length < 20) return;
		const { highIdx, lowIdx } = findPivots(bars.map((b) => b.high), bars.map((b) => b.low), 4, 4);
		const recentH = highIdx.slice(-5);
		const recentL = lowIdx.slice(-5);
		const next = [];
		for (const i of recentH) {
			const price = bars[i].high;
			next.push({
				id: uid(),
				type: "hline",
				price,
				color: "#f87171",
				label: `R ${price.toLocaleString("ko-KR")}`
			});
		}
		for (const i of recentL) {
			const price = bars[i].low;
			next.push({
				id: uid(),
				type: "hline",
				price,
				color: "#4ade80",
				label: `S ${price.toLocaleString("ko-KR")}`
			});
		}
		const merged = [];
		for (const d of next) {
			if (d.type !== "hline") continue;
			if (!merged.find((m) => m.type === "hline" && Math.abs(m.price - d.price) / d.price < .008)) merged.push(d);
		}
		setDrawings((prev) => [...prev.filter((x) => !(x.type === "hline" && (x.label.startsWith("R ") || x.label.startsWith("S ")))), ...merged]);
	};
	const clearDrawings = () => {
		setDrawings([]);
		setPending(null);
		setMeasureLabel(null);
	};
	const dragH = (0, import_react.useRef)(null);
	const onHeightDown = (e) => {
		dragH.current = {
			y: e.clientY,
			h: chartH
		};
		const onMove = (ev) => {
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
	const tools = [
		{
			id: "cursor",
			label: "선택",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MousePointer2, { className: "size-3.5" }),
			tip: "드래그 이동 · 휠 줌 (V)"
		},
		{
			id: "hline",
			label: "수평선",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-3.5" }),
			tip: "지지/저항 수평선 + 가격 (H)"
		},
		{
			id: "trend",
			label: "추세선",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3.5" }),
			tip: "두 점 클릭 추세선 (T)"
		},
		{
			id: "ray",
			label: "레이",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3.5 rotate-12" }),
			tip: "연장 추세선 (R)"
		},
		{
			id: "fib",
			label: "피보",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-3.5" }),
			tip: "피보나치 되돌림 (F)"
		},
		{
			id: "measure",
			label: "측정",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ruler, { className: "size-3.5" }),
			tip: "가격·% 거리 측정 (M)"
		},
		{
			id: "erase",
			label: "지우기",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eraser, { className: "size-3.5" }),
			tip: "가까운 선 클릭 삭제"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "desk-card desk-card-navy overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-1.5 border-b border-border px-2.5 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-0.5 rounded-md bg-muted p-0.5",
						children: INTERVALS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setInterval(item.id);
								if (item.id === "minute") setRange(defaultMinuteRange(minuteSize));
								else if (item.id === "day") setRange("2y");
								else if (item.id === "week") setRange("5y");
								else setRange("max");
							},
							className: cn("rounded px-2 py-1 text-xs font-medium min-h-8", interval === item.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
							children: item.label
						}, item.id))
					}),
					interval === "minute" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-0.5",
						children: MINUTE_SIZES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setMinuteSize(s);
								setRange(defaultMinuteRange(s));
							},
							className: cn("rounded px-1.5 py-1 text-[11px] tabular min-h-8", minuteSize === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
							children: [s, "m"]
						}, s))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-0.5",
						children: minuteRangeOpts.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setRange(r.id),
							className: cn("rounded px-1.5 py-1 text-[11px] min-h-8", range === r.id ? "bg-desk-gold/25 text-desk-gold ring-1 ring-desk-gold/40" : "bg-muted text-muted-foreground"),
							children: r.label
						}, r.id))
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-0.5",
						children: RANGES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setRange(r.id),
							className: cn("rounded px-1.5 py-1 text-[11px] min-h-8", range === r.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
							children: r.label
						}, r.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-1 h-5 w-px bg-border" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-0.5",
						children: tools.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							title: t.tip,
							onClick: () => {
								setTool(t.id);
								setPending(null);
							},
							className: cn("inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium min-h-8", tool === t.id ? "bg-desk-gold/20 text-desk-gold ring-1 ring-desk-gold/40" : "bg-muted text-muted-foreground hover:text-foreground"),
							children: [t.icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: t.label
							})]
						}, t.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						title: "자석 (OHLC 스냅)",
						onClick: () => setMagnet((v) => !v),
						className: cn("inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] min-h-8", magnet ? "bg-desk-teal/20 text-desk-teal" : "bg-muted text-muted-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Magnet, { className: "size-3.5" }), " 자석"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						title: "피봇 기반 자동 지지/저항",
						onClick: autoSR,
						className: "inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-[11px] min-h-8 text-muted-foreground hover:text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { className: "size-3.5" }), " Auto S/R"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: clearDrawings,
						className: "inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-[11px] min-h-8 text-desk-rose",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), " 전체삭제"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-1 h-5 w-px bg-border" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: zoomInBars,
						className: "rounded bg-muted px-2 py-1 text-[11px] min-h-8",
						title: "구간 확대",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, { className: "size-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: zoomOutBars,
						className: "rounded bg-muted px-2 py-1 text-[11px] min-h-8",
						title: "구간 축소",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, { className: "size-3.5 rotate-180 scale-x-[-1]" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: fitContent,
						className: "inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-[11px] min-h-8",
						title: "전체 보기",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-3.5" }), " Fit"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => refetch(),
						className: "rounded bg-muted px-2 py-1 text-[11px] min-h-8",
						title: "차트 데이터 강제 갱신",
						children: "갱신"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setLogScale((v) => !v),
						className: cn("rounded px-2 py-1 text-[11px] min-h-8", logScale ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
						children: "Log"
					}),
					(isLoading || isFetching) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin text-muted-foreground ml-auto" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 border-b border-border px-3 py-1.5 text-xs",
				children: [
					MA_META.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex items-center gap-1 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: showMa[m.key],
							onChange: () => setShowMa((s) => ({
								...s,
								[m.key]: !s[m.key]
							})),
							className: "size-3 accent-primary"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: { color: m.color },
							children: m.label
						})]
					}, m.key)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex items-center gap-1 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: showBb,
							onChange: () => setShowBb((v) => !v),
							className: "size-3 accent-primary"
						}), "BB(20)"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex items-center gap-1 cursor-pointer",
						title: "분봉: 세션(일) 리셋 VWAP / 일봉: 누적",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: showVwap,
							onChange: () => setShowVwap((v) => !v),
							className: "size-3 accent-primary"
						}), interval === "minute" ? "세션VWAP" : "VWAP"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex items-center gap-1 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: showAtr,
							onChange: () => setShowAtr((v) => !v),
							className: "size-3 accent-primary"
						}), "ATR"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex items-center gap-1 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: showRsi,
							onChange: () => setShowRsi((v) => !v),
							className: "size-3 accent-primary"
						}), "RSI(14)"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex items-center gap-1 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: showMacd,
							onChange: () => setShowMacd((v) => !v),
							className: "size-3 accent-primary"
						}), "MACD"]
					}),
					displayBar && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex flex-wrap items-center gap-x-3 gap-y-0.5 tabular text-[11px] sm:text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: displayBar.date
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["O ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: formatPrice(displayBar.open) })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["H ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: formatPrice(displayBar.high) })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["L ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: formatPrice(displayBar.low) })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"C",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
									style: { color: displayBar.bullish ? upColor : downColor },
									children: formatPrice(displayBar.close)
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: ["V ", formatVolume(displayBar.volume)]
							}),
							Number.isFinite(rangeChg) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: { color: rangeChg >= 0 ? upColor : downColor },
								children: [
									"구간 ",
									rangeChg >= 0 ? "+" : "",
									rangeChg.toFixed(2),
									"%"
								]
							}),
							atrHud && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									"ATR14 ",
									formatPrice(Math.round(atrHud.atr)),
									" (",
									atrHud.pct.toFixed(2),
									"%)"
								]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b border-border bg-muted/20 px-3 py-1 text-[10px] text-muted-foreground leading-relaxed",
				children: "차트 OHLC: Yahoo/네이버 비공식 경로 · 체결 스트림과 마지막 봉이 어긋날 수 있음 · 실주문 전 HTS 재확인 · 휠=줌 · 드래그=이동 · H 수평선 T 추세선"
			}),
			tool !== "cursor" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-desk-gold/10 px-3 py-1.5 text-xs text-desk-gold border-b border-border",
				children: [
					tool === "hline" && "차트 클릭 → 지지/저항 수평선 (가격 라벨 자동). Esc 취소",
					tool === "trend" && "시작점 클릭 후 끝점 클릭 → 추세선 + 양끝 가격",
					tool === "ray" && "두 점 클릭 → 우측 연장 레이",
					tool === "fib" && "스윙 저점·고점 두 클릭 → 피보나치 레벨",
					tool === "measure" && "두 점 사이 가격·%·봉수 측정",
					tool === "erase" && "지울 선 근처 클릭 (Backspace=마지막 삭제)",
					pending && " · 첫 점 고정됨 — 두 번째 점을 클릭하세요",
					measureLabel && ` · 측정: ${measureLabel}`
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				style: { height: chartH },
				children: [
					isLoading && bars.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 z-10 flex items-center justify-center bg-background/40 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin mr-2" }), " 차트 로딩…"]
					}),
					isError && bars.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 z-10 flex items-center justify-center text-sm text-price-down",
						children: "차트 데이터를 불러오지 못했습니다"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: wrapRef,
						className: "absolute inset-0",
						style: { cursor: tool === "cursor" ? "crosshair" : tool === "erase" ? "pointer" : "cell" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						ref: overlayRef,
						className: "pointer-events-none absolute inset-0 z-[5]",
						width: "100%",
						height: "100%"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "separator",
				"aria-label": "차트 높이 조절",
				onMouseDown: onHeightDown,
				className: "flex h-3 cursor-ns-resize items-center justify-center border-t border-border bg-muted/30 hover:bg-desk-gold/20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-0.5 w-10 rounded bg-border" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 text-[10px] text-muted-foreground border-t border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "휠=줌 · 드래그=이동 · 축 드래그=가격/시간 스케일 · 더블클릭 축=리셋 · 그림은 종목별 자동 저장" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"OHLC ",
					source || "—",
					" · ",
					bars.length.toLocaleString("ko-KR"),
					"봉 · 드로잉",
					" ",
					drawings.length,
					interval === "minute" ? " · 분봉은 봉주기별 최대 기간 지원(1m≤7일, 5~30m≤60일, 60m≤2년)" : ""
				] })]
			})
		]
	});
}
//#endregion
export { atr as n, lastNumber as r, TradingChart as t };
