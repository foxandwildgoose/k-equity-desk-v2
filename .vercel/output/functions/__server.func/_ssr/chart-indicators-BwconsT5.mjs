import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { J as formatPct, Y as formatPrice, it as cn, rt as usePriceColors } from "./router-BWCKniEU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/chart-indicators-BwconsT5.js
var import_jsx_runtime = require_jsx_runtime();
var CELLS = [
	{
		key: "fromPeriodLowPct",
		label: "저점 대비 상승",
		sub: "periodLow",
		date: "periodLowDate",
		hint: "표시 구간 최저점 대비 현재가 상승률"
	},
	{
		key: "fromPeriodHighPct",
		label: "고점 대비 하락",
		sub: "periodHigh",
		date: "periodHighDate",
		hint: "표시 구간 최고점 대비 현재가 하락률"
	},
	{
		key: "fromRecentHighPct",
		label: "최근 고점 대비 하락",
		sub: "recentHigh",
		date: "recentHighDate",
		hint: "확인된 최근 스윙 고점 대비 현재가"
	},
	{
		key: "fromRecentLowPct",
		label: "최근 저점 대비 상승",
		sub: "recentLow",
		date: "recentLowDate",
		hint: "확인된 최근 스윙 저점 대비 현재가"
	}
];
function RangePositionStrip({ stats, caption, compact = false, className, formatValue }) {
	const colors = usePriceColors();
	if (!stats) return null;
	const fmt = formatValue ?? formatPrice;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("border-b border-border", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 lg:grid-cols-4 gap-px bg-border",
			children: CELLS.map((c) => {
				const pct = stats[c.key];
				const px = stats[c.sub];
				const dt = stats[c.date];
				const tone = pct > .005 ? colors.up : pct < -.005 ? colors.down : "text-muted-foreground";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					title: c.hint,
					className: cn("bg-card min-w-0", compact ? "px-2.5 py-1.5" : "px-3 py-2"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-semibold tracking-wide text-muted-foreground",
							children: c.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("mt-0.5 font-semibold tabular leading-tight", compact ? "text-sm" : "text-lg", tone),
							children: Number.isFinite(pct) ? formatPct(pct) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-0.5 truncate text-[10px] tabular text-muted-foreground",
							children: [fmt(px), dt ? ` · ${dt.slice(0, 10)}` : ""]
						})
					]
				}, c.key);
			})
		}), caption ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-3 py-1 text-[10px] text-muted-foreground leading-relaxed",
			children: caption
		}) : null]
	});
}
function StreetTapeRow({ tape, formatValue, fastLabel, slowLabel, showVolume = false, className }) {
	const colors = usePriceColors();
	if (!tape) return null;
	const fmt = formatValue ?? formatPrice;
	const cells = [
		{
			label: "52주 고점 대비 하락",
			tone: tape.offHighPct < -.005 ? colors.down : "text-muted-foreground",
			value: formatPct(tape.offHighPct),
			sub: `${fmt(tape.high)}${tape.highDate ? ` · ${tape.highDate}` : ""}`
		},
		{
			label: "52주 저점 대비 상승",
			tone: tape.offLowPct > .005 ? colors.up : "text-muted-foreground",
			value: formatPct(tape.offLowPct),
			sub: `${fmt(tape.low)}${tape.lowDate ? ` · ${tape.lowDate}` : ""}`
		},
		{
			label: "52주 레인지 위치",
			tone: "text-foreground",
			value: `${tape.rangeLocation.toFixed(0)}%`,
			sub: "0 저점 · 100 고점"
		},
		{
			label: `${fastLabel} 이격`,
			tone: tape.vsSma50Pct == null ? "text-muted-foreground" : tape.vsSma50Pct > .005 ? colors.up : tape.vsSma50Pct < -.005 ? colors.down : "text-muted-foreground",
			value: tape.vsSma50Pct == null ? "—" : formatPct(tape.vsSma50Pct),
			sub: tape.sma50 != null ? fmt(tape.sma50) : "50개 미만"
		},
		{
			label: `${slowLabel} 이격`,
			tone: tape.vsSma200Pct == null ? "text-muted-foreground" : tape.vsSma200Pct > .005 ? colors.up : tape.vsSma200Pct < -.005 ? colors.down : "text-muted-foreground",
			value: tape.vsSma200Pct == null ? "—" : formatPct(tape.vsSma200Pct),
			sub: tape.sma200 != null ? fmt(tape.sma200) : "200개 미만"
		}
	];
	if (showVolume) cells.push({
		label: "상대거래량",
		tone: "text-foreground",
		value: tape.relVolume != null ? `${tape.relVolume.toFixed(2)}×` : "—",
		sub: "직전 20봉 평균 대비"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("border-b border-border", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("grid grid-cols-2 gap-px bg-border", showVolume ? "lg:grid-cols-6" : "lg:grid-cols-5"),
			children: cells.map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card px-2.5 py-1.5 min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] font-semibold tracking-wide text-muted-foreground",
						children: cell.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("mt-0.5 text-sm font-semibold tabular leading-tight", cell.tone),
						children: cell.value
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-0.5 truncate text-[10px] tabular text-muted-foreground",
						children: cell.sub
					})
				]
			}, cell.label))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "px-3 py-1 text-[10px] text-muted-foreground",
			children: [
				"줌과 무관한 고정 창(",
				tape.barsUsed,
				"봉 / 요청 ",
				tape.lookback,
				"). 52주 고점은 월가 데스크의 % off highs."
			]
		})]
	});
}
function numText(n, digits = 1, suffix = "") {
	if (n == null || !Number.isFinite(n)) return "—";
	return `${n.toFixed(digits)}${suffix}`;
}
/** Return, drawdown, and Korean technical readings for the loaded bars. */
function ChartAnalyticsStrip({ snap, className }) {
	const colors = usePriceColors();
	if (!snap) return null;
	const tone = (n) => n == null || !Number.isFinite(n) ? "text-muted-foreground" : n > .005 ? colors.up : n < -.005 ? colors.down : "text-muted-foreground";
	const cells = [
		{
			label: "구간 수익률",
			value: formatPct(snap.totalReturnPct),
			sub: `${snap.bars}봉`,
			tone: tone(snap.totalReturnPct)
		},
		{
			label: snap.volAnnualized ? "연환산 변동성" : "봉 변동성",
			value: snap.volPct == null ? "—" : `${snap.volPct.toFixed(1)}%`,
			sub: snap.volAnnualized ? "로그수익 표본표준편차" : "분봉은 연환산하지 않음",
			tone: "text-foreground"
		},
		{
			label: "최대 낙폭",
			value: formatPct(snap.maxDrawdownPct),
			sub: "구간 고점 대비 최저",
			tone: colors.down
		},
		{
			label: "고점 대비 하락",
			value: formatPct(snap.currentDrawdownPct),
			sub: "지금 낙폭",
			tone: tone(snap.currentDrawdownPct)
		},
		{
			label: "저점 대비 상승",
			value: Number.isFinite(snap.fromLowPct) ? formatPct(snap.fromLowPct) : "—",
			sub: "구간 저점 기준",
			tone: tone(snap.fromLowPct)
		},
		{
			label: "종가 백분위",
			value: snap.closePercentile == null ? "—" : `${snap.closePercentile.toFixed(0)}%ile`,
			sub: "이 구간 종가 중 현재 이하",
			tone: "text-foreground"
		},
		{
			label: "이격도 20",
			value: numText(snap.disparity20, 1),
			sub: "100 = 20이평",
			tone: "text-foreground"
		},
		{
			label: "스토캐스틱",
			value: snap.stochasticK == null ? "—" : `${snap.stochasticK.toFixed(0)} / ${snap.stochasticD == null ? "—" : snap.stochasticD.toFixed(0)}`,
			sub: "%K / %D · 14, 3",
			tone: "text-foreground"
		},
		{
			label: "투자심리선",
			value: numText(snap.psych12, 0, "%"),
			sub: "12봉 중 상승 비율",
			tone: "text-foreground"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("border-b border-border", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-5",
			children: cells.map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card px-2.5 py-1.5 min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] font-semibold tracking-wide text-muted-foreground",
						children: cell.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("mt-0.5 text-sm font-semibold tabular leading-tight", cell.tone),
						children: cell.value
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-0.5 truncate text-[10px] text-muted-foreground",
						children: cell.sub
					})
				]
			}, cell.label))
		})
	});
}
function bbZone(percentB) {
	if (percentB == null) return "폭이 0";
	if (percentB > 1) return "상단 밖";
	if (percentB < 0) return "하단 밖";
	if (percentB >= .8) return "상단 근접";
	if (percentB <= .2) return "하단 근접";
	return "밴드 안";
}
function pctZone(rank, close, p10, p90) {
	if (p90 != null && close > p90) return "P90 위";
	if (p10 != null && close < p10) return "P10 아래";
	if (rank == null) return "표본 부족";
	if (rank >= 90) return "상위 10%";
	if (rank <= 10) return "하위 10%";
	return "중간 분포";
}
/** Bollinger (20, 2σ) against the empirical percentile channel. */
function BandCompareStrip({ compare, formatValue }) {
	if (!compare) return null;
	const fmt = formatValue ?? formatPrice;
	const pctGap = compare.p50 != null && compare.p50 > 0 ? (compare.close / compare.p50 - 1) * 100 : null;
	const bbGap = compare.bbMid != null && compare.bbMid > 0 ? (compare.close / compare.bbMid - 1) * 100 : null;
	const cells = [
		{
			label: "볼린저 %b",
			value: compare.percentB == null ? "—" : compare.percentB.toFixed(2),
			sub: `20봉 · 2σ · ${bbZone(compare.percentB)}`
		},
		{
			label: "볼린저 폭",
			value: compare.bbWidthPct == null ? "—" : `${compare.bbWidthPct.toFixed(1)}%`,
			sub: compare.bbUpper != null && compare.bbLower != null ? `${fmt(compare.bbLower)} – ${fmt(compare.bbUpper)}` : "상·하단"
		},
		{
			label: "이평 이격",
			value: bbGap == null ? "—" : formatPct(bbGap),
			sub: compare.bbMid != null ? `중심 ${fmt(compare.bbMid)}` : "SMA20"
		},
		{
			label: "백분위 순위",
			value: compare.pctRank == null ? "—" : `${compare.pctRank.toFixed(0)}%ile`,
			sub: `${compare.window}봉 · ${pctZone(compare.pctRank, compare.close, compare.p10, compare.p90)}`
		},
		{
			label: "P10 · P90",
			value: compare.p10 != null && compare.p90 != null ? `${fmt(compare.p10)} · ${fmt(compare.p90)}` : "—",
			sub: compare.p50 != null ? `중앙 ${fmt(compare.p50)}` : "경험 분포"
		},
		{
			label: "중앙 이격",
			value: pctGap == null ? "—" : formatPct(pctGap),
			sub: "종가 / P50 − 1"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-b border-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-3 pt-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] font-semibold tracking-wide text-muted-foreground",
					children: "볼린저 × 백분위"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] text-muted-foreground",
					children: "회색 실선 볼린저 · 청록 P10 · 노랑 P50 · 장미 P90"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-6",
				children: cells.map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 bg-card px-2.5 py-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-semibold tracking-wide text-muted-foreground",
							children: cell.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-0.5 truncate text-sm font-semibold tabular leading-tight",
							children: cell.value
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-0.5 truncate text-[10px] text-muted-foreground",
							children: cell.sub
						})
					]
				}, cell.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 py-1.5 text-[11px] leading-relaxed text-muted-foreground",
				children: compare.note
			})
		]
	});
}
var DIVERGENCE_TONE = {
	"regular-bullish": "text-desk-teal",
	"hidden-bullish": "text-desk-teal",
	"regular-bearish": "text-desk-rose",
	"hidden-bearish": "text-desk-rose"
};
function divergenceRead(kind) {
	if (kind === "hidden-bullish") return "히든 · 가격 저점↑ RSI 저점↓ · 상승 지속";
	if (kind === "hidden-bearish") return "히든 · 가격 고점↓ RSI 고점↑ · 하락 지속";
	if (kind === "regular-bullish") return "정규 · 가격 저점↓ RSI 저점↑ · 반등 후보";
	return "정규 · 가격 고점↑ RSI 고점↓ · 조정 후보";
}
/** Confirmed-pivot RSI divergence, including hidden continuation pairs. */
function RsiDivergenceStrip({ items, barCount, formatValue }) {
	const fmt = formatValue ?? formatPrice;
	const hidden = items.filter((item) => item.kind.startsWith("hidden"));
	const regular = items.filter((item) => !item.kind.startsWith("hidden"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-b border-border px-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] font-semibold tracking-wide text-muted-foreground",
					children: "RSI 다이버전스 · 히든"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] text-muted-foreground",
					children: "확정 스윙 최근 6쌍 · RSI 14"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[11px] leading-relaxed text-muted-foreground",
				children: "히든 상승은 저점이 높아지는데 RSI는 더 낮아진 눌림이고, 히든 하락은 고점이 낮아지는데 RSI는 더 높아진 반등입니다. 정규는 추세가 꺾이는 쪽입니다."
			}),
			items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[11px] leading-relaxed text-muted-foreground",
				children: "최근 확정 스윙에서 정규·히든 다이버전스가 없습니다. 오른쪽 5봉이 지나지 않은 고점·저점은 빼 둡니다."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-1.5 flex flex-col gap-1.5",
				children: [...hidden, ...regular].map((item) => {
					const ago = Math.max(0, barCount - 1 - item.i2);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-[11px] leading-relaxed",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("font-semibold", DIVERGENCE_TONE[item.kind]),
							children: item.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								" ",
								"· ",
								divergenceRead(item.kind),
								" · 가격 ",
								fmt(item.price1),
								" → ",
								fmt(item.price2),
								" · RSI",
								" ",
								item.rsi1.toFixed(1),
								" → ",
								item.rsi2.toFixed(1),
								" · ",
								ago === 0 ? "마지막 확정 봉" : `${ago}봉 전`
							]
						})]
					}, `${item.kind}-${item.i1}-${item.i2}`);
				})
			})
		]
	});
}
/** Latest MACD/signal cross inside the lookback. */
function MacdCrossStrip({ items, barCount }) {
	const golden = items.find((item) => item.kind === "golden");
	const dead = items.find((item) => item.kind === "dead");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-b border-border px-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] font-semibold tracking-wide text-muted-foreground",
					children: "MACD 골든크로스"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] text-muted-foreground",
					children: "12 · 26 · 시그널 9"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[11px] leading-relaxed text-muted-foreground",
				children: "MACD선이 시그널을 아래에서 위로 돌파하면 골든크로스, 위에서 아래로 깨면 데드크로스입니다. 0선 아래 골든은 반등, 0선 위 골든은 상승 지속으로 읽습니다."
			}),
			items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[11px] text-muted-foreground",
				children: "최근 40봉 안에 MACD 크로스가 없습니다."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-1.5 flex flex-col gap-1",
				children: [golden, dead].filter((item) => item != null).map((item) => {
					const ago = Math.max(0, barCount - 1 - item.index);
					const tone = item.kind === "golden" ? "text-desk-teal" : "text-desk-rose";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-[11px] leading-relaxed",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("font-semibold", tone),
							children: item.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								" ",
								"· MACD ",
								item.macd.toFixed(2),
								" · 시그널 ",
								item.signal.toFixed(2),
								" ·",
								" ",
								ago === 0 ? "이번 봉" : `${ago}봉 전`
							]
						})]
					}, item.kind);
				})
			})
		]
	});
}
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
* MACD(12,26,9) line crossing the signal line.
* Golden: previous bar MACD ≤ signal and this bar MACD > signal.
* Dead: the opposite cross. Ties on the previous bar still count as a cross
* when the current bar separates. The latest golden and latest dead inside
* `maxAge` are kept. An unfinished bar is included because the cross is on
* the close, not a future pivot.
*/
function detectMacdCrosses(closes, opts) {
	const fast = opts?.fast ?? 12;
	const slow = opts?.slow ?? 26;
	const signalPeriod = opts?.signal ?? 9;
	const maxAge = opts?.maxAge ?? 40;
	if (closes.length < slow + signalPeriod) return [];
	const series = macd(closes, fast, slow, signalPeriod);
	let golden = null;
	let dead = null;
	for (let i = 1; i < closes.length; i++) {
		const prevMacd = series.macd[i - 1];
		const macdNow = series.macd[i];
		const prevSignal = series.signal[i - 1];
		const signalNow = series.signal[i];
		if (prevMacd == null || macdNow == null || prevSignal == null || signalNow == null) continue;
		const prevDiff = prevMacd - prevSignal;
		const nowDiff = macdNow - signalNow;
		if (prevDiff <= 0 && nowDiff > 0) golden = {
			kind: "golden",
			label: macdNow < 0 ? "MACD 골든크로스 · 0선 아래" : "MACD 골든크로스 · 0선 위",
			index: i,
			macd: macdNow,
			signal: signalNow,
			belowZero: macdNow < 0
		};
		else if (prevDiff >= 0 && nowDiff < 0) dead = {
			kind: "dead",
			label: macdNow > 0 ? "MACD 데드크로스 · 0선 위" : "MACD 데드크로스 · 0선 아래",
			index: i,
			macd: macdNow,
			signal: signalNow,
			belowZero: macdNow < 0
		};
	}
	const last = closes.length - 1;
	const out = [];
	if (golden && last - golden.index <= maxAge) out.push(golden);
	if (dead && last - dead.index <= maxAge) out.push(dead);
	out.sort((a, b) => b.index - a.index);
	return out;
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
function pctChange(now, ref) {
	if (!(ref > 0) || !Number.isFinite(now)) return NaN;
	return (now - ref) / ref * 100;
}
/**
* Desk-style range position vs current price (TradingView visible-range + last swing).
* Period high/low = extrema of [from, to]. Recent high/low = last confirmed pivot
* in that window (so a new high on the last few bars is 기간고, not yet 최근고).
*/
function computeRangePosition(bars, opts) {
	if (!bars.length) return null;
	const from = Math.max(0, Math.floor(opts?.from ?? 0));
	const to = Math.min(bars.length - 1, Math.floor(opts?.to ?? bars.length - 1));
	if (to < from) return null;
	const close = opts?.close ?? bars[bars.length - 1].close;
	if (!(close > 0) || !Number.isFinite(close)) return null;
	let periodHigh = -Infinity;
	let periodLow = Infinity;
	let periodHighIdx = from;
	let periodLowIdx = from;
	for (let i = from; i <= to; i++) {
		const b = bars[i];
		if (b.high >= periodHigh) {
			periodHigh = b.high;
			periodHighIdx = i;
		}
		if (b.low <= periodLow) {
			periodLow = b.low;
			periodLowIdx = i;
		}
	}
	if (!(periodHigh > 0) || !(periodLow > 0) || !Number.isFinite(periodHigh)) return null;
	const n = to - from + 1;
	const left = opts?.pivotLeft ?? Math.max(3, Math.min(8, Math.floor(n / 40) || 3));
	const right = opts?.pivotRight ?? left;
	const highs = [];
	const lows = [];
	for (let i = from; i <= to; i++) {
		highs.push(bars[i].high);
		lows.push(bars[i].low);
	}
	const piv = findPivots(highs, lows, left, right);
	let recentHighIdx = piv.highIdx.length > 0 ? from + piv.highIdx[piv.highIdx.length - 1] : periodHighIdx;
	let recentLowIdx = piv.lowIdx.length > 0 ? from + piv.lowIdx[piv.lowIdx.length - 1] : periodLowIdx;
	const winStart = from + Math.max(0, n - Math.max(8, Math.floor(n * .2)));
	if (piv.highIdx.length === 0) {
		let h = -Infinity;
		let hi = winStart;
		for (let i = winStart; i <= to; i++) if (bars[i].high >= h) {
			h = bars[i].high;
			hi = i;
		}
		recentHighIdx = hi;
	}
	if (piv.lowIdx.length === 0) {
		let l = Infinity;
		let li = winStart;
		for (let i = winStart; i <= to; i++) if (bars[i].low <= l) {
			l = bars[i].low;
			li = i;
		}
		recentLowIdx = li;
	}
	const recentHigh = bars[recentHighIdx].high;
	const recentLow = bars[recentLowIdx].low;
	const dateOf = (i) => bars[i]?.date?.slice(0, 16) ?? null;
	return {
		close,
		periodHigh,
		periodLow,
		periodHighDate: dateOf(periodHighIdx),
		periodLowDate: dateOf(periodLowIdx),
		periodHighIdx,
		periodLowIdx,
		recentHigh,
		recentLow,
		recentHighDate: dateOf(recentHighIdx),
		recentLowDate: dateOf(recentLowIdx),
		recentHighIdx,
		recentLowIdx,
		fromPeriodLowPct: pctChange(close, periodLow),
		fromPeriodHighPct: pctChange(close, periodHigh),
		fromRecentHighPct: pctChange(close, recentHigh),
		fromRecentLowPct: pctChange(close, recentLow)
	};
}
/** Line-series variant (export desk, flow). High = low = close = value. */
function computeSeriesRangePosition(points, close) {
	return computeRangePosition(points.filter((p) => Number.isFinite(p.value) && p.value !== 0).map((p) => ({
		high: p.value,
		low: p.value,
		close: p.value,
		date: p.date
	})), close != null ? { close } : void 0);
}
/**
* Fixed-window desk tape. Daily charts pass 252 bars (52 weeks).
* Weekly valuation series pass 52. This does not move when the user zooms.
*/
function streetTape(bars, opts) {
	if (bars.length < 2) return null;
	const close = bars[bars.length - 1].close;
	if (!(close > 0) || !Number.isFinite(close)) return null;
	const lookback = Math.max(2, Math.floor(opts?.lookback ?? Math.min(252, bars.length)));
	const start = Math.max(0, bars.length - lookback);
	const window = bars.slice(start);
	let high = -Infinity;
	let low = Infinity;
	let highDate = null;
	let lowDate = null;
	for (const bar of window) {
		if (bar.high >= high) {
			high = bar.high;
			highDate = bar.date?.slice(0, 10) ?? null;
		}
		if (bar.low > 0 && bar.low <= low) {
			low = bar.low;
			lowDate = bar.date?.slice(0, 10) ?? null;
		}
	}
	if (!(high > 0) || !(low > 0) || !Number.isFinite(high) || !Number.isFinite(low)) return null;
	const closes = bars.map((bar) => bar.close);
	const s50 = sma(closes, 50);
	const s200 = sma(closes, 200);
	const sma50 = s50[s50.length - 1] ?? null;
	const sma200 = s200[s200.length - 1] ?? null;
	let relVolume = null;
	const vols = bars.map((bar) => bar.volume ?? 0);
	const lastVol = vols[vols.length - 1] ?? 0;
	if (vols.length >= 21 && lastVol > 0) {
		let sum = 0;
		let n = 0;
		for (let i = vols.length - 21; i < vols.length - 1; i++) if (vols[i] > 0) {
			sum += vols[i];
			n += 1;
		}
		if (n >= 10 && sum > 0) relVolume = lastVol / (sum / n);
	}
	const span = high - low;
	return {
		lookback,
		barsUsed: window.length,
		high,
		low,
		highDate,
		lowDate,
		offHighPct: pctChange(close, high),
		offLowPct: pctChange(close, low),
		rangeLocation: span > 0 ? (close - low) / span * 100 : 100,
		sma50: sma50 != null && sma50 > 0 ? sma50 : null,
		sma200: sma200 != null && sma200 > 0 ? sma200 : null,
		vsSma50Pct: sma50 != null && sma50 > 0 ? pctChange(close, sma50) : null,
		vsSma200Pct: sma200 != null && sma200 > 0 ? pctChange(close, sma200) : null,
		relVolume
	};
}
/** Linear interpolation percentile. `q` is 0–1. `sorted` must be ascending. */
function linearPercentile(sorted, q) {
	if (!sorted.length) return NaN;
	const clamped = Math.min(1, Math.max(0, q));
	const pos = (sorted.length - 1) * clamped;
	const lo = Math.floor(pos);
	const hi = Math.ceil(pos);
	if (lo === hi) return sorted[lo];
	const w = pos - lo;
	return sorted[lo] * (1 - w) + sorted[hi] * w;
}
/**
* Rolling close percentile channel. Each point uses only the past `window`
* closes (no look-ahead). Needs 20 positive prints before a band is drawn.
*/
function rollingPercentileBands(values, window = 120) {
	const p10 = [];
	const p50 = [];
	const p90 = [];
	const span = Math.max(20, Math.floor(window));
	for (let i = 0; i < values.length; i++) {
		const start = Math.max(0, i - span + 1);
		const slice = values.slice(start, i + 1).filter((v) => Number.isFinite(v) && v > 0);
		if (slice.length < 20) {
			p10.push(null);
			p50.push(null);
			p90.push(null);
			continue;
		}
		slice.sort((a, b) => a - b);
		p10.push(linearPercentile(slice, .1));
		p50.push(linearPercentile(slice, .5));
		p90.push(linearPercentile(slice, .9));
	}
	return {
		p10,
		p50,
		p90
	};
}
/** Share of positive values at or below the last one, 0–100. Null until 8 prints. */
function closePercentile(values) {
	const xs = values.filter((v) => Number.isFinite(v) && v > 0);
	if (xs.length < 8) return null;
	const last = xs[xs.length - 1];
	let le = 0;
	for (const v of xs) if (v <= last) le += 1;
	return le / xs.length * 100;
}
/** 이격도 = 종가 / 이평 × 100. 100이면 이평과 같다. */
function disparity(closes, period) {
	const ma = sma(closes, period);
	return closes.map((c, i) => ma[i] != null && ma[i] > 0 ? c / ma[i] * 100 : null);
}
/** Fast stochastic. %K uses the high-low range; %D is an SMA of %K. */
function stochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
	const k = [];
	for (let i = 0; i < closes.length; i++) {
		if (i + 1 < kPeriod) {
			k.push(null);
			continue;
		}
		let hh = -Infinity;
		let ll = Infinity;
		for (let j = i - kPeriod + 1; j <= i; j++) {
			if (highs[j] > hh) hh = highs[j];
			if (lows[j] < ll) ll = lows[j];
		}
		const span = hh - ll;
		k.push(span > 0 ? (closes[i] - ll) / span * 100 : null);
	}
	const d = [];
	for (let i = 0; i < k.length; i++) {
		if (i + 1 < dPeriod) {
			d.push(null);
			continue;
		}
		let sum = 0;
		let n = 0;
		for (let j = i - dPeriod + 1; j <= i; j++) {
			if (k[j] == null) continue;
			sum += k[j];
			n += 1;
		}
		d.push(n === dPeriod ? sum / dPeriod : null);
	}
	return {
		k,
		d
	};
}
/** 투자심리선: 최근 N봉 중 상승 봉 비율 × 100. */
function psychologicalLine(closes, period = 12) {
	const out = [];
	for (let i = 0; i < closes.length; i++) {
		if (i < period) {
			out.push(null);
			continue;
		}
		let up = 0;
		for (let j = i - period + 1; j <= i; j++) if (closes[j] > closes[j - 1]) up += 1;
		out.push(up / period * 100);
	}
	return out;
}
function sampleStdev(xs) {
	if (xs.length < 2) return null;
	let mean = 0;
	for (const x of xs) mean += x;
	mean /= xs.length;
	let acc = 0;
	for (const x of xs) {
		const d = x - mean;
		acc += d * d;
	}
	return Math.sqrt(acc / (xs.length - 1));
}
/**
* Window statistics used on stock and ETF charts.
* Volatility is the sample stdev of log returns. It is annualized only when
* `periodsPerYear` is the bar frequency (252 daily, 52 weekly, 12 monthly).
*/
function quantSnapshot(bars, periodsPerYear) {
	if (bars.length < 8) return null;
	const closes = bars.map((b) => b.close);
	const first = closes[0];
	const last = closes[closes.length - 1];
	if (!(first > 0) || !(last > 0)) return null;
	const rets = [];
	for (let i = 1; i < closes.length; i++) {
		const prev = closes[i - 1];
		const cur = closes[i];
		if (prev > 0 && cur > 0) rets.push(Math.log(cur / prev));
	}
	const sd = sampleStdev(rets);
	const volPct = sd == null ? null : periodsPerYear != null && periodsPerYear > 0 ? sd * Math.sqrt(periodsPerYear) * 100 : sd * 100;
	let peak = closes[0];
	let trough = closes[0];
	let maxDd = 0;
	let currentDd = 0;
	for (const c of closes) {
		if (!(c > 0)) continue;
		if (c > peak) peak = c;
		if (c < trough) trough = c;
		const dd = (c / peak - 1) * 100;
		if (dd < maxDd) maxDd = dd;
		currentDd = dd;
	}
	const disp = disparity(closes, 20);
	const st = stochastic(bars.map((b) => b.high), bars.map((b) => b.low), closes);
	const psych = psychologicalLine(closes, 12);
	return {
		bars: bars.length,
		totalReturnPct: (last - first) / first * 100,
		volPct,
		volAnnualized: periodsPerYear != null && periodsPerYear > 0,
		maxDrawdownPct: maxDd,
		currentDrawdownPct: currentDd,
		fromLowPct: trough > 0 ? (last - trough) / trough * 100 : NaN,
		closePercentile: closePercentile(closes),
		disparity20: disp[disp.length - 1] ?? null,
		stochasticK: st.k[st.k.length - 1] ?? null,
		stochasticD: st.d[st.d.length - 1] ?? null,
		psych12: psych[psych.length - 1] ?? null
	};
}
/**
* Bollinger is a 20-bar mean ± 2 sample-style σ (population σ of that window).
* Percentile bands are the empirical 10/50/90 of the longer window.
* They diverge when the short window is skewed or the longer window has fat tails.
*/
function compareBollingerAndPercentile(closes, bbPeriod = 20, bbMult = 2, pctWindow = 120) {
	if (closes.length < bbPeriod) return null;
	const close = closes[closes.length - 1];
	if (!(close > 0)) return null;
	const bb = bollinger(closes, bbPeriod, bbMult);
	const upper = bb.upper[bb.upper.length - 1] ?? null;
	const lower = bb.lower[bb.lower.length - 1] ?? null;
	const mid = bb.mid[bb.mid.length - 1] ?? null;
	const span = upper != null && lower != null ? upper - lower : null;
	const percentB = span != null && span > 0 ? (close - lower) / span : null;
	const bbWidthPct = span != null && mid != null && mid > 0 ? span / mid * 100 : null;
	const bands = rollingPercentileBands(closes, pctWindow);
	const p10 = bands.p10[bands.p10.length - 1] ?? null;
	const p50 = bands.p50[bands.p50.length - 1] ?? null;
	const p90 = bands.p90[bands.p90.length - 1] ?? null;
	const start = Math.max(0, closes.length - Math.max(20, pctWindow));
	const pctRank = closePercentile(closes.slice(start));
	let note = "볼린저는 최근 20봉 평균±2σ입니다. 백분위는 더 긴 구간의 종가 10·50·90%로, 분포를 정규라고 가정하지 않습니다.";
	const aboveBb = percentB != null && percentB > 1;
	const belowBb = percentB != null && percentB < 0;
	const highPct = pctRank != null && pctRank >= 90;
	const lowPct = pctRank != null && pctRank <= 10;
	if (aboveBb && !highPct) note = "단기 볼린저 상단 밖이지만, 긴 구간 백분위는 아직 상위 10%가 아닙니다. σ 밴드와 경험적 분포가 어긋난 상태입니다.";
	else if (belowBb && !lowPct) note = "단기 볼린저 하단 밖이지만, 긴 구간 백분위는 하위 10%가 아닙니다. 단기 변동성만 크게 벗어난 상태입니다.";
	else if (aboveBb && highPct) note = "볼린저 상단과 백분위 상단이 같이 위에 있습니다. 단기 σ와 중기 분포가 모두 비싼 쪽입니다.";
	else if (belowBb && lowPct) note = "볼린저 하단과 백분위 하단이 같이 아래에 있습니다. 단기 σ와 중기 분포가 모두 싼 쪽입니다.";
	else if (percentB != null && percentB > .8 && pctRank != null && pctRank < 60) note = "볼린저 %b는 상단에 가깝고 백분위 순위는 중간입니다. 최근 20봉 변동성이 줄며 밴드가 좁아진 경우입니다.";
	return {
		close,
		bbMid: mid,
		bbUpper: upper,
		bbLower: lower,
		percentB,
		bbWidthPct,
		p10,
		p50,
		p90,
		pctRank,
		window: Math.min(pctWindow, closes.length),
		note
	};
}
var DIVERGENCE_LABEL = {
	"regular-bullish": "정규 상승 다이버전스",
	"regular-bearish": "정규 하락 다이버전스",
	"hidden-bullish": "히든 상승 다이버전스",
	"hidden-bearish": "히든 하락 다이버전스"
};
/**
* Compare two confirmed swings.
* Lows: later price lower + RSI higher = regular bullish. Later price higher + RSI lower = hidden bullish.
* Highs: later price higher + RSI lower = regular bearish. Later price lower + RSI higher = hidden bearish.
* Equal prices or equal RSI are not a divergence.
*/
function classifySwingDivergence(side, earlierPrice, laterPrice, earlierRsi, laterRsi) {
	if (![
		earlierPrice,
		laterPrice,
		earlierRsi,
		laterRsi
	].every((n) => Number.isFinite(n))) return null;
	if (side === "low") {
		if (laterPrice < earlierPrice && laterRsi > earlierRsi) return "regular-bullish";
		if (laterPrice > earlierPrice && laterRsi < earlierRsi) return "hidden-bullish";
		return null;
	}
	if (laterPrice > earlierPrice && laterRsi < earlierRsi) return "regular-bearish";
	if (laterPrice < earlierPrice && laterRsi > earlierRsi) return "hidden-bearish";
	return null;
}
/**
* RSI divergence from confirmed pivots only.
* A pivot needs `right` bars after it, so the signal does not use an unfinished swing.
* On each side the latest regular pair and the latest hidden pair are kept,
* scanning the last six adjacent swings, and only if the later pivot is inside `maxAge`.
* Hidden bullish: higher price low, lower RSI low (uptrend continuation).
* Hidden bearish: lower price high, higher RSI high (downtrend continuation).
*/
function detectRsiDivergences(highs, lows, closes, opts) {
	const rsiPeriod = opts?.rsiPeriod ?? 14;
	const left = opts?.left ?? 5;
	const right = opts?.right ?? 5;
	const maxAge = opts?.maxAge ?? 40;
	if (closes.length < rsiPeriod + left + right + 2) return [];
	const rsi = rsiOf(closes, rsiPeriod);
	const pivots = findPivots(highs, lows, left, right);
	const out = [];
	const consider = (idxs, side, priceOf) => {
		const usable = idxs.filter((i) => rsi[i] != null && Number.isFinite(priceOf[i]));
		if (usable.length < 2) return;
		let latestRegular = null;
		let latestHidden = null;
		const start = Math.max(1, usable.length - 6);
		for (let k = usable.length - 1; k >= start; k--) {
			const i2 = usable[k];
			const i1 = usable[k - 1];
			if (closes.length - 1 - i2 > maxAge) continue;
			if (i2 - i1 < left) continue;
			const kind = classifySwingDivergence(side, priceOf[i1], priceOf[i2], rsi[i1], rsi[i2]);
			if (!kind) continue;
			const item = {
				kind,
				label: DIVERGENCE_LABEL[kind],
				i1,
				i2,
				price1: priceOf[i1],
				price2: priceOf[i2],
				rsi1: rsi[i1],
				rsi2: rsi[i2]
			};
			if (kind.startsWith("hidden")) {
				if (!latestHidden) latestHidden = item;
			} else if (!latestRegular) latestRegular = item;
			if (latestHidden && latestRegular) break;
		}
		if (latestHidden) out.push(latestHidden);
		if (latestRegular) out.push(latestRegular);
	};
	consider(pivots.lowIdx, "low", lows);
	consider(pivots.highIdx, "high", highs);
	return out;
}
function rsiOf(closes, period) {
	return rsi(closes, period);
}
//#endregion
export { vwap as S, quantSnapshot as _, RsiDivergenceStrip as a, sma as b, bollinger as c, computeSeriesRangePosition as d, detectMacdCrosses as f, macd as g, lastNumber as h, RangePositionStrip as i, compareBollingerAndPercentile as l, findPivots as m, ChartAnalyticsStrip as n, StreetTapeRow as o, detectRsiDivergences as p, MacdCrossStrip as r, atr as s, BandCompareStrip as t, computeRangePosition as u, rollingPercentileBands as v, streetTape as x, rsi as y };
