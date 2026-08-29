import { V as notFound, v as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as normalizeKrTicker, l as isKrTicker, s as isDigitTicker, u as looksLikeEtf } from "./universe-BRNalp0M.mjs";
import { D as LoaderCircle, G as ChevronRight, H as Earth, M as Landmark, N as Info, O as Link2, Q as ArrowUpRight, j as Layers, p as ShieldCheck, u as Sparkles } from "../_libs/lucide-react.mjs";
import { B as formatPrice, H as formatVolume, I as formatHoldingPrice, J as cn, U as formatWeight, V as formatQty, i as Route$2, q as usePriceColors, y as useEtfBundle, z as formatPct } from "./router-B3Rw4zmt.mjs";
import { t as Badge } from "./badge-CIA2Y11i.mjs";
import { t as TradingChart } from "./TradingChart-D04RH6MR.mjs";
import { n as ReadableProse } from "./ReadableProse-Bn_J8NZp.mjs";
import { t as SourceLinks } from "./SourceLinks-D2Rqu6fk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/etfs._code-Cs5D28LH.js
var import_jsx_runtime = require_jsx_runtime();
var SLEEVE_TONE = {
	"kr-equity": "bg-desk-teal",
	"us-equity": "bg-desk-indigo",
	"overseas-equity": "bg-desk-indigo/70",
	"kr-etf": "bg-desk-navy",
	bond: "bg-desk-gold",
	future: "bg-desk-copper",
	cash: "bg-muted-foreground/50",
	other: "bg-desk-slate"
};
var CLASS_CHIP = {
	"kr-equity": "chip-teal",
	"us-equity": "chip-indigo",
	"overseas-equity": "chip-indigo",
	"kr-etf": "chip-blue",
	bond: "chip-gold",
	future: "chip-copper",
	cash: "bg-muted text-muted-foreground",
	other: "bg-muted text-muted-foreground"
};
function EtfDetailPage() {
	const { code } = Route$2.useParams();
	const normalized = normalizeKrTicker(code);
	const { data, isLoading, isError } = useEtfBundle(code);
	const colors = usePriceColors();
	if (!isKrTicker(normalized)) throw notFound();
	if (isDigitTicker(normalized) && data && "error" in data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/stock/$ticker",
		params: { ticker: normalized },
		replace: true
	});
	if (isDigitTicker(normalized) && data && "etf" in data && data.etf && !looksLikeEtf(normalized, data.etf.nameKo)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/stock/$ticker",
		params: { ticker: normalized },
		replace: true
	});
	if (data && "error" in data) throw notFound();
	const etf = data && "etf" in data ? data.etf : null;
	const holdings = data && "holdings" in data ? data.holdings : [];
	const themeStocks = data && "themeStocks" in data ? data.themeStocks : [];
	const peers = data && "peerEtfs" in data ? data.peerEtfs : [];
	const asOf = data && "holdingsAsOf" in data ? data.holdingsAsOf : null;
	const krCount = data && "krEquityCount" in data ? data.krEquityCount : 0;
	const allocation = data && "allocation" in data ? data.allocation : [];
	const officialWeightSum = data && "officialWeightSum" in data ? data.officialWeightSum : null;
	const officialCount = data && "officialCount" in data ? data.officialCount : 0;
	const quotedCount = data && "quotedCount" in data ? data.quotedCount : 0;
	const fmt = data && "descriptionFormatted" in data ? data.descriptionFormatted : {
		paragraphs: [],
		summary: "",
		bullets: [],
		plain: ""
	};
	const themeLabels = data && "themeLabels" in data ? data.themeLabels : [];
	const quoted = holdings.filter((h) => h.quote && h.quote.price > 0);
	const adv = quoted.filter((h) => (h.quote?.changePct ?? 0) > 0).length;
	const dec = quoted.filter((h) => (h.quote?.changePct ?? 0) < 0).length;
	const barBase = allocation.filter((s) => s.weight > 0).reduce((s, a) => s + a.weight, 0);
	const naverItemUrl = `https://finance.naver.com/item/main.naver?code=${(etf?.code ?? code).toUpperCase()}`;
	const plusSearchUrl = `https://www.plusetf.co.kr/product/overview?searchWord=${encodeURIComponent((etf?.code ?? code).toUpperCase())}`;
	const isPlus = /PLUS|한화/.test(`${etf?.nameKo ?? ""} ${data && "issuer" in data ? data.issuer : ""}`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/etfs",
						className: "hover:text-foreground",
						children: "ETF"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground font-medium",
						children: etf?.nameKo ?? code.toUpperCase()
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "page-header",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1 space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "desk-kicker",
								children: "Exchange Traded Fund"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-6 text-desk-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "page-title",
									children: isLoading && !etf ? "로딩…" : etf?.nameKo ?? code
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular text-muted-foreground font-medium",
										children: etf?.code ?? code.toUpperCase()
									}),
									etf?.retirementEligible ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										className: "chip-teal border-0 gap-1 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5" }), " 퇴직연금 후보(추정·미확정)"]
									}) : etf ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "text-desk-rose border-desk-rose/40 text-xs",
										children: "파생·제외 가능"
									}) : null,
									etf?.isNewCandidate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										className: "chip-gold border-0 gap-1 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), " 신규"]
									}),
									officialCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										className: "chip-teal border-0 gap-1 text-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-3.5" }),
											" 공식 비중 ",
											officialCount,
											"종"
										]
									}),
									themeLabels.map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "chip-indigo border-0 text-xs",
										children: label
									}, label))
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-base text-muted-foreground leading-relaxed",
								children: [
									data && "issuer" in data && data.issuer ? data.issuer : etf?.issuer ?? "운용사 확인 중",
									etf?.tabLabel ? ` · ${etf.tabLabel}` : "",
									data && "fee" in data && data.fee != null ? ` · 총보수 ${data.fee}%` : "",
									data && "marketValue" in data && data.marketValue ? ` · 시총 ${data.marketValue}` : ""
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "shrink-0 rounded-xl border border-border bg-card/70 px-5 py-4 lg:min-w-[200px] lg:text-right",
						children: isLoading && !etf ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5 text-base text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " 시세"]
						}) : etf ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-3xl font-semibold tabular tracking-tight",
								children: formatPrice(etf.price)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("mt-1 text-base font-semibold tabular", etf.changePct > 0 ? colors.up : etf.changePct < 0 ? colors.down : "text-muted-foreground"),
								children: [
									etf.changePct > 0 ? "+" : "",
									formatPrice(etf.change),
									" (",
									formatPct(etf.changePct),
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 text-sm text-muted-foreground tabular",
								children: [
									"거래량 ",
									etf.volume.toLocaleString("ko-KR"),
									etf.nav ? ` · NAV ${formatPrice(etf.nav)}` : ""
								]
							})
						] }) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-base text-price-down",
							children: "시세 실패"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-base text-muted-foreground",
							children: "—"
						})
					})]
				})
			}),
			isKrTicker(etf?.code ?? code) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-2",
				children: [etf && etf.nav > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"시장가",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold tabular text-foreground",
								children: formatPrice(etf.price)
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"NAV",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold tabular text-foreground",
								children: formatPrice(etf.nav)
							})
						] }),
						etf.nav > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"괴리율",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("font-semibold tabular", (etf.price - etf.nav) / etf.nav * 100 > 0 ? colors.up : (etf.price - etf.nav) / etf.nav * 100 < 0 ? colors.down : "text-foreground"),
								children: formatPct((etf.price - etf.nav) / etf.nav * 100)
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs",
							children: "분·일·주·월 캔들 · 추세선 · 피보나치 · RSI · 볼린저 · 측정"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "분·일·주·월 캔들 · 추세선 · 피보나치 · RSI · 볼린저 · 측정"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TradingChart, {
					code: normalizeKrTicker(etf?.code ?? code),
					market: "KOSPI"
				})]
			}) : null,
			(fmt.paragraphs.length > 0 || fmt.bullets.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadableProse, {
				doc: fmt,
				title: "상품 설명",
				className: "desk-card desk-card-navy border-0 shadow-none ring-1 ring-border",
				collapsedParagraphs: 2
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "desk-card desk-card-teal p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm text-muted-foreground",
								children: "편입 종목"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-xl font-semibold tabular",
								children: holdings.length || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-sm text-muted-foreground",
								children: [
									"국내주식 ",
									krCount,
									allocation.find((s) => s.id === "us-equity") ? ` · 미국 ${allocation.find((s) => s.id === "us-equity").weight.toFixed(1)}%` : "",
									allocation.find((s) => s.id === "bond") ? ` · 채권 ${allocation.find((s) => s.id === "bond").weight.toFixed(1)}%` : "",
									" · ",
									"기준 ",
									asOf ?? "—"
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "desk-card desk-card-gold p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm text-muted-foreground",
								children: "공식 비중 합계"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-xl font-semibold tabular",
								children: officialWeightSum != null && officialCount > 0 ? formatWeight(officialWeightSum) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-sm text-muted-foreground",
								children: [
									"추정 미사용 · 공시 ",
									officialCount,
									"/",
									holdings.length || 0
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "desk-card desk-card-indigo p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm text-muted-foreground",
								children: "실시간 시세"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-xl font-semibold tabular",
								children: quotedCount ? `${adv}↑ / ${dec}↓` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-sm text-muted-foreground",
								children: [
									"시세 반영 ",
									quotedCount,
									"종 · 테마 ",
									themeLabels.length ? themeLabels.join(" · ") : "일반"
								]
							})
						]
					})
				]
			}),
			allocation.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "desk-card desk-card-navy p-4 md:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end justify-between gap-2 mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-semibold",
							children: "자산군 공식 비중"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "NAV 대비 운용사 공시 · 파생·현금으로 합계 100%"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-3 w-full overflow-hidden rounded-full bg-muted",
						children: allocation.filter((s) => s.weight > 0).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn(SLEEVE_TONE[s.id] ?? "bg-muted-foreground", "h-full"),
							style: { width: `${barBase > 0 ? s.weight / barBase * 100 : 0}%` },
							title: `${s.label} ${s.weight.toFixed(2)}%`
						}, s.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: allocation.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2 py-1 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-2 rounded-full", SLEEVE_TONE[s.id] ?? "bg-muted-foreground") }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: s.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular font-semibold",
									children: formatWeight(s.weight)
								})
							]
						}, s.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "desk-card desk-card-teal overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-border px-4 py-3.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold",
							children: "편입 종목 · 실시간 시세"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground flex items-start gap-1.5 mt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4 shrink-0 mt-0.5" }), data && "themeNote" in data ? data.themeNote : "비중은 운용사 공식 공시만 사용합니다. 국내 주식·ETF 클릭 시 차트 화면으로 이동합니다."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceLinks, {
							className: "mt-2",
							size: "sm",
							primaryUrl: naverItemUrl,
							primaryLabel: "네이버 구성종목",
							more: isPlus ? [{
								label: "PLUS 운용사 페이지",
								url: plusSearchUrl
							}] : []
						})
					]
				}), isLoading && holdings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 py-12 text-center text-base text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin inline mr-2" }), "공식 편입·시세 로딩…"]
				}) : holdings.length === 0 && themeStocks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 py-12 text-center text-base text-muted-foreground",
					children: "편입 내역을 불러오지 못했습니다."
				}) : holdings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto scroll-thin",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[820px] text-base",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-muted/40 text-sm text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "text-left",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 font-medium",
										children: "비중"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 font-medium",
										children: "구분"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 font-medium",
										children: "종목"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 font-medium text-right",
										children: "현재가"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 font-medium text-right",
										children: "등락률"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 font-medium text-right",
										children: "수량"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 font-medium text-right",
										children: "거래량"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3" })
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border",
							children: holdings.map((row, idx) => {
								const q = row.quote;
								const pct = q?.changePct ?? 0;
								const krStock = Boolean(row.code && row.isKoreanEquity);
								const krEtf = Boolean(row.code && row.isKoreanEtf);
								const usLink = row.isOverseas && row.reutersCode ? `https://m.stock.naver.com/worldstock/stock/${row.reutersCode}/total` : null;
								const cls = "assetClass" in row && row.assetClass ? String(row.assetClass) : row.isCash ? "cash" : row.isOverseas ? "us-equity" : "other";
								const clsLabel = cls === "kr-equity" ? "국내주식" : cls === "kr-etf" ? "국내ETF" : cls === "us-equity" ? "미국주식" : cls === "overseas-equity" ? "해외주식" : cls === "bond" ? "채권" : cls === "future" ? "선물" : cls === "cash" ? "현금" : "기타";
								const w = row.weight;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-muted/25",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 tabular",
											children: w != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-[88px]",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: cn("font-semibold", w < 0 ? "text-desk-rose" : "text-foreground"),
													children: formatWeight(w)
												}), w > 0 && barBase > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "mt-1 h-1 w-full rounded bg-muted",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "h-1 rounded bg-desk-teal/80",
														style: { width: `${Math.min(100, w / Math.max(...holdings.map((h) => h.weight ?? 0), 1) * 100)}%` }
													})
												})]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												title: "운용사 미공시",
												children: "—"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: cn("inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium border-0", CLASS_CHIP[cls] ?? "bg-muted"),
												children: clsLabel
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-3",
											children: [krStock ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/stock/$ticker",
												params: { ticker: row.code },
												className: "font-semibold hover:underline",
												children: row.nameKo
											}) : krEtf ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/etfs/$code",
												params: { code: row.code },
												className: "font-semibold hover:underline",
												children: row.nameKo
											}) : usLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: usLink,
												target: "_blank",
												rel: "noopener noreferrer",
												className: "font-semibold hover:underline",
												children: row.nameKo
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold",
												children: row.nameKo
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground",
												children: [
													row.code && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "tabular",
														children: row.code
													}),
													row.reutersCode && !row.code && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "tabular",
														children: row.reutersCode
													}),
													"isin" in row && row.isin && !row.code && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "tabular",
														children: row.isin
													}),
													row.isOverseas && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "inline-flex items-center gap-0.5 text-desk-indigo",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Earth, { className: "size-3" }), " 해외"]
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-right tabular font-semibold",
											children: q?.price ? formatHoldingPrice(q.price, q.currency) : "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: cn("px-4 py-3 text-right tabular text-sm font-semibold", q ? pct > 0 ? colors.up : pct < 0 ? colors.down : "text-muted-foreground" : "text-muted-foreground"),
											children: q ? formatPct(pct) : "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-right tabular text-sm text-muted-foreground",
											children: formatQty(row.quantity)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-right tabular text-sm text-muted-foreground",
											children: q && q.volume > 0 ? formatVolume(q.volume) : "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-right",
											children: krStock ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/stock/$ticker",
												params: { ticker: row.code },
												className: "inline-flex items-center gap-0.5 text-sm text-primary hover:underline",
												children: ["차트 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3.5" })]
											}) : krEtf ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/etfs/$code",
												params: { code: row.code },
												className: "inline-flex items-center gap-0.5 text-sm text-primary hover:underline",
												children: ["ETF ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3.5" })]
											}) : usLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
												href: usLink,
												target: "_blank",
												rel: "noopener noreferrer",
												className: "inline-flex items-center gap-0.5 text-sm text-primary hover:underline",
												children: ["시세 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3.5" })]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: "—"
											})
										})
									]
								}, `${row.nameKo}-${idx}`);
							})
						})]
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto scroll-thin",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[560px] text-base",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-muted/40 text-sm text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3",
									children: "종목 (테마 매핑 · 비중 없음)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border",
							children: themeStocks.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/stock/$ticker",
									params: { ticker: row.code },
									className: "font-semibold hover:underline",
									children: row.nameKo
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground tabular",
									children: row.code
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/stock/$ticker",
									params: { ticker: row.code },
									className: "text-sm text-primary hover:underline",
									children: "차트"
								})
							})] }, row.code))
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "desk-card desk-card-indigo p-5 md:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-lg font-semibold flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-4 text-desk-indigo" }), "테마·밸류체인 관련 ETF"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground leading-relaxed",
						children: data && "peerNote" in data ? data.peerNote : "같은 산업 테마와 전·후방 밸류체인 ETF입니다."
					})]
				}), peers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-base text-muted-foreground py-6 text-center",
					children: "매칭된 관련 ETF가 없습니다."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3",
					children: peers.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/etfs/$code",
						params: { code: p.code },
						className: "rounded-xl border border-border bg-card/50 px-3.5 py-3 hover:bg-muted/40 transition-colors",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[15px] font-semibold leading-snug line-clamp-2",
								children: p.nameKo
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular",
										children: p.code
									}),
									"relation" in p && p.relation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded bg-desk-indigo/15 text-desk-indigo px-1.5 py-0.5",
										children: p.relation
									}),
									"isLeverageOrInverse" in p && p.isLeverageOrInverse && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-desk-rose",
										children: "파생"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex items-end justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-base font-semibold tabular",
									children: p.price ? formatPrice(p.price) : "—"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("text-sm font-semibold tabular", p.changePct > 0 ? colors.up : p.changePct < 0 ? colors.down : "text-muted-foreground"),
									children: formatPct(p.changePct)
								})]
							})
						]
					}, p.code))
				})]
			})
		]
	});
}
//#endregion
export { EtfDetailPage as component };
