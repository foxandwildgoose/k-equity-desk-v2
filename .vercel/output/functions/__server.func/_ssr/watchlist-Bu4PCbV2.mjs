import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as getUniverseItem, o as inferSectorId, t as UNIVERSE } from "./universe-BRNalp0M.mjs";
import { l as Star } from "../_libs/lucide-react.mjs";
import { E as useMarketQuotes, O as useQuotesByCodes, U as mergeQuote, m as Button, nt as useAppStore } from "./router-BWCKniEU.mjs";
import { n as StockTable } from "./StockTable-Zast3Kry.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/watchlist-Bu4PCbV2.js
var import_jsx_runtime = require_jsx_runtime();
function WatchlistPage() {
	const watchlist = useAppStore((s) => s.watchlist);
	const add = useAppStore((s) => s.addToWatchlist);
	const { data } = useMarketQuotes();
	const extra = useQuotesByCodes(watchlist);
	const quotes = [...data?.quotes ?? [], ...extra.data?.quotes ?? []];
	const stocks = watchlist.map((c) => {
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
	}).filter(Boolean);
	const suggestions = UNIVERSE.filter((s) => !watchlist.includes(s.code)).slice(0, 6);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
			className: "flex items-center gap-2 text-xl font-semibold tracking-tight md:text-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-5 text-amber-400 fill-amber-400" }), "관심종목"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: "코스피·코스닥 전 종목을 검색해 추가할 수 있습니다. 로컬 저장."
		})] }), stocks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-dashed border-border py-16 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mb-4",
					children: "아직 관심종목이 없습니다. 상단 검색에서 종목을 찾아 별을 누르세요."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap justify-center gap-2",
					children: suggestions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => add(s.code),
						children: ["+ ", s.nameKo]
					}, s.code))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "text-xs text-muted-foreground hover:underline",
						children: "대시보드로 돌아가기"
					})
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockTable, { stocks })]
	});
}
//#endregion
export { WatchlistPage as component };
