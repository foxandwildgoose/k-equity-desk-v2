import { B as getResearchPdf } from "./router-BWCKniEU.mjs";
import { t as buildResearchExecutiveSummary } from "./research-utils-TSOyZk7p.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/research-deep-NjPwDgl9.js
/** Deep-fetch rating / TP / PDF / longer body when user opens detail or PDF. */
async function fetchResearchDeepDetail(report) {
	return getResearchPdf({ data: {
		researchId: report.researchId,
		category: report.category
	} });
}
function mergeResearchDeep(report, deep) {
	const preview = deep.previewExtra && (!report.preview || deep.previewExtra.length > report.preview.length) ? deep.previewExtra : report.preview;
	const rating = deep.rating ?? report.rating;
	const targetPrice = deep.targetPrice != null && deep.targetPrice > 0 ? deep.targetPrice : report.targetPrice;
	return {
		...report,
		pdfUrl: deep.pdfUrl || report.pdfUrl,
		pageUrl: deep.pageUrl || report.pageUrl,
		rating,
		targetPrice,
		preview,
		summary: buildResearchExecutiveSummary(preview || report.summary || report.title, report.title),
		hasInvestmentView: Boolean(rating || targetPrice != null && targetPrice > 0)
	};
}
function openResearchPdfUrl(url) {
	window.open(url, "_blank", "noopener,noreferrer");
}
//#endregion
export { mergeResearchDeep as n, openResearchPdfUrl as r, fetchResearchDeepDetail as t };
