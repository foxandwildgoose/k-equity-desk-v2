import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as getUniverseItem, o as inferSectorId } from "./universe-BRNalp0M.mjs";
import { n as SECTORS, t as FOCUS_SECTOR_IDS } from "./sectors-CSrSXBVT.mjs";
import { D as LoaderCircle, F as Flag, H as Earth, J as ChartLine, L as FileText, P as Gauge, R as FileSearch, et as ArrowRight, j as Layers, l as Star, nt as Activity, v as Radio, z as Factory } from "../_libs/lucide-react.mjs";
import { C as useMarketQuotes, E as useResearchDesk, F as sectorStatsFromQuotes, J as cn, K as useAppStore, N as marketMoversFromQuotes, P as mergeQuote, T as useQuotesByCodes, g as DATA_LABEL, h as DATA_DELAY_NOTE, m as PriceValue, p as PriceChange, q as usePriceColors, x as useEtfMarket, z as formatPct } from "./router-B3Rw4zmt.mjs";
import { t as Badge } from "./badge-CIA2Y11i.mjs";
import { t as Panel } from "./DeskLayout-D7SSbRkS.mjs";
import { t as StockMiniRow } from "./StockTable-BF5dru6s.mjs";
import { t as ResearchDeskPanel } from "./ResearchDesk-BLwDj5U6.mjs";
import { t as useMarketStream } from "./use-market-stream-CNnxOWqY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DyWzJV3o.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DecisionSnapshot({ quotes, research, liveConnected, snapshotAgeMs }) {
	const colors = usePriceColors();
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setReady(true);
	}, []);
	const liveQuotes = ready ? quotes : [];
	const valid = liveQuotes.filter((q) => q.price > 0);
	const adv = valid.filter((q) => q.changePct > 0).length;
	const dec = valid.filter((q) => q.changePct < 0).length;
	const unchanged = valid.length - adv - dec;
	const breadth = valid.length ? (adv - dec) / valid.length * 100 : 0;
	const sectorRanks = SECTORS.map((s) => ({
		sector: s,
		stats: sectorStatsFromQuotes(s.id, liveQuotes)
	})).filter((x) => x.stats.count > 0).sort((a, b) => b.stats.avgChangePct - a.stats.avgChangePct);
	const leader = sectorRanks[0];
	const laggard = sectorRanks[sectorRanks.length - 1];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "desk-card desk-card-gold p-3.5 md:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3.5 flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "desk-kicker mb-1",
						children: "Morning Brief"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "desk-section-title text-base",
						children: "Decision Snapshot"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "가격 → 시장 폭 → 주도 산업 → 새 리서치 순으로 판단"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold", liveConnected ? "bg-price-up/15 text-price-up" : "bg-muted text-muted-foreground"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3" }),
						" ",
						liveConnected ? "KIS·KRX LIVE" : "스냅샷 모드"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: Gauge,
						label: "시장 폭 (커버리지 기준)",
						value: `${adv}↑ / ${dec}↓ / ${unchanged}→`,
						sub: `${valid.length}종목 · Breadth ${breadth >= 0 ? "+" : ""}${breadth.toFixed(0)}`,
						className: breadth >= 0 ? colors.up : colors.down
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: Activity,
						label: "주도 / 부진 산업",
						value: leader ? `${leader.sector.nameKo} ${formatPct(leader.stats.avgChangePct)}` : "—",
						sub: laggard ? `${laggard.sector.nameKo} ${formatPct(laggard.stats.avgChangePct)}` : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: FileSearch,
						label: "신규 산업 리서치",
						value: `${research.length}건`,
						sub: research[0]?.summary || research[0]?.title || "최근 리포트 대기"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: Radio,
						label: "데이터 상태",
						value: liveConnected ? "실시간 체결 스트림" : "20초 스냅샷 백업",
						sub: snapshotAgeMs == null ? "갱신 확인 중" : `스냅샷 ${Math.max(0, Math.round(snapshotAgeMs / 1e3))}초 전`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-[10px] leading-relaxed text-muted-foreground border-t border-border pt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
						className: "text-foreground",
						children: "Red Team:"
					}),
					" 시장 폭·주도 산업은 ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "앱 커버리지 종목 샘플" }),
					" 기준이며 전체 코스피/코스닥이 아닙니다. 로테이션 판단 시 왜곡될 수 있습니다. 투자 권유가 아닙니다."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-1.5 border-t border-border pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] font-medium text-muted-foreground mr-1",
					children: "산업 리서치 바로가기"
				}), SECTORS.filter((s) => s.focus).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/research",
					search: {
						tab: "industry",
						sector: s.id
					},
					className: "rounded-md border border-border px-2 py-1 text-[10px] hover:bg-muted/50",
					children: s.nameKo
				}, s.id))]
			})
		]
	});
}
function Metric({ icon: Icon, label, value, sub, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "desk-stat",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1 desk-stat-label",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3" }),
					" ",
					label
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("desk-stat-value", className),
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground",
				children: sub
			})
		]
	});
}
function SectorTile({ id, nameKo, nameEn, quotes }) {
	const stats = sectorStatsFromQuotes(id, quotes);
	const colors = usePriceColors();
	const up = stats.avgChangePct > 0;
	const color = stats.avgChangePct === 0 ? "text-muted-foreground" : up ? colors.up : colors.down;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/industry/$sectorId",
		params: { sectorId: id },
		className: "group flex flex-col gap-1 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/40 hover:border-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-semibold leading-tight group-hover:underline",
					children: nameKo
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("text-xs font-semibold tabular shrink-0", color),
					children: stats.count ? formatPct(stats.avgChangePct) : "—"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] text-muted-foreground line-clamp-1",
				children: nameEn
			}),
			(stats.topGainer || stats.topLoser) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 flex flex-col gap-0.5 text-[11px]",
				children: [stats.topGainer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground truncate",
						children: stats.topGainer.nameKo
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("tabular", colors.up),
						children: formatPct(stats.topGainer.changePct)
					})]
				}), stats.topLoser && stats.topLoser.code !== stats.topGainer?.code && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground truncate",
						children: stats.topLoser.nameKo
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("tabular", colors.down),
						children: formatPct(stats.topLoser.changePct)
					})]
				})]
			})
		]
	});
}
function Dashboard() {
	const watchlist = useAppStore((s) => s.watchlist);
	const focusMode = useAppStore((s) => s.focusMode);
	const colors = usePriceColors();
	const { data, isLoading, isError, dataUpdatedAt } = useMarketQuotes();
	const [deferSecondary, setDeferSecondary] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const id = window.setTimeout(() => setDeferSecondary(true), 150);
		return () => window.clearTimeout(id);
	}, []);
	const researchQ = useResearchDesk({ enabled: deferSecondary });
	const etfQ = useEtfMarket({
		bucket: "retirement",
		limit: 12,
		enabled: deferSecondary
	});
	const liveStatus = useMarketStream([
		...watchlist,
		"005930",
		"000660",
		"005380",
		"000270",
		"373220",
		"034020",
		"009540",
		"207940",
		"035420",
		"105560"
	]);
	const extra = useQuotesByCodes(watchlist);
	const quotes = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const q of data?.quotes ?? []) map.set(q.code, q);
		for (const q of extra.data?.quotes ?? []) if (!map.has(q.code)) map.set(q.code, q);
		return [...map.values()];
	}, [data?.quotes, extra.data?.quotes]);
	const { gainers, losers } = marketMoversFromQuotes(quotes, 6);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	const watched = watchlist.map((c) => {
		const q = quotes.find((x) => x.code === c);
		const meta = getUniverseItem(c) ?? (q ? {
			code: q.code,
			nameKo: q.nameKo,
			nameEn: q.nameEn,
			sectorId: q.sectorId,
			market: q.market
		} : {
			code: c,
			nameKo: c,
			nameEn: c,
			sectorId: inferSectorId(c),
			market: "KOSPI"
		});
		return mergeQuote(meta, q);
	}).slice(0, 8);
	const sectorList = focusMode ? SECTORS.filter((s) => FOCUS_SECTOR_IDS.includes(s.id) || s.focus) : SECTORS;
	const marketOpen = mounted && quotes.some((q) => q.marketStatus === "OPEN" || q.marketStatus === "PREOPEN");
	const sessionLabel = !mounted ? "세션 확인 중" : marketOpen ? "정규장 개장" : "장 마감 / 휴장";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "dash-layout",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "area-head page-header flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "desk-kicker mb-1.5",
						children: "Institutional Equity Desk"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "page-title",
						children: "Korea Equity Command Center"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "page-lead",
						children: "시세 → 시장 폭 → 산업 리서치 → 공시 순으로 판단하는 데스크"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-end gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", marketOpen ? "bg-price-up/15 text-price-up" : "bg-muted text-muted-foreground"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", marketOpen ? "bg-price-up animate-pulse" : "bg-muted-foreground") }), sessionLabel]
							}), mounted && isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 text-[11px] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }), " 시세"]
							})]
						}),
						isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] text-price-down",
							children: "시세 조회 실패 — 자동 재시도"
						}),
						mounted && dataUpdatedAt > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[10px] text-muted-foreground tabular",
							children: ["시세 갱신 ", new Date(dataUpdatedAt).toLocaleTimeString("ko-KR")]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "text-[10px] font-normal",
							children: DATA_LABEL
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground max-w-xs",
							children: DATA_DELAY_NOTE
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "area-snap",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DecisionSnapshot, {
					quotes,
					research: researchQ.data?.industry ?? [],
					liveConnected: liveStatus.connected,
					snapshotAgeMs: mounted && dataUpdatedAt > 0 ? Date.now() - dataUpdatedAt : null
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				className: "area-etf",
				tone: "gold",
				title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-4 text-desk-gold" }), " ETF · 퇴직연금"] }),
				hint: "실시간 목록 · 레버리지·인버스 제외",
				href: "/etfs",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-1.5",
					children: (etfQ.data?.etfs ?? []).slice(0, 6).map((e) => {
						const pct = e.changePct ?? 0;
						const price = e.price;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/etfs/$code",
							params: { code: e.code },
							className: "flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2.5 hover:bg-muted/40 min-h-12",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-semibold truncate",
									children: e.nameKo
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground tabular",
									children: [e.code, e.isNewCandidate ? " · NEW" : ""]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-semibold tabular",
									children: price ? Number(price).toLocaleString("ko-KR") : "—"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: pct > 0 ? colors.up + " text-xs tabular font-medium" : pct < 0 ? colors.down + " text-xs tabular font-medium" : "text-xs text-muted-foreground tabular",
									children: formatPct(pct)
								})]
							})]
						}, e.code);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "area-us",
				tone: "teal",
				title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-4 text-desk-teal" }), " 미국 연계 산업"] }),
				hint: "AI·IRA·방산·원전 공급망",
				href: "/us-link",
				hrefLabel: "열기",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/industry/$sectorId",
					params: { sectorId: "us-linked" },
					className: "block rounded-lg border border-desk-gold/30 bg-desk-gold/5 px-3 py-3 hover:bg-desk-gold/10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-semibold text-desk-gold",
						children: "미국 연계 섹터 보드"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground leading-relaxed",
						children: "AI 메모리·배터리·방산·전력 밸류체인 종목 등락"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "desk-grid desk-grid-2",
					children: [{
						to: "/us-link",
						label: "미·중 AI 패권",
						sub: "HBM · CHIPS"
					}, {
						to: "/us-link",
						label: "미국 정책",
						sub: "IRA · 관세"
					}].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: x.to,
						className: "rounded-lg border border-border bg-muted/20 px-3 py-2.5 hover:bg-muted/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-semibold",
							children: x.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: x.sub
						})]
					}, x.label))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "area-research",
				tone: "indigo",
				title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4" }), " 리서치 데스크"] }),
				hint: "산업·시황·경제 리포트를 종목과 분리해 바로 선택",
				href: "/research",
				hrefLabel: "전체 열기",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 sm:grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/research",
							search: { tab: "industry" },
							className: "group flex items-start gap-2.5 rounded-lg border border-border bg-muted/15 px-3 py-2.5 hover:bg-muted/35 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Factory, { className: "size-4 mt-0.5 text-muted-foreground group-hover:text-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs font-semibold",
										children: "산업 리포트"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[11px] text-muted-foreground tabular",
										children: [researchQ.data?.industry.length ?? "—", "건 · 섹터 분석"]
									}),
									researchQ.data?.industry[0] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 text-[11px] line-clamp-2 text-foreground/80",
										children: researchQ.data.industry[0].summary || researchQ.data.industry[0].title
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/research",
							search: { tab: "market" },
							className: "group flex items-start gap-2.5 rounded-lg border border-border bg-muted/15 px-3 py-2.5 hover:bg-muted/35 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLine, { className: "size-4 mt-0.5 text-muted-foreground group-hover:text-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs font-semibold",
										children: "시황 · 전략"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[11px] text-muted-foreground tabular",
										children: [researchQ.data?.market.length ?? "—", "건 · 마켓레이더"]
									}),
									researchQ.data?.market[0] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 text-[11px] line-clamp-2 text-foreground/80",
										children: researchQ.data.market[0].summary || researchQ.data.market[0].title
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/research",
							search: { tab: "economy" },
							className: "group flex items-start gap-2.5 rounded-lg border border-border bg-muted/15 px-3 py-2.5 hover:bg-muted/35 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Earth, { className: "size-4 mt-0.5 text-muted-foreground group-hover:text-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs font-semibold",
										children: "경제 · 매크로"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[11px] text-muted-foreground tabular",
										children: [researchQ.data?.economy.length ?? "—", "건 · FX·정책"]
									}),
									researchQ.data?.economy[0] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 text-[11px] line-clamp-2 text-foreground/80",
										children: researchQ.data.economy[0].summary || researchQ.data.economy[0].title
									})
								]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResearchDeskPanel, {
					pack: researchQ.data ? {
						industry: researchQ.data.industry,
						market: researchQ.data.market,
						economy: researchQ.data.economy,
						featured: researchQ.data.featured
					} : null,
					loading: researchQ.isLoading,
					defaultTab: "industry",
					compact: true,
					showHeader: false
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "area-watch",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "desk-section-title",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 text-amber-400" }), " 관심종목"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/watchlist",
						className: "text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 min-h-9",
						children: ["전체 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3" })]
					})]
				}), watched.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "empty-state rounded-lg border border-dashed border-border",
					children: "관심종목을 추가하면 여기에 실시간 시세가 표시됩니다."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "desk-grid desk-grid-4",
					children: watched.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/stock/$ticker",
						params: { ticker: st.code },
						className: "rounded-lg border border-border bg-card p-3 hover:bg-muted/30 transition-colors",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium truncate",
									children: st.nameKo
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground tabular",
									children: st.code
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-right",
								children: st.price > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceValue, {
									value: st.price,
									changePct: st.changePct,
									size: "sm"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceChange, {
									change: st.change,
									changePct: st.changePct,
									size: "sm"
								})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "—"
								})
							})]
						})
					}, st.code))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "area-sectors",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "desk-section-title",
						children: "산업 커버리지"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "유니버스 평균 등락"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "desk-grid desk-grid-6",
					children: sectorList.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectorTile, {
						id: s.id,
						nameKo: s.nameKo,
						nameEn: s.nameEn,
						quotes
					}, s.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "area-up desk-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: cn("mb-2 text-sm font-semibold", colors.up),
					children: "상승 상위"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-0.5",
					children: gainers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "empty-state",
						children: isLoading ? "로딩 중…" : "데이터 없음"
					}) : gainers.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockMiniRow, { stock: st }, st.code))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "area-down desk-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: cn("mb-2 text-sm font-semibold", colors.down),
					children: "하락 상위"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-0.5",
					children: losers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "empty-state",
						children: isLoading ? "로딩 중…" : "데이터 없음"
					}) : losers.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockMiniRow, { stock: st }, st.code))
				})]
			})
		]
	});
}
var SplitComponent = Dashboard;
//#endregion
export { SplitComponent as component };
