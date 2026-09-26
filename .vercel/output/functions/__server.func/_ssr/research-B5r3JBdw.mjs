import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { D as LoaderCircle } from "../_libs/lucide-react.mjs";
import { c as Route$11, k as useResearchDesk, y as DATA_LABEL } from "./router-BWCKniEU.mjs";
import { t as Badge } from "./badge-CIA2Y11i.mjs";
import { t as ResearchDeskPanel } from "./ResearchDesk-BuXSbxlK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/research-B5r3JBdw.js
var import_jsx_runtime = require_jsx_runtime();
function ResearchPage() {
	const { tab, sector, market } = Route$11.useSearch();
	const navigate = Route$11.useNavigate();
	const { data, isLoading, isError, dataUpdatedAt } = useResearchDesk();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight md:text-2xl",
					children: "리서치 데스크"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 max-w-2xl text-sm text-muted-foreground",
					children: [
						"한국 주식은 산업·시황·경제 리포트, 미국 주식은 월가·투자은행이 공개한 등급과 기사입니다. 공식 SEC·연준 원문은",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/us-research",
							className: "text-primary underline",
							children: "Research"
						}),
						"에 있습니다."
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-end gap-1",
					children: [
						isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 text-[11px] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }), " 리서치 수신"]
						}),
						dataUpdatedAt > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[10px] text-muted-foreground tabular",
							children: ["갱신 ", new Date(dataUpdatedAt).toLocaleTimeString("ko-KR")]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "text-[10px] font-normal",
							children: DATA_LABEL
						})
					]
				})]
			}),
			isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-price-down",
				children: "리서치 조회에 실패했습니다. 잠시 후 자동 재시도됩니다."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResearchDeskPanel, {
				pack: data ? {
					industry: data.industry,
					market: data.market,
					economy: data.economy,
					featured: data.featured
				} : null,
				loading: isLoading,
				defaultTab: tab ?? "industry",
				defaultSector: sector,
				defaultMarket: market === "us" ? "US" : "KR",
				onMarketChange: (next) => {
					navigate({ search: (prev) => ({
						...prev,
						market: next === "US" ? "us" : "kr"
					}) });
				},
				showHeader: false
			})
		]
	});
}
//#endregion
export { ResearchPage as component };
