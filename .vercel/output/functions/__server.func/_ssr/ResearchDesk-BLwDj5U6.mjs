import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as matchesSearchQuery } from "./search-match-0BigPUUT.mjs";
import { B as ExternalLink, D as LoaderCircle, H as Earth, J as ChartLine, Y as Building2, d as SlidersHorizontal, h as Search, z as Factory } from "../_libs/lucide-react.mjs";
import { B as formatPrice, J as cn, S as useIndustryResearch, c as SheetDescription, d as Button, f as Input, l as SheetHeader, o as Sheet, s as SheetContent, u as SheetTitle } from "./router-B3Rw4zmt.mjs";
import { t as Badge } from "./badge-CIA2Y11i.mjs";
import { n as RESEARCH_SECTOR_RULES } from "./research-taxonomy-CmazaFBS.mjs";
import { n as mergeResearchDeep, r as openResearchPdfUrl, t as fetchResearchDeepDetail } from "./research-deep-D0vFxWGg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ResearchDesk-BLwDj5U6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TABS = [
	{
		id: "industry",
		label: "산업",
		icon: Factory,
		blurb: "섹터별 리포트를 바로 골라 읽는 산업 리서치 터미널"
	},
	{
		id: "market",
		label: "시황·전략",
		icon: ChartLine,
		blurb: "마켓 레이더 · 투자전략 · 수급/스타일 변화"
	},
	{
		id: "economy",
		label: "경제",
		icon: Earth,
		blurb: "환율 · 금리 · 정책 · 거시경제 리서치"
	},
	{
		id: "featured",
		label: "기업",
		icon: Building2,
		blurb: "주요 종목 최신 기업 리포트"
	}
];
function RatingBadge({ rating }) {
	if (!rating) return null;
	const buy = /매수|비중확대|BUY|OUTPERFORM|OVERWEIGHT/i.test(rating);
	const sell = /매도|비중축소|SELL|UNDERPERFORM|UNDERWEIGHT/i.test(rating);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold", buy && "bg-price-up/15 text-price-up", sell && "bg-price-down/15 text-price-down", !buy && !sell && "bg-amber-500/15 text-amber-400"),
		children: rating
	});
}
function listFor(pack, tab) {
	if (tab === "industry") return pack.industry;
	if (tab === "market") return pack.market;
	if (tab === "economy") return pack.economy;
	return pack.featured ?? [];
}
function withinRange(dateText, range) {
	if (range === "all") return true;
	const normalized = dateText.replace(/\./g, "-");
	const date = new Date(normalized);
	if (Number.isNaN(date.getTime())) return true;
	const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
	return Date.now() - date.getTime() <= days * 864e5;
}
function ResearchDeskPanel({ pack, loading, defaultTab = "industry", defaultSector, compact = false, showHeader = true }) {
	const data = pack ?? {
		industry: [],
		market: [],
		economy: [],
		featured: []
	};
	const [tab, setTab] = (0, import_react.useState)(defaultTab);
	const [sector, setSector] = (0, import_react.useState)(defaultSector ?? "all");
	const [range, setRange] = (0, import_react.useState)("30d");
	const [query, setQuery] = (0, import_react.useState)("");
	const [broker, setBroker] = (0, import_react.useState)("all");
	const [active, setActive] = (0, import_react.useState)(null);
	const [pdfLoading, setPdfLoading] = (0, import_react.useState)(false);
	const [deepLoading, setDeepLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setTab(defaultTab), [defaultTab]);
	(0, import_react.useEffect)(() => setSector(defaultSector ?? "all"), [defaultSector]);
	const extraQ = useIndustryResearch(tab === "industry" && sector !== "all" ? sector : void 0);
	const mergedIndustry = (0, import_react.useMemo)(() => {
		if (sector === "all" || tab !== "industry") return data.industry;
		const extra = extraQ.data?.reports ?? [];
		if (!extra.length) return data.industry;
		const seen = new Set(extra.map((r) => `${r.sourceKind}:${r.researchId}`));
		const rest = data.industry.filter((r) => !seen.has(`${r.sourceKind ?? "naver"}:${r.researchId}`));
		return [...extra, ...rest];
	}, [
		data.industry,
		extraQ.data?.reports,
		sector,
		tab
	]);
	const viewPack = {
		...data,
		industry: mergedIndustry
	};
	const brokers = (0, import_react.useMemo)(() => {
		return [...new Set(listFor(viewPack, tab).map((r) => r.broker).filter(Boolean))].sort();
	}, [viewPack, tab]);
	const list = (0, import_react.useMemo)(() => {
		const q = query.trim();
		const targeted = tab === "industry" && sector !== "all" && (extraQ.data?.reports?.length ?? 0) > 0;
		const filtered = listFor(viewPack, tab).filter((r) => tab !== "industry" || sector === "all" || targeted || r.sectorIds.includes(sector)).filter((r) => broker === "all" || r.broker === broker).filter((r) => withinRange(r.date, range)).filter((r) => !q || matchesSearchQuery(q, [
			r.title,
			r.summary,
			r.preview,
			r.broker,
			r.nameKo,
			r.code,
			r.categoryLabel,
			r.sourceLabel
		])).sort((a, b) => b.date.localeCompare(a.date));
		return compact ? filtered.slice(0, 5) : filtered.slice(0, 80);
	}, [
		viewPack,
		tab,
		sector,
		broker,
		range,
		query,
		compact,
		extraQ.data?.reports
	]);
	async function openDetail(report) {
		setActive(report);
		if (report.sourceKind === "hankyung" && report.pdfUrl) return;
		setDeepLoading(true);
		try {
			const deep = await fetchResearchDeepDetail(report);
			setActive((prev) => prev && prev.researchId === report.researchId ? mergeResearchDeep(prev, deep) : prev);
		} catch {} finally {
			setDeepLoading(false);
		}
	}
	async function openPdf(report) {
		if (report.sourceKind === "hankyung" && (report.pdfUrl || report.pageUrl)) {
			openResearchPdfUrl(report.pdfUrl || report.pageUrl);
			return;
		}
		setPdfLoading(true);
		try {
			const deep = await fetchResearchDeepDetail(report);
			const merged = mergeResearchDeep(report, deep);
			setActive((prev) => prev && prev.researchId === report.researchId ? merged : prev);
			openResearchPdfUrl(merged.pdfUrl || merged.pageUrl);
		} catch {
			openResearchPdfUrl(report.pdfUrl || report.pageUrl);
		} finally {
			setPdfLoading(false);
		}
	}
	const tabMeta = TABS.find((t) => t.id === tab);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("space-y-3", showHeader && "rounded-xl border border-border bg-card p-3 md:p-4"),
		children: [
			showHeader && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "리서치 데스크"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-[11px] text-muted-foreground",
					children: "산업 → 핵심요약 → 원문 순으로 탐색"
				})] }), loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-muted-foreground" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1 rounded-lg bg-muted p-1",
				children: TABS.map((t) => {
					const Icon = t.icon;
					const count = listFor(viewPack, t.id).length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setTab(t.id),
						className: cn("inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium", tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3" }),
							t.label,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular opacity-70",
								children: count
							})
						]
					}, t.id);
				})
			}),
			tabMeta && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-muted-foreground",
				children: tabMeta.blurb
			}),
			!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-muted/15 p-2.5 space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 text-[10px] font-semibold text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "size-3" }), " 리서치 필터"]
					}),
					tab === "industry" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterButton, {
							active: sector === "all",
							onClick: () => setSector("all"),
							children: "전체 산업"
						}), RESEARCH_SECTOR_RULES.map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterButton, {
							active: sector === rule.sectorId,
							onClick: () => setSector(rule.sectorId),
							children: rule.label
						}, rule.sectorId))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-[1fr_auto_auto]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: query,
									onChange: (e) => setQuery(e.target.value),
									placeholder: "제목·요약·종목 검색",
									className: "h-8 pl-8 text-xs"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: broker,
								onChange: (e) => setBroker(e.target.value),
								className: "h-8 rounded-md border border-border bg-background px-2 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "전체 증권사"
								}), brokers.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: b,
									children: b
								}, b))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-1",
								children: [
									["7d", "7일"],
									["30d", "30일"],
									["90d", "90일"],
									["all", "전체"]
								].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterButton, {
									active: range === id,
									onClick: () => setRange(id),
									children: label
								}, id))
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"표시 ",
					list.length,
					"건",
					extraQ.isFetching && " · 업종 검색 중",
					extraQ.data && sector !== "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						" · 네이버 업종 ",
						extraQ.data.naverCount,
						" · 한경 ",
						extraQ.data.hankyungCount
					] })
				] }), tab === "industry" && sector !== "all" && extraQ.data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: extraQ.data.naverUrl,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "text-primary hover:underline",
						children: [
							"네이버 ",
							extraQ.data.upjongs.join("·"),
							" 원문"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: extraQ.data.hankyungUrl,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "text-primary hover:underline",
						children: "한경 컨센서스"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground",
					children: loading ? "리포트 수신 중…" : "현재 필터에 맞는 리포트가 없습니다."
				}) : list.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-lg border border-border bg-card overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => void openDetail(r),
						className: "w-full px-3 py-3 text-left hover:bg-muted/35",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "text-[10px]",
										children: r.categoryLabel
									}),
									r.sourceLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "chip-indigo border-0 text-[10px]",
										children: r.sourceLabel
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-medium",
										children: r.broker
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RatingBadge, { rating: r.rating }),
									r.targetPrice != null && r.targetPrice > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[10px] font-semibold tabular",
										children: ["TP ", formatPrice(r.targetPrice)]
									}),
									r.nameKo && r.code && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/stock/$ticker",
										params: { ticker: r.code },
										onClick: (e) => e.stopPropagation(),
										className: "text-[10px] text-primary hover:underline",
										children: r.nameKo
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-auto text-[10px] tabular text-muted-foreground",
										children: r.date
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-sm font-medium leading-snug",
								children: r.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 border-l-2 border-foreground/20 pl-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] font-semibold text-muted-foreground",
									children: "핵심요약"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 line-clamp-3 text-[12px] leading-relaxed text-foreground/95",
									children: r.summary || r.preview || r.title
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2 border-t border-border bg-muted/20 px-3 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline min-h-8",
								onClick: () => void openPdf(r),
								children: ["원문 보기 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground min-h-8",
								onClick: () => void openPdf(r),
								children: "PDF 열기"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground min-h-8 ml-auto",
								onClick: () => void openDetail(r),
								children: "상세"
							})
						]
					})]
				}, `${r.category}-${r.researchId}`))
			}),
			compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: RESEARCH_SECTOR_RULES.filter((r) => [
					"semiconductors",
					"battery",
					"bio",
					"energy",
					"robotics"
				].includes(r.sectorId)).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/research",
					search: {
						tab: "industry",
						sector: r.sectorId
					},
					className: "rounded-md border border-border px-2 py-1 text-[10px] hover:bg-muted/40",
					children: [r.label, " 리포트"]
				}, r.sectorId))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: !!active,
				onOpenChange: (o) => !o && setActive(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
					side: "right",
					className: "w-full max-w-lg overflow-y-auto scroll-thin p-0",
					children: active && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, {
						className: "sticky top-0 z-10 border-b border-border bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
							className: "pr-6 text-base leading-snug",
							children: active.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-foreground",
										children: active.broker
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: active.date }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RatingBadge, { rating: active.rating }),
									deepLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }), " 원문 상세 조회"]
									})
								]
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 px-4 py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									disabled: pdfLoading || deepLoading,
									onClick: () => void openPdf(active),
									className: "gap-1.5",
									children: [pdfLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" }), " PDF / 원문"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "sm",
									variant: "outline",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: active.pageUrl || "https://finance.naver.com/research/",
										target: "_blank",
										rel: "noopener noreferrer",
										children: "리서치 페이지 원문"
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-border bg-muted/25 p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] text-muted-foreground",
										children: "투자의견"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 min-h-6",
										children: active.rating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RatingBadge, { rating: active.rating }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: deepLoading ? "조회 중…" : "원문에 의견 없음/미추출"
										})
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-border bg-muted/25 p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] text-muted-foreground",
										children: "목표주가"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 text-base font-semibold tabular min-h-7",
										children: active.targetPrice ? formatPrice(active.targetPrice) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-normal text-muted-foreground",
											children: deepLoading ? "조회 중…" : "—"
										})
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-border bg-muted/20 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-[11px] font-semibold",
									children: "핵심요약"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 whitespace-pre-wrap text-sm leading-relaxed",
									children: active.summary || active.preview || active.title
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-muted-foreground",
								children: "목록은 경량 표시, 상세·PDF·원문 클릭 시 리서치 API와 원문 페이지를 깊게 조회해 목표가·의견·PDF를 채웁니다. 투자 전 원문·공시를 교차 확인하세요."
							})
						]
					})] })
				})
			})
		]
	});
}
function FilterButton({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("rounded-md border px-2 py-1 text-[10px] font-medium", active ? "border-foreground/30 bg-foreground text-background" : "border-border bg-background text-muted-foreground hover:text-foreground"),
		children
	});
}
//#endregion
export { ResearchDeskPanel as t };
