import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as fairPriceFromEvMultiple, f as resliceValuation, o as fairPriceFromPer } from "./valuation-series-BlhPoCq6.mjs";
import { C as Minus, D as LoaderCircle, E as Magnet, T as Maximize2, U as Crosshair, V as Eraser, g as Ruler, j as Layers, o as TrendingUp, s as Trash2, t as ZoomIn, x as MousePointer2 } from "../_libs/lucide-react.mjs";
import { J as formatPct, L as useValuationSeries, Q as formatVolume, Y as formatPrice, Z as formatUsd, it as cn, nt as useAppStore, x as useChartData } from "./router-BWCKniEU.mjs";
import { S as vwap, _ as quantSnapshot, a as RsiDivergenceStrip, b as sma, c as bollinger, d as computeSeriesRangePosition, f as detectMacdCrosses, g as macd, h as lastNumber, i as RangePositionStrip, l as compareBollingerAndPercentile, m as findPivots, n as ChartAnalyticsStrip, o as StreetTapeRow, p as detectRsiDivergences, r as MacdCrossStrip, s as atr, t as BandCompareStrip, u as computeRangePosition, v as rollingPercentileBands, x as streetTape, y as rsi } from "./chart-indicators-BwconsT5.mjs";
import { a as bi, c as nr, i as Qe, l as ye, n as K, o as h, r as Nr, s as le } from "../_libs/lightweight-charts.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/TradingChart-DoakI-2C.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CHART_VIEWS = [
	{
		id: "price",
		label: "가격",
		tip: "캔들 · 거래량 · 이평 · 고점/저점 대비"
	},
	{
		id: "per",
		label: "PER",
		tip: "후행 PER = 수정주가 ÷ TTM 또는 직전 결산 EPS"
	},
	{
		id: "fwdPer",
		label: "선행 PER",
		tip: "수정주가 ÷ 최신 컨센서스 EPS"
	},
	{
		id: "evEbitda",
		label: "EV/EBITDA",
		tip: "기업가치 ÷ EBITDA"
	},
	{
		id: "evSales",
		label: "EV/Sales",
		tip: "기업가치 ÷ 매출과 가격 밴드"
	},
	{
		id: "band",
		label: "밴드·백분위",
		tip: "평균 ±1σ ±2σ와 구간 백분위"
	}
];
var TITLES = {
	per: "후행 PER",
	fwdPer: "선행 PER",
	evEbitda: "EV/EBITDA",
	evSales: "EV/Sales",
	band: "밸류에이션 밴드"
};
var RANGES$1 = [
	{
		id: "1y",
		label: "1년",
		years: 1
	},
	{
		id: "3y",
		label: "3년",
		years: 3
	},
	{
		id: "5y",
		label: "5년",
		years: 5
	},
	{
		id: "10y",
		label: "10년",
		years: 10
	},
	{
		id: "max",
		label: "최대",
		years: null
	}
];
function fmtMult(n) {
	if (n == null || !Number.isFinite(n)) return "—";
	const d = Math.abs(n) >= 100 ? 0 : Math.abs(n) >= 10 ? 1 : 2;
	return `${n.toFixed(d)}배`;
}
function fmtPctile(n) {
	if (n == null || !Number.isFinite(n)) return "—";
	return `${n.toFixed(0)}%ile`;
}
function fmtQuote(n, currency) {
	if (!Number.isFinite(n)) return "—";
	if (currency === "USD") return n >= 1e3 ? `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : `$${n.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})}`;
	return formatPrice(n);
}
function zoneOf(percentile) {
	if (percentile == null) return {
		text: "백분위 없음",
		tone: "text-muted-foreground"
	};
	if (percentile <= 10) return {
		text: "역사적 하단",
		tone: "text-desk-teal"
	};
	if (percentile <= 30) return {
		text: "하위 구간",
		tone: "text-desk-teal"
	};
	if (percentile >= 90) return {
		text: "역사적 상단",
		tone: "text-desk-rose"
	};
	if (percentile >= 70) return {
		text: "상위 구간",
		tone: "text-desk-rose"
	};
	return {
		text: "중간 구간",
		tone: "text-desk-gold"
	};
}
function cutoff(to, range) {
	const years = RANGES$1.find((r) => r.id === range)?.years;
	if (!to || years == null) return null;
	const d = /* @__PURE__ */ new Date(`${to}T00:00:00Z`);
	if (Number.isNaN(d.getTime())) return null;
	d.setUTCFullYear(d.getUTCFullYear() - years);
	return d.toISOString().slice(0, 10);
}
function finiteLine(rows) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const row of rows) {
		const date = row.date.slice(0, 10);
		if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || seen.has(date)) continue;
		if (row.value == null || !Number.isFinite(row.value)) continue;
		seen.add(date);
		out.push({
			time: date,
			value: row.value
		});
	}
	return out;
}
function ChartViewBar({ view, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-1 border-b border-border px-2.5 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mr-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
			children: "보기"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-0.5 rounded-md bg-muted p-0.5",
			children: CHART_VIEWS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				title: item.tip,
				onClick: () => onChange(item.id),
				className: cn("rounded px-2.5 py-1 text-xs font-semibold min-h-8", view === item.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
				children: item.label
			}, item.id))
		})]
	});
}
function ValuationHistoryChart({ code, mode }) {
	if (mode === "price") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeeklyPriceChart, { code });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultipleChart, {
		code,
		mode
	});
}
function WeeklyPriceChart({ code }) {
	const q = useValuationSeries(code, true);
	const [range, setRange] = (0, import_react.useState)("5y");
	const [fault, setFault] = (0, import_react.useState)(null);
	const wrapRef = (0, import_react.useRef)(null);
	const view = (0, import_react.useMemo)(() => {
		const pack = q.data;
		if (!pack) return null;
		return resliceValuation(pack, cutoff(pack.window.to, range));
	}, [q.data, range]);
	const points = view?.drivers.filter((row) => row.price > 0) ?? [];
	(0, import_react.useEffect)(() => {
		const el = wrapRef.current;
		if (!el || points.length < 2 || !view) return;
		let chart = null;
		try {
			chart = le(el, {
				autoSize: true,
				layout: {
					background: { color: "transparent" },
					textColor: "#94a3b8",
					fontSize: 11,
					attributionLogo: false
				},
				grid: {
					vertLines: { color: "rgba(148,163,184,0.08)" },
					horzLines: { color: "rgba(148,163,184,0.08)" }
				},
				crosshair: { mode: K.Normal },
				rightPriceScale: { borderColor: "rgba(148,163,184,0.18)" },
				timeScale: { borderColor: "rgba(148,163,184,0.18)" }
			});
			chart.addSeries(ye, {
				color: "#e2e8f0",
				lineWidth: 2,
				priceLineVisible: false,
				title: "수정주가",
				priceFormat: {
					type: "custom",
					minMove: .01,
					formatter: (v) => fmtQuote(v, view.currency)
				}
			}).setData(finiteLine(points.map((p) => ({
				date: p.date,
				value: p.price
			}))));
			chart.timeScale().fitContent();
		} catch {
			chart?.remove();
			setFault("주가 차트를 그리지 못했습니다.");
			return;
		}
		const live = chart;
		return () => live.remove();
	}, [
		view,
		points.length,
		range
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "bg-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "text-sm font-semibold",
				children: [view?.name ? `${view.name} · ` : "", "수정주가 · 주봉"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-muted-foreground",
				children: "Yahoo 수정종가. 국내 종목의 분·일 캔들과 드로잉은 가격 차트를 그대로 둡니다."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-0.5 rounded-md bg-muted p-0.5",
				children: RANGES$1.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setRange(item.id),
					className: cn("rounded px-2 py-1 text-[11px] font-semibold min-h-8", range === item.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"),
					children: item.label
				}, item.id))
			})]
		}), q.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-80 items-center justify-center text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), " 주가 불러오는 중…"]
		}) : fault ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-4 py-16 text-center text-sm text-price-down",
			children: fault
		}) : points.length < 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-4 py-16 text-center text-sm text-muted-foreground",
			children: view?.note ?? "주가 시계열이 없습니다."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: wrapRef,
			className: "h-[520px] w-full"
		})]
	});
}
function MultipleChart({ code, mode }) {
	const q = useValuationSeries(code, true);
	const [range, setRange] = (0, import_react.useState)("5y");
	const [fault, setFault] = (0, import_react.useState)(null);
	const [hover, setHover] = (0, import_react.useState)(null);
	const [showAvg, setShowAvg] = (0, import_react.useState)(true);
	const [logScale, setLogScale] = (0, import_react.useState)(false);
	const wrapRef = (0, import_react.useRef)(null);
	const view = (0, import_react.useMemo)(() => {
		const pack = q.data;
		if (!pack) return null;
		return resliceValuation(pack, cutoff(pack.window.to, range));
	}, [q.data, range]);
	const active = view ? mode === "per" ? view.per : mode === "fwdPer" ? view.forwardPer : mode === "evEbitda" ? view.evEbitda : mode === "band" ? null : view.evSales : null;
	const stats = mode === "band" ? view?.valuationBand.stats : active?.stats;
	const zone = zoneOf(stats?.percentile ?? null);
	const z = stats?.current != null && stats.mean != null && stats.sigma != null && stats.sigma > 0 ? (stats.current - stats.mean) / stats.sigma : null;
	const layout = mode === "evSales" || mode === "band" ? "price" : "multiple";
	const defined = mode === "band" ? view?.valuationBand.points.filter((p) => p.price != null).length ?? 0 : active?.stats.n ?? 0;
	const plotted = (0, import_react.useMemo)(() => {
		if (!view) return [];
		if (layout === "price") return (mode === "band" ? view.valuationBand.points : view.evSales.priceBands).filter((p) => p.price != null && p.price > 0).map((p) => ({
			date: p.date,
			value: p.price
		}));
		return (active?.points ?? []).filter((p) => p.value != null && p.value > 0).map((p) => ({
			date: p.date,
			value: p.value
		}));
	}, [
		view,
		mode,
		layout,
		active
	]);
	const multiplePlotted = (0, import_react.useMemo)(() => {
		if (!view || layout !== "price") return [];
		return (mode === "band" ? view.valuationBand.basis === "evSales" ? view.evSales : view.per : view.evSales).points.filter((p) => p.value != null && p.value > 0).map((p) => ({
			date: p.date,
			value: p.value
		}));
	}, [
		view,
		mode,
		layout
	]);
	const rangeStats = (0, import_react.useMemo)(() => computeSeriesRangePosition(plotted), [plotted]);
	const multipleStats = (0, import_react.useMemo)(() => multiplePlotted.length >= 2 ? computeSeriesRangePosition(multiplePlotted) : null, [multiplePlotted]);
	const tape = (0, import_react.useMemo)(() => streetTape(plotted.map((p) => ({
		high: p.value,
		low: p.value,
		close: p.value,
		date: p.date
	})), { lookback: 52 }), [plotted]);
	const valueFmt = (n) => layout === "price" && view ? fmtQuote(n, view.currency) : fmtMult(n);
	(0, import_react.useEffect)(() => {
		setFault(null);
		setHover(null);
	}, [
		code,
		mode,
		range
	]);
	(0, import_react.useEffect)(() => {
		const el = wrapRef.current;
		if (!el || !view || defined < 2 || fault) return;
		let chart = null;
		try {
			chart = le(el, {
				autoSize: true,
				layout: {
					background: { color: "transparent" },
					textColor: "#94a3b8",
					fontSize: 11,
					attributionLogo: false
				},
				grid: {
					vertLines: { color: "rgba(148,163,184,0.08)" },
					horzLines: { color: "rgba(148,163,184,0.08)" }
				},
				crosshair: {
					mode: K.Normal,
					vertLine: {
						color: "rgba(148,163,184,0.45)",
						labelBackgroundColor: "#0f172a"
					},
					horzLine: {
						color: "rgba(148,163,184,0.45)",
						labelBackgroundColor: "#0f172a"
					}
				},
				rightPriceScale: {
					borderColor: "rgba(148,163,184,0.18)",
					mode: logScale ? bi.Logarithmic : bi.Normal
				},
				timeScale: {
					borderColor: "rgba(148,163,184,0.18)",
					rightOffset: 6
				},
				handleScroll: {
					mouseWheel: true,
					pressedMouseMove: true
				},
				handleScale: {
					mouseWheel: true,
					pinch: true,
					axisPressedMouseMove: true
				}
			});
			const quote = (v) => fmtQuote(v, view.currency);
			const multFmt = (v) => v.toFixed(Math.abs(v) >= 10 ? 1 : 2);
			const lookup = /* @__PURE__ */ new Map();
			const addAverages = (rows, formatter) => {
				if (!showAvg || rows.length < 20) return;
				const values = rows.map((row) => row.value);
				for (const spec of [{
					period: 20,
					color: "#a78bfa",
					title: "20주"
				}, {
					period: 60,
					color: "#38bdf8",
					title: "60주"
				}]) {
					const avg = sma(values, spec.period);
					const data = finiteLine(rows.map((row, i) => ({
						date: row.date,
						value: avg[i] ?? null
					})));
					if (data.length < 2) continue;
					chart.addSeries(ye, {
						color: spec.color,
						lineWidth: 1,
						priceLineVisible: false,
						lastValueVisible: false,
						crosshairMarkerVisible: false,
						title: spec.title,
						priceFormat: {
							type: "custom",
							minMove: .01,
							formatter
						}
					}).setData(data);
				}
			};
			if (layout === "multiple" && active) {
				const line = chart.addSeries(ye, {
					color: "#22d3ee",
					lineWidth: 2,
					priceLineVisible: false,
					lastValueVisible: true,
					title: TITLES[mode],
					priceFormat: {
						type: "custom",
						minMove: .01,
						formatter: multFmt
					}
				});
				const data = finiteLine(active.points.map((p) => ({
					date: p.date,
					value: p.value
				})));
				line.setData(data);
				for (const row of data) lookup.set(String(row.time), [{
					label: TITLES[mode],
					value: fmtMult(row.value)
				}]);
				addLevelLines(line, active);
				addAverages(data.map((row) => ({
					date: String(row.time),
					value: row.value
				})), multFmt);
				try {
					chart.addSeries(nr, {
						color: "#fbbf24",
						priceScaleId: "pct",
						priceLineVisible: false,
						lastValueVisible: false,
						priceFormat: {
							type: "custom",
							minMove: 1,
							formatter: (v) => `${v.toFixed(0)}`
						}
					}, 1).setData(finiteLine(active.points.map((p) => ({
						date: p.date,
						value: p.percentile
					}))).map((row) => ({
						...row,
						color: row.value >= 80 ? "#fb7185" : row.value <= 20 ? "#2dd4bf" : "#fbbf24"
					})));
					chart.panes()[1]?.setHeight(92);
					chart.priceScale("pct", 1).applyOptions({
						scaleMargins: {
							top: .15,
							bottom: .15
						},
						borderVisible: false
					});
				} catch {}
			} else if (layout === "price" && view) {
				const bands = mode === "band" ? view.valuationBand.points : view.evSales.priceBands;
				const price = chart.addSeries(ye, {
					color: "#e2e8f0",
					lineWidth: 2,
					priceLineVisible: false,
					lastValueVisible: true,
					title: "주가",
					priceFormat: {
						type: "custom",
						minMove: .01,
						formatter: quote
					}
				});
				const priceRows = finiteLine(bands.map((p) => ({
					date: p.date,
					value: p.price
				})));
				price.setData(priceRows);
				addAverages(priceRows.map((row) => ({
					date: String(row.time),
					value: row.value
				})), quote);
				const specs = [
					{
						key: "mean",
						color: "#facc15",
						title: "평균",
						style: h.Solid
					},
					{
						key: "p1",
						color: "#fb7185",
						title: "+1σ",
						style: h.Dashed
					},
					{
						key: "m1",
						color: "#c084fc",
						title: "−1σ",
						style: h.Dashed
					},
					{
						key: "p2",
						color: "#e11d48",
						title: "+2σ",
						style: h.Dotted
					},
					{
						key: "m2",
						color: "#8b5cf6",
						title: "−2σ",
						style: h.Dotted
					}
				];
				for (const spec of specs) {
					const rows = finiteLine(bands.map((p) => ({
						date: p.date,
						value: typeof p[spec.key] === "number" ? p[spec.key] : null
					}))).filter((row) => row.value > 0);
					if (rows.length < 2) continue;
					chart.addSeries(ye, {
						color: spec.color,
						lineWidth: 1,
						lineStyle: spec.style,
						priceLineVisible: false,
						lastValueVisible: false,
						crosshairMarkerVisible: false,
						title: spec.title,
						priceFormat: {
							type: "custom",
							minMove: .01,
							formatter: quote
						}
					}).setData(rows);
				}
				const pctStats = mode === "evSales" ? view.evSales.stats : view.valuationBand.stats;
				const useEv = mode === "evSales" || view.valuationBand.basis === "evSales";
				for (const spec of [
					{
						key: "p10",
						color: "#2dd4bf",
						title: "p10"
					},
					{
						key: "p50",
						color: "#38bdf8",
						title: "p50"
					},
					{
						key: "p90",
						color: "#fb7185",
						title: "p90"
					}
				]) {
					const mult = pctStats[spec.key];
					if (mult == null || !(mult > 0)) continue;
					const rows = finiteLine(view.drivers.map((row) => ({
						date: row.date,
						value: useEv ? fairPriceFromEvMultiple(row.salesEok, mult, row.netDebtEok, row.shares) : fairPriceFromPer(row.eps, mult)
					}))).filter((row) => row.value > 0);
					if (rows.length < 2) continue;
					chart.addSeries(ye, {
						color: spec.color,
						lineWidth: 1,
						lineStyle: spec.key === "p50" ? h.Solid : h.Dashed,
						priceLineVisible: false,
						lastValueVisible: false,
						crosshairMarkerVisible: false,
						title: spec.title,
						priceFormat: {
							type: "custom",
							minMove: .01,
							formatter: quote
						}
					}).setData(rows);
				}
				for (const p of bands) {
					if (p.price == null) continue;
					const rows = [{
						label: "주가",
						value: quote(p.price)
					}];
					for (const spec of specs) {
						const v = p[spec.key];
						if (typeof v === "number" && v > 0) rows.push({
							label: spec.title,
							value: quote(v)
						});
					}
					lookup.set(p.date, rows);
				}
				if (mode === "evSales") try {
					const mult = chart.addSeries(ye, {
						color: "#22d3ee",
						lineWidth: 2,
						priceScaleId: "mult",
						priceLineVisible: false,
						lastValueVisible: true,
						title: "EV/Sales",
						priceFormat: {
							type: "custom",
							minMove: .01,
							formatter: multFmt
						}
					}, 1);
					mult.setData(finiteLine(view.evSales.points.map((p) => ({
						date: p.date,
						value: p.value
					}))));
					addLevelLines(mult, view.evSales);
					chart.panes()[1]?.setHeight(120);
				} catch {}
				else try {
					chart.addSeries(nr, {
						color: "#fbbf24",
						priceScaleId: "pct",
						priceLineVisible: false,
						lastValueVisible: false,
						priceFormat: {
							type: "custom",
							minMove: 1,
							formatter: (v) => `${v.toFixed(0)}`
						}
					}, 1).setData(finiteLine(view.valuationBand.percentilePoints.map((p) => ({
						date: p.date,
						value: p.percentile
					}))).map((row) => ({
						...row,
						color: row.value >= 80 ? "#fb7185" : row.value <= 20 ? "#2dd4bf" : "#fbbf24"
					})));
					chart.panes()[1]?.setHeight(92);
				} catch {}
			}
			chart.subscribeCrosshairMove((param) => {
				const t = param.time ? String(param.time) : "";
				const rows = t ? lookup.get(t) : void 0;
				if (!t || !rows) {
					setHover(null);
					return;
				}
				setHover({
					date: t,
					rows
				});
			});
			chart.timeScale().fitContent();
		} catch {
			chart?.remove();
			setFault("차트를 그리지 못했습니다. 가격 보기로 돌아간 뒤 다시 선택하세요.");
			return;
		}
		const live = chart;
		const ro = new ResizeObserver(() => {
			if (el.clientWidth > 0) live.applyOptions({
				width: el.clientWidth,
				height: el.clientHeight
			});
		});
		ro.observe(el);
		return () => {
			ro.disconnect();
			live.remove();
		};
	}, [
		view,
		mode,
		layout,
		defined,
		fault,
		active,
		showAvg,
		logScale
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "bg-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-wrap items-start justify-between gap-3 border-b border-border px-3 py-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-baseline gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-sm font-semibold",
						children: [view?.name ? `${view.name} · ` : "", TITLES[mode]]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("text-xs font-semibold", zone.tone),
						children: zone.text
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-3xl text-[11px] leading-relaxed text-muted-foreground",
					children: mode === "band" ? view?.valuationBand.basisLabel : active?.basis
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setShowAvg((v) => !v),
						className: cn("rounded px-2 py-1 text-[11px] font-semibold min-h-8", showAvg ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
						children: "20·60주"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setLogScale((v) => !v),
						className: cn("rounded px-2 py-1 text-[11px] font-semibold min-h-8", logScale ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
						children: "Log"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-0.5 rounded-md bg-muted p-0.5",
						children: RANGES$1.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setRange(item.id),
							className: cn("rounded px-2 py-1 text-[11px] font-semibold min-h-8", range === item.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"),
							children: item.label
						}, item.id))
					})
				]
			})]
		}), q.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-80 items-center justify-center text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), " 투자지표 불러오는 중…"]
		}) : q.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-4 py-16 text-center text-sm text-price-down",
			children: "지표 서버가 응답하지 않았습니다. 배수를 만들지 않았습니다."
		}) : fault ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-4 py-16 text-center text-sm text-price-down",
			children: fault
		}) : defined < 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4 py-14 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: "이 보기로 그릴 시계열이 없습니다"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground",
				children: emptyReason(mode, view)
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 border-b border-border px-3 py-2 sm:grid-cols-4 lg:grid-cols-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "현재",
						value: fmtMult(stats?.current)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "평균",
						value: fmtMult(stats?.mean)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "σ",
						value: stats?.sigma != null ? stats.sigma.toFixed(2) : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Z",
						value: z != null ? `${z >= 0 ? "+" : ""}${z.toFixed(2)}` : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: mode === "fwdPer" ? "경로 순위" : "백분위",
						value: fmtPctile(stats?.percentile)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "+1σ / −1σ",
						value: `${fmtMult(positive(stats?.p1))} / ${fmtMult(positive(stats?.m1))}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "+2σ / −2σ",
						value: `${fmtMult(positive(stats?.p2))} / ${fmtMult(positive(stats?.m2))}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "표본",
						value: stats?.n ? `${stats.n}주` : "—"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "border-b border-border px-3 py-1 text-[10px] text-muted-foreground tabular",
				children: [
					"백분위 밴드 p10 ",
					fmtMult(positive(stats?.p10)),
					" · p50 ",
					fmtMult(positive(stats?.p50)),
					" · p90",
					" ",
					fmtMult(positive(stats?.p90)),
					layout === "price" ? " · 당시 실적에 투영한 가격선" : " · 배수 눈금의 가로선"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RangePositionStrip, {
				stats: rangeStats,
				compact: true,
				formatValue: valueFmt,
				caption: layout === "price" ? "선택한 구간의 주가 고점·저점 대비. 줌이 아니라 기간 버튼 기준입니다." : "선택한 구간의 배수 고점·저점 대비. 가격 차트와 같은 위치 지표입니다."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [hover && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-none absolute left-3 top-2 z-10 rounded-md border border-border bg-background/90 px-2 py-1.5 text-[11px] shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-semibold tabular",
						children: hover.date
					}), hover.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between gap-4 tabular text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: row.value
						})]
					}, row.label))]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: wrapRef,
					className: "h-[520px] w-full"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StreetTapeRow, {
				tape,
				formatValue: valueFmt,
				fastLabel: "50주",
				slowLabel: "200주"
			}),
			multipleStats ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RangePositionStrip, {
				stats: multipleStats,
				compact: true,
				formatValue: fmtMult,
				caption: mode === "band" ? "밴드 기준 배수의 고점·저점 대비" : "EV/Sales 배수의 고점·저점 대비"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "border-t border-border px-3 py-2 text-[10px] leading-relaxed text-muted-foreground",
				children: [
					view?.window.from,
					" – ",
					view?.window.to,
					view?.currency === "USD" ? " · USD" : " · KRW",
					" · ",
					"통계와 σ 밴드는 위 구간만 사용. 음수 σ 가격은 그리지 않음. ",
					view?.note,
					" ",
					view?.sourceUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: view.sourceUrl,
						target: "_blank",
						rel: "noreferrer",
						className: "underline",
						children: "원문"
					}) : null
				]
			})
		] })]
	});
}
function positive(n) {
	return n != null && n > 0 ? n : null;
}
function emptyReason(mode, view) {
	if (!view) return "재무 또는 주가가 없습니다.";
	if (mode === "fwdPer" && !view.consensus) return "최신 컨센서스 EPS를 확인하지 못했습니다. 과거 컨센서스를 지어내지 않으므로 선행 PER은 비워 둡니다. " + view.note;
	if (mode === "evEbitda") return "EV/EBITDA는 영업이익과 감가상각이 둘 다 있고, 부채와 현금이 공시에 있을 때만 그립니다. 하나라도 없으면 배수를 만들지 않습니다. " + view.note;
	if (mode === "evSales") return "EV/Sales는 매출과 시가총액, 그리고 공시된 순차입금이 있을 때만 그립니다. " + view.note;
	return view.note;
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "truncate text-sm font-semibold tabular",
			children: value
		})]
	});
}
function addLevelLines(series, data) {
	const levels = [
		{
			value: positive(data.stats.mean),
			color: "#facc15",
			title: "평균",
			style: h.Solid
		},
		{
			value: positive(data.stats.p1),
			color: "#fb7185",
			title: "+1σ",
			style: h.Dashed
		},
		{
			value: positive(data.stats.m1),
			color: "#c084fc",
			title: "−1σ",
			style: h.Dashed
		},
		{
			value: positive(data.stats.p2),
			color: "#e11d48",
			title: "+2σ",
			style: h.Dotted
		},
		{
			value: positive(data.stats.m2),
			color: "#8b5cf6",
			title: "−2σ",
			style: h.Dotted
		},
		{
			value: positive(data.stats.p10),
			color: "#2dd4bf",
			title: "p10",
			style: h.Dashed
		},
		{
			value: positive(data.stats.p50),
			color: "#38bdf8",
			title: "p50",
			style: h.Solid
		},
		{
			value: positive(data.stats.p90),
			color: "#fb7185",
			title: "p90",
			style: h.Dashed
		}
	];
	for (const level of levels) {
		if (level.value == null) continue;
		series.createPriceLine({
			price: level.value,
			color: level.color,
			lineWidth: 1,
			lineStyle: level.style,
			axisLabelVisible: true,
			title: level.title
		});
	}
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
function zonedWallToUnix(ymdHm, timeZone) {
	const [date, hm] = ymdHm.split(" ");
	const [year, month, day] = (date ?? "").split("-").map(Number);
	const [hour, minute] = (hm ?? "00:00").split(":").map(Number);
	if (!year || !month || !day) return 0;
	let utc = Date.UTC(year, month - 1, day, hour || 0, minute || 0);
	const fmt = new Intl.DateTimeFormat("en-US", {
		timeZone,
		hourCycle: "h23",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit"
	});
	for (let i = 0; i < 3; i++) {
		const parts = fmt.formatToParts(new Date(utc));
		const g = (t) => Number(parts.find((p) => p.type === t)?.value);
		const asWall = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") === 24 ? 0 : g("hour"), g("minute"));
		const delta = Date.UTC(year, month - 1, day, hour || 0, minute || 0) - asWall;
		if (delta === 0) break;
		utc += delta;
	}
	return Math.floor(utc / 1e3);
}
function barTime(bar, zone = "KR") {
	if (bar.date.includes(" ")) {
		if (zone === "US") return zonedWallToUnix(bar.date, "America/New_York");
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
	const isUs = market === "US";
	const zone = isUs ? "US" : "KR";
	const px = (n) => isUs ? formatUsd(n) : formatPrice(n);
	const [interval, setInterval] = (0, import_react.useState)("day");
	const [minuteSize, setMinuteSize] = (0, import_react.useState)(5);
	const [range, setRange] = (0, import_react.useState)(isUs ? "5y" : "2y");
	const [showMa, setShowMa] = (0, import_react.useState)({
		ma5: true,
		ma20: true,
		ma60: true,
		ma120: false
	});
	const [showBb, setShowBb] = (0, import_react.useState)(true);
	const [showAtr, setShowAtr] = (0, import_react.useState)(true);
	const [showVwap, setShowVwap] = (0, import_react.useState)(true);
	const [showRsi, setShowRsi] = (0, import_react.useState)(true);
	const [showMacd, setShowMacd] = (0, import_react.useState)(true);
	const [showStreetMa, setShowStreetMa] = (0, import_react.useState)({
		ma50: isUs,
		ma200: isUs
	});
	const [show52, setShow52] = (0, import_react.useState)(true);
	const [showPctBands, setShowPctBands] = (0, import_react.useState)(true);
	const [logScale, setLogScale] = (0, import_react.useState)(false);
	const [magnet, setMagnet] = (0, import_react.useState)(true);
	const [tool, setTool] = (0, import_react.useState)("cursor");
	const [chartH, setChartH] = (0, import_react.useState)(480);
	const [view, setView] = (0, import_react.useState)("price");
	const [drawings, setDrawings] = (0, import_react.useState)(() => loadDrawings(code));
	const [hover, setHover] = (0, import_react.useState)(null);
	const [measureLabel, setMeasureLabel] = (0, import_react.useState)(null);
	const [visibleSpan, setVisibleSpan] = (0, import_react.useState)(null);
	const [chartEpoch, setChartEpoch] = (0, import_react.useState)(0);
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
	const streetMaRef = (0, import_react.useRef)({
		ma50: null,
		ma200: null
	});
	const pctBandRef = (0, import_react.useRef)({
		p10: null,
		p50: null,
		p90: null
	});
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
	const rangeLinesRef = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const overlayRef = (0, import_react.useRef)(null);
	const markersApiRef = (0, import_react.useRef)(null);
	const divRef = (0, import_react.useRef)([]);
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
	const rangeStats = (0, import_react.useMemo)(() => {
		if (bars.length < 2) return null;
		let from = 0;
		let to = bars.length - 1;
		if (visibleSpan) {
			from = Math.max(0, Math.floor(visibleSpan.from));
			to = Math.min(bars.length - 1, Math.ceil(visibleSpan.to));
		}
		return computeRangePosition(bars, {
			from,
			to,
			close: last?.close
		});
	}, [
		bars,
		visibleSpan,
		last?.close
	]);
	const street = (0, import_react.useMemo)(() => {
		if (!show52 || bars.length < 2) return null;
		const lookback = interval === "week" ? 52 : interval === "month" ? 12 : interval === "year" ? bars.length : 252;
		return streetTape(bars.map((b) => ({
			high: b.high,
			low: b.low,
			close: b.close,
			date: b.date,
			volume: b.volume
		})), { lookback });
	}, [
		bars,
		interval,
		show52
	]);
	const maWord = interval === "week" ? "주" : interval === "month" ? "개월" : interval === "year" ? "년" : interval === "minute" ? "봉" : "일";
	const periodsPerYear = interval === "day" ? 252 : interval === "week" ? 52 : interval === "month" ? 12 : interval === "year" ? 1 : null;
	const pctWindow = interval === "week" ? 52 : interval === "month" ? 24 : interval === "year" ? 10 : 120;
	const analytics = (0, import_react.useMemo)(() => quantSnapshot(bars, periodsPerYear), [bars, periodsPerYear]);
	const atrHud = (0, import_react.useMemo)(() => {
		if (!showAtr || bars.length < 15) return null;
		const a = atr(bars.map((b) => b.high), bars.map((b) => b.low), bars.map((b) => b.close), 14);
		const v = lastNumber(a);
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
	const bandCompare = (0, import_react.useMemo)(() => compareBollingerAndPercentile(bars.map((b) => b.close), 20, 2, pctWindow), [bars, pctWindow]);
	const divergences = (0, import_react.useMemo)(() => {
		if (!showRsi || bars.length < 30) return [];
		return detectRsiDivergences(bars.map((b) => b.high), bars.map((b) => b.low), bars.map((b) => b.close), {
			rsiPeriod: 14,
			left: 5,
			right: 5,
			maxAge: interval === "minute" ? 80 : 60
		});
	}, [
		bars,
		interval,
		showRsi
	]);
	divRef.current = divergences;
	const macdCrosses = (0, import_react.useMemo)(() => detectMacdCrosses(bars.map((b) => b.close), { maxAge: interval === "minute" ? 80 : 40 }), [bars, interval]);
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
		streetMaRef.current.ma50 = chart.addSeries(ye, {
			color: "#f97316",
			lineWidth: 2,
			priceLineVisible: false,
			lastValueVisible: false,
			crosshairMarkerVisible: false
		});
		streetMaRef.current.ma200 = chart.addSeries(ye, {
			color: "#2563eb",
			lineWidth: 2,
			priceLineVisible: false,
			lastValueVisible: false,
			crosshairMarkerVisible: false
		});
		pctBandRef.current.p10 = chart.addSeries(ye, {
			color: "#2dd4bf",
			lineWidth: 1,
			lineStyle: h.Dashed,
			priceLineVisible: false,
			lastValueVisible: false,
			crosshairMarkerVisible: false
		});
		pctBandRef.current.p50 = chart.addSeries(ye, {
			color: "#facc15",
			lineWidth: 1,
			lineStyle: h.Dotted,
			priceLineVisible: false,
			lastValueVisible: false,
			crosshairMarkerVisible: false
		});
		pctBandRef.current.p90 = chart.addSeries(ye, {
			color: "#fb7185",
			lineWidth: 1,
			lineStyle: h.Dashed,
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
		setChartEpoch((n) => n + 1);
		const onCross = (param) => {
			if (!param.time || !param.seriesData.size) {
				setHover(null);
				return;
			}
			const idx = barsRef.current.findIndex((b) => {
				const t = barTime(b, zone);
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
			let idx = barsRef.current.findIndex((b) => String(barTime(b, zone)) === String(param.time));
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
		let rangeRaf = 0;
		const onRange = (r) => {
			redrawOverlay();
			if (!r) return;
			cancelAnimationFrame(rangeRaf);
			rangeRaf = requestAnimationFrame(() => {
				setVisibleSpan({
					from: r.from,
					to: r.to
				});
			});
		};
		chart.timeScale().subscribeVisibleLogicalRangeChange(onRange);
		return () => {
			cancelAnimationFrame(rangeRaf);
			ro.disconnect();
			chart.remove();
			chartRef.current = null;
			candleRef.current = null;
			volRef.current = null;
			markersApiRef.current = null;
			priceLinesRef.current.clear();
			rangeLinesRef.current.clear();
		};
	}, [upColor, downColor]);
	(0, import_react.useEffect)(() => {
		if (view !== "price") return;
		const chart = chartRef.current;
		const el = wrapRef.current;
		if (!chart || !el) return;
		const id = requestAnimationFrame(() => {
			if (el.clientWidth > 0) chart.applyOptions({
				width: el.clientWidth,
				height: el.clientHeight
			});
		});
		return () => cancelAnimationFrame(id);
	}, [view]);
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
			time: barTime(b, zone),
			open: b.open,
			high: b.high,
			low: b.low,
			close: b.close
		}));
		candles.setData(candleData);
		if (isUs) {
			const penny = bars.some((b) => b.close > 0 && b.close < 1);
			candles.applyOptions({ priceFormat: {
				type: "price",
				precision: penny ? 4 : 2,
				minMove: penny ? 1e-4 : .01
			} });
		}
		const volData = bars.map((b) => ({
			time: barTime(b, zone),
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
					time: barTime(b, zone),
					value: v
				});
			}
			series.setData(data);
		}
		const closes = bars.map((b) => b.close);
		const highs = bars.map((b) => b.high);
		const lows = bars.map((b) => b.low);
		const volumes = bars.map((b) => b.volume);
		const pushSma = (series, period, on) => {
			if (!series) return;
			if (!on) {
				series.setData([]);
				return;
			}
			const arr = sma(closes, period);
			const line = [];
			arr.forEach((v, i) => {
				if (v != null) line.push({
					time: barTime(bars[i], zone),
					value: v
				});
			});
			series.setData(line);
		};
		pushSma(streetMaRef.current.ma50, 50, showStreetMa.ma50);
		pushSma(streetMaRef.current.ma200, 200, showStreetMa.ma200);
		const pct = rollingPercentileBands(closes, pctWindow);
		const pushBand = (series, arr) => {
			if (!series) return;
			if (!showPctBands) {
				series.setData([]);
				return;
			}
			const line = [];
			arr.forEach((v, i) => {
				if (v != null && v > 0) line.push({
					time: barTime(bars[i], zone),
					value: v
				});
			});
			series.setData(line);
		};
		pushBand(pctBandRef.current.p10, pct.p10);
		pushBand(pctBandRef.current.p50, pct.p50);
		pushBand(pctBandRef.current.p90, pct.p90);
		if (showBb) {
			const bb = bollinger(closes, 20, 2);
			const toLine = (arr) => {
				const out = [];
				arr.forEach((v, i) => {
					if (v != null) out.push({
						time: barTime(bars[i], zone),
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
			const sessionKeys = interval === "minute" ? bars.map((b) => b.date.slice(0, 10)) : void 0;
			const vw = vwap(highs, lows, closes, volumes, sessionKeys);
			const data = [];
			vw.forEach((v, i) => {
				if (v != null) data.push({
					time: barTime(bars[i], zone),
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
					time: barTime(bars[i], zone),
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
					time: barTime(bars[i], zone),
					value: v
				});
			});
			m.signal.forEach((v, i) => {
				if (v != null) sigData.push({
					time: barTime(bars[i], zone),
					value: v
				});
			});
			m.hist.forEach((v, i) => {
				if (v != null) histData.push({
					time: barTime(bars[i], zone),
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
		downColor,
		showStreetMa,
		showPctBands,
		pctWindow,
		zone
	]);
	(0, import_react.useEffect)(() => {
		const series = candleRef.current;
		if (!series || bars.length === 0) return;
		const markers = [];
		if (interval !== "minute" && eventMarkers.length) {
			const byDay = /* @__PURE__ */ new Set();
			for (const marker of eventMarkers) {
				const day = marker.time.slice(0, 10);
				if (day) byDay.add(day);
			}
			for (const bar of bars.filter((item) => byDay.has(item.date.slice(0, 10))).slice(-25)) markers.push({
				time: barTime(bar, zone),
				position: "aboveBar",
				color: "#e5b84c",
				shape: "circle",
				text: "공시"
			});
		}
		for (const swing of divergences) {
			const bar = bars[swing.i2];
			if (!bar) continue;
			const bull = swing.kind.endsWith("bullish");
			markers.push({
				time: barTime(bar, zone),
				position: bull ? "belowBar" : "aboveBar",
				color: bull ? "#2dd4bf" : "#fb7185",
				shape: bull ? "arrowUp" : "arrowDown",
				text: swing.kind.startsWith("hidden") ? bull ? "히든↑" : "히든↓" : bull ? "RSI↑" : "RSI↓"
			});
		}
		for (const cross of macdCrosses) {
			const bar = bars[cross.index];
			if (!bar) continue;
			const golden = cross.kind === "golden";
			markers.push({
				time: barTime(bar, zone),
				position: golden ? "belowBar" : "aboveBar",
				color: golden ? "#e5b84c" : "#94a3b8",
				shape: golden ? "arrowUp" : "arrowDown",
				text: golden ? "골든" : "데드"
			});
		}
		markers.sort((a, b) => {
			if (typeof a.time === "number" && typeof b.time === "number") return a.time - b.time;
			return String(a.time).localeCompare(String(b.time));
		});
		try {
			if (!markersApiRef.current) markersApiRef.current = Nr(series, markers);
			else markersApiRef.current.setMarkers(markers);
		} catch {
			markersApiRef.current = null;
		}
	}, [
		bars,
		eventMarkers,
		interval,
		divergences,
		macdCrosses,
		zone,
		chartEpoch
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
						title: `Fib ${lv.r} ${px(price)}`
					});
					priceLinesRef.current.set(`${d.id}-f${i}`, pl);
				});
			}
		}
		redrawOverlay();
	}, [drawings, bars.length]);
	(0, import_react.useEffect)(() => {
		const series = candleRef.current;
		if (!series) return;
		for (const [, pl] of rangeLinesRef.current) try {
			series.removePriceLine(pl);
		} catch {}
		rangeLinesRef.current.clear();
		if (!rangeStats) return;
		const add = (id, price, color, title, style) => {
			const pl = series.createPriceLine({
				price,
				color,
				lineWidth: 1,
				lineStyle: style,
				axisLabelVisible: true,
				title
			});
			rangeLinesRef.current.set(id, pl);
		};
		const near = (a, b) => Math.abs(a - b) / Math.max(a, b, 1) < 8e-4;
		add("ph", rangeStats.periodHigh, upColor, `기간고 ${formatPct(rangeStats.fromPeriodHighPct)}`, h.Dashed);
		add("pl", rangeStats.periodLow, downColor, `기간저 ${formatPct(rangeStats.fromPeriodLowPct)}`, h.Dashed);
		if (!near(rangeStats.recentHigh, rangeStats.periodHigh)) add("rh", rangeStats.recentHigh, "#c9a227", `최근고 ${formatPct(rangeStats.fromRecentHighPct)}`, h.Dotted);
		if (!near(rangeStats.recentLow, rangeStats.periodLow)) add("rl", rangeStats.recentLow, "#0f766e", `최근저 ${formatPct(rangeStats.fromRecentLowPct)}`, h.Dotted);
		if (show52 && street) {
			if (!near(street.high, rangeStats.periodHigh)) add("y52h", street.high, "#fb7185", `52주고 ${formatPct(street.offHighPct)}`, h.SparseDotted);
			if (!near(street.low, rangeStats.periodLow)) add("y52l", street.low, "#2dd4bf", `52주저 ${formatPct(street.offLowPct)}`, h.SparseDotted);
		}
	}, [
		rangeStats,
		upColor,
		downColor,
		bars.length,
		show52,
		street
	]);
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
			const x = ts.timeToCoordinate(barTime(bar, zone));
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
		const swings = divRef.current;
		for (const swing of swings) {
			const a = toXY(swing.i1, swing.price1);
			const b = toXY(swing.i2, swing.price2);
			if (!a || !b) continue;
			const color = swing.kind.endsWith("bullish") ? "#2dd4bf" : "#fb7185";
			const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
			line.setAttribute("x1", String(a.x));
			line.setAttribute("y1", String(a.y));
			line.setAttribute("x2", String(b.x));
			line.setAttribute("y2", String(b.y));
			line.setAttribute("stroke", color);
			line.setAttribute("stroke-width", "1.25");
			line.setAttribute("stroke-dasharray", "5 4");
			line.setAttribute("stroke-linecap", "round");
			svg.appendChild(line);
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
		const highs = bars.map((b) => b.high);
		const lows = bars.map((b) => b.low);
		const { highIdx, lowIdx } = findPivots(highs, lows, 4, 4);
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartViewBar, {
				view,
				onChange: setView
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: view === "price" ? "contents" : "hidden",
				"aria-hidden": view !== "price",
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
										else if (item.id === "day") setRange(isUs ? "5y" : "2y");
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "inline-flex items-center gap-1 cursor-pointer",
								title: "월가 표준 50기간 단순이평",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: showStreetMa.ma50,
									onChange: () => setShowStreetMa((s) => ({
										...s,
										ma50: !s.ma50
									})),
									className: "size-3 accent-primary"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[#f97316]",
									children: "SMA50"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "inline-flex items-center gap-1 cursor-pointer",
								title: "월가 표준 200기간 단순이평",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: showStreetMa.ma200,
									onChange: () => setShowStreetMa((s) => ({
										...s,
										ma200: !s.ma200
									})),
									className: "size-3 accent-primary"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[#2563eb]",
									children: "SMA200"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "inline-flex items-center gap-1 cursor-pointer",
								title: "52주(일봉 252) 고점·저점",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: show52,
									onChange: () => setShow52((v) => !v),
									className: "size-3 accent-primary"
								}), "52주"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "inline-flex items-center gap-1 cursor-pointer",
								title: "과거 120봉(주봉 52) 종가의 10·50·90 백분위. 미래 가격은 쓰지 않습니다.",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: showPctBands,
									onChange: () => setShowPctBands((v) => !v),
									className: "size-3 accent-primary"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[#2dd4bf]",
									children: "백분위"
								})]
							}),
							displayBar && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ml-auto flex flex-wrap items-center gap-x-3 gap-y-0.5 tabular text-[11px] sm:text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: displayBar.date
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["O ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: px(displayBar.open) })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["H ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: px(displayBar.high) })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["L ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: px(displayBar.low) })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"C",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
											style: { color: displayBar.bullish ? upColor : downColor },
											children: px(displayBar.close)
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
											isUs ? formatUsd(atrHud.atr) : formatPrice(Math.round(atrHud.atr)),
											" (",
											atrHud.pct.toFixed(2),
											"%)"
										]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RangePositionStrip, {
						stats: rangeStats,
						compact: isUs,
						formatValue: isUs ? formatUsd : void 0,
						caption: "표시 구간 기준. 고점 대비는 하락률, 저점 대비는 상승률입니다. 줌하면 같이 바뀝니다."
					}),
					show52 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StreetTapeRow, {
						tape: street,
						formatValue: isUs ? formatUsd : formatPrice,
						fastLabel: `50${maWord}`,
						slowLabel: `200${maWord}`,
						showVolume: true
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartAnalyticsStrip, { snap: analytics }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BandCompareStrip, {
						compare: bandCompare,
						formatValue: px
					}),
					showRsi ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RsiDivergenceStrip, {
						items: divergences,
						barCount: bars.length,
						formatValue: px
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MacdCrossStrip, {
						items: macdCrosses,
						barCount: bars.length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b border-border bg-muted/20 px-3 py-1 text-[10px] text-muted-foreground leading-relaxed",
						children: [
							"차트 OHLC: ",
							isUs ? "Yahoo 분할조정 · 미국 정규장 · 뉴욕 시각" : "Yahoo/네이버 비공식 경로",
							" · 체결 스트림과 마지막 봉이 어긋날 수 있음 · 실주문 전 HTS 재확인 · 휠=줌 · 드래그=이동 · H 수평선 T 추세선"
						]
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
			}),
			view !== "price" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValuationHistoryChart, {
				code,
				mode: view
			}) : null
		]
	});
}
//#endregion
export { TradingChart as t };
