//#region node_modules/.nitro/vite/services/ssr/assets/research-utils-TSOyZk7p.js
var DECISION_TERMS = [
	"목표주가",
	"투자의견",
	"매수",
	"중립",
	"매도",
	"실적",
	"영업이익",
	"매출",
	"마진",
	"수요",
	"수주",
	"가격",
	"재고",
	"성장",
	"하향",
	"상향",
	"리스크",
	"모멘텀",
	"밸류",
	"전망",
	"가이던스",
	"CAPEX",
	"환율",
	"정책"
];
function cleanResearchText(text) {
	return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/^[·•\-\s]+/, "").trim();
}
/** Deterministic extractive summary. It never invents facts outside the broker text. */
function buildResearchExecutiveSummary(text, title = "") {
	const clean = cleanResearchText(text);
	if (!clean) return cleanResearchText(title);
	const sentences = clean.split(/(?<=[.!?。]|다\.)\s+|\n+/).map((s) => s.trim()).filter((s) => s.length >= 12);
	if (!sentences.length) return clean.slice(0, 280);
	return sentences.map((sentence, index) => ({
		sentence,
		index,
		score: DECISION_TERMS.reduce((score, term) => score + (sentence.toLowerCase().includes(term.toLowerCase()) ? 2 : 0), 0) + (index < 2 ? 1 : 0)
	})).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, 2).sort((a, b) => a.index - b.index).map((x) => x.sentence).join(" ").slice(0, 320);
}
function reportHasInvestmentView(report) {
	return Boolean(report.rating || report.targetPrice != null && report.targetPrice > 0);
}
function latestReportPerBroker(reports) {
	const sorted = [...reports].sort((a, b) => b.date.localeCompare(a.date));
	const byBroker = /* @__PURE__ */ new Map();
	for (const report of sorted) if (!byBroker.has(report.broker)) byBroker.set(report.broker, report);
	return [...byBroker.values()];
}
function median(values) {
	if (!values.length) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}
//#endregion
export { reportHasInvestmentView as i, latestReportPerBroker as n, median as r, buildResearchExecutiveSummary as t };
