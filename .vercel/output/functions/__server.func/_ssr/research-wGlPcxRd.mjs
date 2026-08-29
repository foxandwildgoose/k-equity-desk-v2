import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { D as LoaderCircle } from "../_libs/lucide-react.mjs";
import { E as useResearchDesk, a as Route$7, g as DATA_LABEL } from "./router-B3Rw4zmt.mjs";
import { t as Badge } from "./badge-CIA2Y11i.mjs";
import { t as ResearchDeskPanel } from "./ResearchDesk-BLwDj5U6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/research-wGlPcxRd.js
var import_jsx_runtime = require_jsx_runtime();
function ResearchPage() {
	const { tab, sector } = Route$7.useSearch();
	const { data, isLoading, isError, dataUpdatedAt } = useResearchDesk();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight md:text-2xl",
					children: "리서치 데스크"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground max-w-2xl",
					children: "산업·시황·전략·경제 리포트를 한 곳에서 탐색합니다. 핵심요약을 먼저 읽고 산업·기간·증권사·키워드로 즉시 좁힐 수 있습니다."
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
				showHeader: false
			})
		]
	});
}
//#endregion
export { ResearchPage as component };
