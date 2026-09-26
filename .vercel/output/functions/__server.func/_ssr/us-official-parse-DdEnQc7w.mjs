//#region node_modules/.nitro/vite/services/ssr/assets/us-official-parse-DdEnQc7w.js
/** Pure parsers for official US research. No network. No invented figures. */
var RESEARCH_DISCLAIMER = "Summaries are for informational purposes only and are not investment advice. Always read the original document. Lines below are extracts or structured fields from a document this server retrieved. If a document was not retrieved, the card says so and does not fill the gap.";
var RESEARCH_DISCLAIMER_KO = "요약은 정보 제공용이며 투자 조언이 아닙니다. 항상 원문을 읽으세요. 아래 문장은 서버가 받아 온 문서의 발췌 또는 구조화 필드입니다. 문서를 받지 못하면 비워 두고, 지어내지 않습니다.";
var PAID_SOURCE_NOTE = "Paid industry products such as IBISWorld, CFRA Industry Surveys, and Gartner are typically available through a broker or library. This site does not host those PDFs and does not summarize them.";
var MONTHS = [
	"january",
	"february",
	"march",
	"april",
	"may",
	"june",
	"july",
	"august",
	"september",
	"october",
	"november",
	"december"
];
function decodeEntities(raw) {
	return raw.replace(/\u0026nbsp;/gi, " ").replace(/\u0026#160;/gi, " ").replace(/\u0026rsquo;|\u0026lsquo;|\u0026#8217;|\u0026#8216;/gi, "'").replace(/\u0026rdquo;|\u0026ldquo;|\u0026#8220;|\u0026#8221;/gi, "\"").replace(/\u0026mdash;/gi, "—").replace(/\u0026ndash;/gi, "–").replace(/\u0026amp;/gi, "&").replace(/\u0026quot;/gi, "\"").replace(/\u0026#39;|\u0026apos;/gi, "'").replace(/\u0026#x27;/gi, "'").replace(/\u0026lt;/gi, "<").replace(/\u0026gt;/gi, ">").replace(/&#(\d+);/g, (_, d) => {
		const n = Number(d);
		return n > 0 && n < 65536 ? String.fromCharCode(n) : "";
	}).replace(/&#x([0-9a-f]+);/gi, (_, h) => {
		const n = parseInt(h, 16);
		return n > 0 && n < 65536 ? String.fromCharCode(n) : "";
	});
}
function isoFromParts(year, monthName, day) {
	const mi = MONTHS.indexOf(monthName.toLowerCase());
	if (mi < 0 || day < 1 || day > 31 || year < 1990 || year > 2100) return null;
	const dt = new Date(Date.UTC(year, mi, day));
	if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== mi || dt.getUTCDate() !== day) return null;
	return dt.toISOString().slice(0, 10);
}
function formatDay(iso) {
	if (!iso) return "Date not stated";
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!m) return iso;
	return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC"
	});
}
function badgeTone(kind) {
	if (kind === "10-K" || kind === "10-Q" || kind === "8-K" || kind === "DEF 14A" || kind === "4" || kind === "13F-HR") return "border-desk-navy/40 bg-desk-navy/15 text-desk-navy";
	if (kind === "earnings-release") return "border-price-up-global/40 bg-price-up-global/15 text-price-up-global";
	if (kind === "industry") return "border-desk-teal/40 bg-desk-teal/15 text-desk-teal";
	if (kind === "bls-series" || kind === "bea-release" || kind.startsWith("fomc") || kind === "beige-book") return "border-desk-gold/40 bg-desk-gold/15 text-desk-gold";
	return "border-border bg-muted text-muted-foreground";
}
function absFederalReserve(href) {
	const trimmed = href.trim();
	let url;
	try {
		if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) url = new URL(trimmed);
		else if (trimmed.startsWith("//")) url = new URL(`https:${trimmed}`);
		else if (trimmed.startsWith("/")) url = new URL(`https://www.federalreserve.gov${trimmed}`);
		else return null;
	} catch {
		return null;
	}
	if (url.protocol !== "https:") return null;
	if (url.hostname !== "www.federalreserve.gov" && url.hostname !== "federalreserve.gov") return null;
	url.hostname = "www.federalreserve.gov";
	return url.toString();
}
function absBea(href) {
	try {
		const url = href.startsWith("http") ? new URL(href) : new URL(href, "https://www.bea.gov");
		if (url.protocol !== "https:" || url.hostname !== "www.bea.gov") return null;
		return url.toString();
	} catch {
		return null;
	}
}
function classifyFedLink(url) {
	const u = url.toLowerCase();
	if (u.includes("fomcminutes") && u.endsWith(".pdf")) return "minutes-pdf";
	if (u.includes("fomcminutes")) return "minutes-html";
	if (u.includes("fomcprojtabl") && u.endsWith(".pdf")) return "sep-pdf";
	if (u.includes("fomcprojtabl")) return "sep-html";
	if (u.includes("fomcpresconf") || u.includes("fomcpressconf")) return "press";
	if (/monetary\d{8}a1\.pdf/.test(u)) return "statement-pdf";
	if (/monetary\d{8}a1\.htm/.test(u)) return "implementation";
	if (/monetary\d{8}a\.htm/.test(u)) return "statement-html";
	return "other";
}
function parseFomcCalendar(html) {
	const out = [];
	const re = /<h4[^>]*>[\s\S]*?(20\d\d)\s+FOMC Meetings[\s\S]*?<\/h4>/gi;
	const marks = [];
	let m;
	while (m = re.exec(html)) marks.push({
		year: Number(m[1]),
		headingStart: m.index,
		contentStart: m.index + m[0].length
	});
	for (let i = 0; i < marks.length; i++) {
		const end = marks[i + 1]?.headingStart ?? html.length;
		const chunk = html.slice(marks[i].contentStart, end);
		for (const block of chunk.split("fomc-meeting__month").slice(1)) {
			const month = block.match(/<strong>([A-Za-z]+)<\/strong>/)?.[1];
			const dateRaw = block.match(/fomc-meeting__date[^>]*>([^<]+)/)?.[1]?.replace(/\s+/g, " ").trim();
			if (!month || !dateRaw) continue;
			const dayNums = dateRaw.match(/\d{1,2}/g)?.map(Number) ?? [];
			const endDay = dayNums.length ? dayNums[dayNums.length - 1] : null;
			const iso = endDay != null ? isoFromParts(marks[i].year, month, endDay) : null;
			const links = [];
			for (const href of block.matchAll(/href="([^"]+)"/g)) {
				const url = absFederalReserve(href[1] ?? "");
				if (!url) continue;
				const kind = classifyFedLink(url);
				if (kind === "other") continue;
				if (!links.some((l) => l.url === url)) links.push({
					url,
					kind
				});
			}
			const star = dateRaw.includes("*");
			out.push({
				year: marks[i].year,
				month,
				dateRaw,
				iso,
				dateLabel: `${month} ${dateRaw.replace(/\*/g, "").trim()}, ${marks[i].year}${star ? " (* as printed on the FOMC calendar)" : ""}`,
				links
			});
		}
	}
	return out;
}
function parseBeigeIndex(html) {
	const out = [];
	const parts = html.split(/<th[^>]*id="year"[^>]*>/i);
	for (const part of parts.slice(1)) {
		const year = Number(part.match(/^\s*(20\d\d)/)?.[1]);
		if (!year) continue;
		const body = part.split(/<th[^>]*id="year"/i)[0] ?? part;
		for (const row of body.matchAll(/<td>([\s\S]*?)<\/td>/gi)) {
			const inner = row[1] ?? "";
			const label = decodeEntities(inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim();
			if (!label || !/^[A-Za-z]+\s+\d{1,2}/.test(label)) continue;
			const month = label.match(/^([A-Za-z]+)/)?.[1] ?? "";
			const day = Number(label.match(/^[A-Za-z]+\s+(\d{1,2})/)?.[1]);
			const dateLabel = label.match(/^([A-Za-z]+\s+\d{1,2})/)?.[1] ?? label;
			const links = [...inner.matchAll(/href="([^"]+)"/g)].map((h) => absFederalReserve(h[1] ?? "")).filter((u) => Boolean(u));
			out.push({
				year,
				label: dateLabel,
				iso: isoFromParts(year, month, day),
				htmlUrl: links.find((u) => /beigebook/i.test(u) && /\.htm/i.test(u)) ?? null,
				pdfUrl: links.find((u) => /beigebook/i.test(u) && /\.pdf/i.test(u)) ?? null,
				scheduledOnly: links.length === 0
			});
		}
	}
	return out;
}
function parseBeaCurrentReleases(html) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const m of html.matchAll(/href="(\/news\/20\d\d\/[^"#]+)"[^>]*>([^<]+)/gi)) {
		const url = absBea(m[1] ?? "");
		const title = decodeEntities((m[2] ?? "").replace(/\s+/g, " ")).trim();
		if (!url || title.length < 8 || seen.has(url)) continue;
		seen.add(url);
		out.push({
			url,
			title
		});
	}
	return out;
}
function parseBeaSchedule(html) {
	const year = Number(html.match(/Year\s+(20\d\d)/)?.[1]);
	if (!year) return [];
	const out = [];
	for (const m of html.matchAll(/class="release-date">\s*([A-Za-z]+\s+\d{1,2})\s*<\/div>\s*<small[^>]*>\s*([^<]*)<\/small>[\s\S]*?class="release-title[^"]*"[^>]*>([\s\S]*?)<\/td>/gi)) {
		const dateLabel = (m[1] ?? "").trim();
		const timeLabel = (m[2] ?? "").replace(/\s+/g, " ").trim() || null;
		const title = decodeEntities((m[3] ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim();
		const month = dateLabel.match(/^([A-Za-z]+)/)?.[1] ?? "";
		const day = Number(dateLabel.match(/(\d{1,2})$/)?.[1]);
		if (!title) continue;
		out.push({
			iso: isoFromParts(year, month, day),
			dateLabel: `${dateLabel}, ${year}`,
			timeLabel,
			title
		});
	}
	return out;
}
var BOILER = /official website|skip to main|media inquiries|subscribe to (rss|email)|share sensitive information|an official website of the united states|back to home|the central bank of the united states/i;
function linesFromHtml(html, limit = 12e4) {
	return decodeEntities(html.slice(0, limit).replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|tr|li|h1|h2|h3|td)>/gi, "\n").replace(/<[^>]+>/g, " ")).split(/\n+/).map((l) => l.replace(/[ \t\f\v]+/g, " ").trim()).filter((l) => l.length > 0);
}
function articleLines(html) {
	const start = html.search(/id="article"/i);
	const slice = start >= 0 ? html.slice(start, start + 1e5) : html.slice(0, 1e5);
	const end = slice.search(/id="lastUpdate"/i);
	return linesFromHtml(end > 0 ? slice.slice(0, end) : slice);
}
function clipLine(s, max) {
	if (s.length <= max) return s;
	const cut = s.slice(0, max);
	const dot = cut.lastIndexOf(". ");
	if (dot > 80) return cut.slice(0, dot + 1);
	return `${cut.replace(/\s+\S*$/, "")}…`;
}
function usefulLines(lines, min = 70, max = 420) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const line of lines) {
		if (line.length < min || line.length > 900) continue;
		if (BOILER.test(line)) continue;
		const clipped = clipLine(line, max);
		const key = clipped.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(clipped);
	}
	return out;
}
function factLines(lines) {
	const useful = usefulLines(lines, 40, 380);
	const facts = useful.filter((l) => /\$|\bpercent\b|revenue|margin|income|earnings|dividend|outlook|billion|million|employment|inflation|gdp|price|committee|target range/i.test(l));
	return (facts.length >= 4 ? facts : useful).slice(0, 8);
}
function riskLines(lines) {
	const out = [];
	for (const line of usefulLines(lines, 40, 380)) {
		if (!/risk|uncertain|not assuming|downside|elevated|geopolitical/i.test(line)) continue;
		out.push(line);
		if (out.length >= 3) break;
	}
	return out;
}
function rateSentence(text) {
	const m = text.match(/target range for the federal funds rate[^.]{0,240}\./i);
	return m ? m[0].replace(/\s+/g, " ").trim() : null;
}
function framedAnnualFacts(facts) {
	const framed = facts.filter((f) => typeof f.end === "string" && typeof f.val === "number" && Number.isFinite(f.val) && f.form === "10-K" && f.fp === "FY" && typeof f.frame === "string" && /^CY\d{4}$/.test(f.frame));
	const byFrame = /* @__PURE__ */ new Map();
	for (const f of framed) {
		const prev = byFrame.get(f.frame);
		if (!prev || (f.filed ?? "") >= (prev.filed ?? "")) byFrame.set(f.frame, f);
	}
	return [...byFrame.values()].sort((a, b) => a.end < b.end ? -1 : a.end > b.end ? 1 : 0);
}
function framedQuarterlyFacts(facts) {
	const framed = facts.filter((f) => typeof f.end === "string" && typeof f.val === "number" && Number.isFinite(f.val) && (f.form === "10-Q" || f.form === "10-K") && typeof f.fp === "string" && /^Q[1-4]$/.test(f.fp) && typeof f.frame === "string" && /^CY\d{4}Q[1-4]$/.test(f.frame));
	const byFrame = /* @__PURE__ */ new Map();
	for (const f of framed) {
		const prev = byFrame.get(f.frame);
		if (!prev || (f.filed ?? "") >= (prev.filed ?? "")) byFrame.set(f.frame, f);
	}
	return [...byFrame.values()].sort((a, b) => a.end < b.end ? -1 : a.end > b.end ? 1 : 0);
}
function formatXbrlNumber(n) {
	if (!Number.isFinite(n)) return "";
	if (Number.isInteger(n)) return n.toLocaleString("en-US");
	return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
}
function priorFact(facts, latest) {
	const idx = facts.findIndex((f) => f.frame === latest.frame && f.end === latest.end);
	if (idx > 0) return facts[idx - 1] ?? null;
	return null;
}
function filingArchiveUrl(accession, primaryDocument) {
	if (!/^\d{10}-\d{2}-\d{6}$/.test(accession)) return null;
	if (!primaryDocument || primaryDocument.includes("..") || primaryDocument.startsWith("/")) return null;
	const cik = String(Number(accession.slice(0, 10)));
	if (!cik || cik === "NaN") return null;
	return `https://www.sec.gov/Archives/edgar/data/${cik}/${accession.replace(/-/g, "")}/${primaryDocument}`;
}
function filingIndexUrl(accession) {
	if (!/^\d{10}-\d{2}-\d{6}$/.test(accession)) return null;
	return `https://www.sec.gov/Archives/edgar/data/${String(Number(accession.slice(0, 10)))}/${accession.replace(/-/g, "")}/${accession}-index.html`;
}
function parseForm4Owner(html) {
	const m = html.match(/browse-edgar\?action=getcompany[^>]*>([^<]{2,80})</i);
	if (!m?.[1]) return null;
	return decodeEntities(m[1]).replace(/\s+/g, " ").trim() || null;
}
function tradesFromLines(lines) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (let i = 0; i < lines.length; i++) {
		const date = lines[i] ?? "";
		if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) continue;
		const security = [...lines.slice(Math.max(0, i - 3), i)].reverse().find((l) => /stock|share|option|unit/i.test(l));
		if (!security) continue;
		const window = lines.slice(i + 1, i + 9);
		const code = window.find((l) => /^[ASFMPGCD]$/.test(l));
		const amount = window.find((l) => /^[\d,]{2,}$/.test(l));
		const side = window.find((l) => l === "A" || l === "D");
		const price = window.find((l) => /^[\d,]+\.\d+$/.test(l));
		if (!code || !amount) continue;
		const sentence = `${security}: ${date}, transaction code ${code}, ${amount} shares${side ? `, ${side === "A" ? "acquired (A)" : "disposed (D)"}` : ""}${price ? `, price ${price} as printed` : ""}.`;
		if (seen.has(sentence)) continue;
		seen.add(sentence);
		out.push(sentence);
		if (out.length >= 4) break;
	}
	return out;
}
function policyTagsForSic(sic) {
	const s = sic.toLowerCase();
	const tags = /* @__PURE__ */ new Set(["growth"]);
	if (/bank|credit|depository|insurance|mortgage|reit|real estate/.test(s)) tags.add("rates");
	if (/retail|apparel|restaurant|food|beverage|consumer|automotive|auto dealer/.test(s)) tags.add("inflation");
	if (/oil|gas|petroleum|energy|coal|mining|chemical/.test(s)) tags.add("inflation");
	if (/semiconductor|electronic|computer|software|pharmaceutical|biological|medical/.test(s)) tags.add("industry");
	tags.add("labor");
	return [...tags];
}
function kindPolicyTag(kind, title) {
	if (kind.startsWith("fomc")) return "rates";
	if (kind === "beige-book") return "growth";
	if (kind === "industry") return "industry";
	if (kind === "bls-series") {
		if (/CUUR|WPSFD|cpi|ppi/i.test(title)) return "inflation";
		return "labor";
	}
	if (/personal income|outlays|pce/i.test(title)) return "inflation";
	if (/industr/i.test(title)) return "industry";
	return "growth";
}
function emptyReport(partial) {
	return {
		titleKo: partial.title,
		badge: partial.kind,
		badgeKo: partial.kind,
		sourceClass: "official",
		sourceName: "Official source",
		publishedAt: null,
		tickers: [],
		sectors: [],
		url: null,
		pdfUrl: null,
		indexUrl: null,
		accession: null,
		summaryStatus: "not-retrieved",
		summaryLabel: null,
		bottomLine: null,
		bullets: [],
		keyFigures: [],
		whatChanged: null,
		risks: [],
		implications: null,
		nextWatch: null,
		notes: [],
		...partial
	};
}
//#endregion
export { rateSentence as C, priorFact as S, tradesFromLines as T, parseBeaSchedule as _, badgeTone as a, parseForm4Owner as b, filingArchiveUrl as c, formatXbrlNumber as d, framedAnnualFacts as f, parseBeaCurrentReleases as g, linesFromHtml as h, articleLines as i, filingIndexUrl as l, kindPolicyTag as m, RESEARCH_DISCLAIMER as n, emptyReport as o, framedQuarterlyFacts as p, RESEARCH_DISCLAIMER_KO as r, factLines as s, PAID_SOURCE_NOTE as t, formatDay as u, parseBeigeIndex as v, riskLines as w, policyTagsForSic as x, parseFomcCalendar as y };
