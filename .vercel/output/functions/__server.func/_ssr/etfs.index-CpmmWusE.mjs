import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as rankByQuery, t as matchesSearchQuery } from "./search-match-0BigPUUT.mjs";
import { B as ExternalLink, D as LoaderCircle, G as ChevronRight, a as TriangleAlert, b as Newspaper, h as Search, j as Layers, p as ShieldCheck, u as Sparkles } from "../_libs/lucide-react.mjs";
import { B as formatPrice, G as relativeTime, J as cn, L as formatIsoDate, b as useEtfListingNews, f as Input, q as usePriceColors, x as useEtfMarket, z as formatPct } from "./router-B3Rw4zmt.mjs";
import { t as Badge } from "./badge-CIA2Y11i.mjs";
import { n as Toolbar } from "./DeskLayout-D7SSbRkS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/etfs.index-CpmmWusE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ETF_BUCKET_LABEL = {
	retirement: "퇴직연금 가능",
	all: "전체 ETF",
	new: "신규 상장",
	theme: "국내 테마",
	us: "미국·해외",
	bond: "채권·혼합"
};
var ETF_BUCKET_HINT = {
	retirement: "레버리지·인버스·2X 등 파생 ETF를 제외한 목록입니다. DC·IRP 공통 제한을 반영한 1차 필터이며, 운영사(미래에셋 등) 최종 허용 목록과 100% 일치하지 않을 수 있습니다.",
	all: "한국거래소 상장 ETF 전체(네이버 금융 실시간 목록).",
	new: "최근 3개월 이내 상장 후보. 상장일은 YYYY-MM-DD. 3개월 등락률은 성립하지 않아 표시하지 않습니다.",
	theme: "국내 업종·테마형 (퇴직연금 필터 적용).",
	us: "미국·해외 주식형 및 미국 테마 (퇴직연금 필터 적용).",
	bond: "채권·혼합·기타 (퇴직연금 필터 적용)."
};
function EtfIndexPage() {
	const [tab, setTab] = (0, import_react.useState)("retirement");
	const [q, setQ] = (0, import_react.useState)("");
	const [qDebounced, setQDebounced] = (0, import_react.useState)("");
	const [sort, setSort] = (0, import_react.useState)("default");
	const colors = usePriceColors();
	const isNews = tab === "new-news";
	const bucket = isNews ? "new" : tab;
	const isNew = tab === "new";
	(0, import_react.useEffect)(() => {
		const t = setTimeout(() => setQDebounced(q), 250);
		return () => clearTimeout(t);
	}, [q]);
	(0, import_react.useEffect)(() => {
		if (tab !== "new" && sort === "listed-new") setSort("default");
		if (tab === "new" && sort === "default") setSort("listed-new");
	}, [tab, sort]);
	const { data, isLoading, isError, isFetching } = useEtfMarket({
		bucket,
		q: isNews ? "" : qDebounced,
		limit: bucket === "all" ? 200 : 150,
		enabled: !isNews
	});
	const newsQ = useEtfListingNews({ enabled: isNews });
	const etfs = (0, import_react.useMemo)(() => {
		const raw = data?.etfs ?? [];
		const needle = q.trim();
		let rows = raw;
		if (needle) {
			const hits = raw.filter((e) => matchesSearchQuery(needle, [
				e.nameKo,
				e.code,
				e.tabLabel,
				e.issuer
			]));
			rows = rankByQuery(hits, needle, (e) => ({
				name: e.nameKo,
				code: e.code
			}));
		}
		if (sort === "listed-new") return [...rows].sort((a, b) => {
			const da = a.listedAt ? formatIsoDate(a.listedAt) : "";
			const db = b.listedAt ? formatIsoDate(b.listedAt) : "";
			if (da && db && da !== db) return db.localeCompare(da);
			if (da && !db) return -1;
			if (!da && db) return 1;
			return (a.daysListed ?? 9999) - (b.daysListed ?? 9999);
		});
		if (sort === "price-low") return [...rows].sort((a, b) => {
			const pa = a.price > 0 ? a.price : Number.POSITIVE_INFINITY;
			const pb = b.price > 0 ? b.price : Number.POSITIVE_INFINITY;
			if (pa !== pb) return pa - pb;
			return a.nameKo.localeCompare(b.nameKo, "ko");
		});
		return rows;
	}, [
		data?.etfs,
		q,
		sort
	]);
	const news = (0, import_react.useMemo)(() => {
		const raw = newsQ.data?.items ?? [];
		const needle = q.trim();
		if (!needle) return raw;
		return raw.filter((n) => matchesSearchQuery(needle, [
			n.title,
			n.source,
			n.matchedName,
			n.matchedCode
		]));
	}, [newsQ.data?.items, q]);
	const stats = data?.stats;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-stack",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "page-header",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "desk-kicker mb-1.5",
						children: "Retirement & listed ETF"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "page-title flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-7 text-desk-gold" }), "ETF 데스크"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "page-lead",
						children: "한국거래소 상장 ETF. 신규상장 뉴스 탭은 상장·상장예정 기사를 최신순으로 모읍니다. 상장 전에 구성 테마를 먼저 볼 수 있습니다."
					}),
					stats && !isNews && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "chip-gold px-2 py-1",
								children: ["전체 ", stats.total.toLocaleString()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "chip-teal px-2 py-1",
								children: ["퇴직연금 후보 ", stats.retirementEligible.toLocaleString()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "chip-copper px-2 py-1",
								children: ["파생 제외 ", stats.leverageExcluded.toLocaleString()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "chip-indigo px-2 py-1",
								children: ["신규 후보 ", stats.newCandidates.toLocaleString()]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "seg-tabs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setTab("retirement"),
							className: cn("seg-tab", tab === "retirement" ? "seg-tab-on" : ""),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3 text-desk-teal" }), "퇴직연금 가능"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setTab("new"),
							className: cn("seg-tab", tab === "new" ? "seg-tab-on" : ""),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3 text-desk-gold" }), "신규 상장"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setTab("new-news"),
							className: cn("seg-tab", isNews ? "seg-tab-on" : ""),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Newspaper, { className: "size-3 text-desk-gold" }), "신규상장 뉴스"]
						}),
						[
							"all",
							"theme",
							"us",
							"bond"
						].map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setTab(b),
							className: cn("seg-tab", tab === b ? "seg-tab-on" : ""),
							children: ETF_BUCKET_LABEL[b]
						}, b))
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative w-full sm:w-72",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: isNews ? "상장 뉴스 제목·운용사…" : "방산소부장 · AI데이터센터 · 바이오…",
							className: "h-10 pl-9 text-sm"
						}),
						q.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1.5 text-xs text-muted-foreground",
							children: [
								"“",
								q.trim(),
								"” 검색 ",
								isNews ? news.length : etfs.length,
								"건"
							]
						})
					]
				}),
				!isNews && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-semibold text-muted-foreground mr-1",
							children: "정렬"
						}),
						isNew ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSort("listed-new"),
							className: cn("seg-tab text-[11px]", sort === "listed-new" && "seg-tab-on"),
							children: "상장일 최신순"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSort("default"),
							className: cn("seg-tab text-[11px]", sort === "default" && "seg-tab-on"),
							children: "기본"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSort("price-low"),
							className: cn("seg-tab text-[11px]", sort === "price-low" && "seg-tab-on"),
							children: "현재가 낮은순"
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground flex items-start gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3.5 shrink-0 mt-0.5 text-desk-copper" }), isNews ? "국내 언론의 ETF 신규 상장·상장예정 기사입니다. 제목을 누르면 원문이 열립니다." : data?.note ?? ETF_BUCKET_HINT[bucket]]
			}),
			isNews ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "desk-card desk-card-gold overflow-hidden",
				children: [
					(newsQ.isLoading || newsQ.isFetching) && news.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 px-4 py-10 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " 신규 상장 뉴스 수신…"]
					}),
					newsQ.isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-4 py-8 text-sm text-price-down",
						children: "뉴스 조회에 실패했습니다."
					}),
					news.length === 0 && !newsQ.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-4 py-10 text-center text-sm text-muted-foreground",
						children: "조건에 맞는 상장 뉴스가 없습니다."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border",
						children: news.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "hover:bg-muted/25 px-4 py-3.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "sm:w-36 shrink-0 text-xs tabular text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-semibold text-foreground/80",
											children: formatIsoDate(n.datetime)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: relativeTime(n.datetime) })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap items-center gap-1.5",
												children: [
													n.stage === "scheduled" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														className: "chip-copper border-0 text-[10px]",
														children: "상장예정"
													}),
													n.stage === "listed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														className: "chip-gold border-0 text-[10px]",
														children: "신규상장"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[11px] text-muted-foreground",
														children: n.source
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: n.url,
												target: "_blank",
												rel: "noopener noreferrer",
												className: "mt-1 block text-[15px] font-semibold leading-snug hover:underline",
												children: n.title
											}),
											n.matchedName && n.matchedCode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/etfs/$code",
												params: { code: n.matchedCode },
												className: "mt-1.5 inline-block text-xs text-primary hover:underline",
												children: ["편입 보기 · ", n.matchedName]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: n.url,
										target: "_blank",
										rel: "noopener noreferrer",
										className: "inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary min-h-8",
										children: ["원문 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })]
									})
								]
							})
						}, n.id))
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				(isLoading || isFetching) && etfs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " ETF 목록 로딩…"]
				}),
				isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-price-down",
					children: "ETF 목록 조회 실패"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "desk-card desk-card-navy overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto scroll-thin",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "desk-table min-w-[720px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "ETF" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "유형" }),
								isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right",
									children: "상장일"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right",
									children: "현재가"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right",
									children: "등락률"
								}),
								!isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right",
									children: "3M"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right",
									children: "거래량"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right",
									children: "시총(억)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
							] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
								className: "divide-y divide-border",
								children: [etfs.length === 0 && q.trim() && !isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									colSpan: 8,
									className: "px-3 py-10 text-center text-sm text-muted-foreground",
									children: [
										"“",
										q.trim(),
										"”에 해당하는 ETF가 없습니다. 종목명·코드·테마 키워드로 다시 검색하세요."
									]
								}) }) : null, etfs.map((e) => {
									const up = e.changePct > 0;
									const down = e.changePct < 0;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "hover:bg-muted/25",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "px-3 py-2.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/etfs/$code",
													params: { code: e.code },
													className: "font-medium hover:underline",
													children: e.nameKo
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "tabular",
															children: e.code
														}),
														e.isNewCandidate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															className: "chip-gold border-0 text-[9px] h-4",
															children: "NEW"
														}),
														!e.retirementEligible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: "outline",
															className: "text-[9px] h-4 text-desk-rose",
															children: "파생"
														}),
														e.daysListed != null && e.daysListed <= 90 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "text-desk-teal",
															children: [
																"상장 ",
																e.daysListed,
																"일"
															]
														})
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-3 py-2.5 text-[11px] text-muted-foreground",
												children: e.tabLabel
											}),
											isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-3 py-2.5 text-right tabular text-xs font-semibold",
												children: formatIsoDate(e.listedAt)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-3 py-2.5 text-right tabular font-semibold",
												children: e.price ? formatPrice(e.price) : "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: cn("px-3 py-2.5 text-right tabular text-xs font-semibold", up ? colors.up : down ? colors.down : "text-muted-foreground"),
												children: formatPct(e.changePct)
											}),
											!isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-3 py-2.5 text-right tabular text-xs text-muted-foreground",
												children: e.threeMonthEarnRate == null ? "—" : formatPct(e.threeMonthEarnRate)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-3 py-2.5 text-right tabular text-xs text-muted-foreground",
												children: e.volume ? e.volume.toLocaleString("ko-KR") : "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-3 py-2.5 text-right tabular text-xs text-muted-foreground",
												children: e.marketSum ? e.marketSum.toLocaleString("ko-KR") : "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-3 py-2.5 text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
													to: "/etfs/$code",
													params: { code: e.code },
													className: "inline-flex items-center text-[11px] text-primary hover:underline",
													children: ["상세 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3" })]
												})
											})
										]
									}, e.code);
								})]
							})]
						})
					}), etfs.length === 0 && !isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-3 py-10 text-center text-sm text-muted-foreground",
						children: "조건에 맞는 ETF가 없습니다. 검색어나 탭을 바꿔 보세요."
					})]
				})
			] })
		]
	});
}
//#endregion
export { EtfIndexPage as component };
