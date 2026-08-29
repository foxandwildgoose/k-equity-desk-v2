import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
import { i as partnerName, n as aggregateProxy, r as hsName, t as CORE20_HS_PROXY } from "./hs-map-CWBcqt5N.mjs";
import { t as fetchGoogleNewsRss } from "./us-link-feed-__8XiHkn.mjs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
//#region node_modules/.nitro/vite/services/ssr/assets/export-live-Dn4mq2tt.js
function parseFredCsv(csv, _seriesId) {
	const lines = csv.trim().split(/\r?\n/);
	const out = [];
	for (const line of lines.slice(1)) {
		const [date, raw] = line.split(",");
		if (!date || raw == null) continue;
		const v = Number(raw);
		if (!Number.isFinite(v)) continue;
		out.push({
			period: date.slice(0, 7),
			valueUsd: v
		});
	}
	return out;
}
var FRED_EXP = "XTEXVA01KRM667S";
var FRED_IMP = "XTIMVA01KRM667S";
var CACHE_PATH = "/tmp/kx-export-live-v1.json";
var COMTRADE = "https://comtradeapi.un.org/public/v1/preview/C/M/HS";
async function fetchWithTimeout(url, ms) {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), ms);
	try {
		return await fetch(url, {
			headers: {
				"User-Agent": "Mozilla/5.0 KoreaExportDesk/1.0",
				Accept: "*/*"
			},
			signal: ctrl.signal
		});
	} finally {
		clearTimeout(t);
	}
}
async function fetchFred(id) {
	const cached = await readFredCache(id);
	const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${encodeURIComponent(id)}&cosd=2000-01-01`;
	try {
		const res = await fetchWithTimeout(url, 12e3);
		if (!res.ok) throw new Error(`FRED ${id} HTTP ${res.status}`);
		const rows = parseFredCsv(await res.text(), id);
		if (rows.length < 12) throw new Error(`FRED ${id} too short`);
		await writeFredCache(id, rows);
		return rows;
	} catch (e) {
		if (cached.length) return cached;
		throw e;
	}
}
var FRED_CACHE = "/tmp/kx-fred-cache-v1.json";
async function readFredCache(id) {
	try {
		return JSON.parse(await readFile(FRED_CACHE, "utf8"))[id] ?? [];
	} catch {
		return [];
	}
}
async function writeFredCache(id, rows) {
	let all = {};
	try {
		all = JSON.parse(await readFile(FRED_CACHE, "utf8"));
	} catch {
		all = {};
	}
	all[id] = rows;
	try {
		await writeFile(FRED_CACHE, JSON.stringify(all), "utf8");
	} catch {}
}
async function comtrade(params) {
	const url = `${COMTRADE}?${new URLSearchParams(params).toString()}`;
	const res = await fetch(url, { headers: {
		"User-Agent": "Mozilla/5.0 KoreaExportDesk/1.0",
		Accept: "application/json"
	} });
	if (res.status === 429) {
		await new Promise((r) => setTimeout(r, 1600));
		const retry = await fetch(url, { headers: {
			"User-Agent": "Mozilla/5.0 KoreaExportDesk/1.0",
			Accept: "application/json"
		} });
		if (!retry.ok) return [];
		return (await retry.json()).data ?? [];
	}
	if (!res.ok) return [];
	return (await res.json()).data ?? [];
}
function yyyymm(d) {
	return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
function toDash(yyyymmStr) {
	return `${yyyymmStr.slice(0, 4)}-${yyyymmStr.slice(4, 6)}`;
}
function monthList(from, to) {
	const out = [];
	const cur = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
	const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1));
	while (cur <= end) {
		out.push(yyyymm(cur));
		cur.setUTCMonth(cur.getUTCMonth() + 1);
	}
	return out;
}
function snapFromRows(periodYm, rows) {
	const byCode = {};
	let total;
	for (const r of rows) {
		const cmd = String(r.cmdCode ?? "");
		const val = Number(r.primaryValue ?? r.fobvalue ?? NaN);
		if (!Number.isFinite(val)) continue;
		if (cmd === "TOTAL") {
			total = val;
			continue;
		}
		if (cmd.length === 2 || cmd.length === 4) byCode[cmd] = (byCode[cmd] ?? 0) + val;
	}
	return {
		period: toDash(periodYm),
		byCode,
		total
	};
}
async function readCache() {
	try {
		const raw = await readFile(CACHE_PATH, "utf8");
		return JSON.parse(raw);
	} catch {
		return {
			months: {},
			updatedAt: ""
		};
	}
}
async function writeCache(c) {
	try {
		await mkdir("/tmp", { recursive: true });
		await writeFile(CACHE_PATH, JSON.stringify(c), "utf8");
	} catch {}
}
async function ensureComtrade(cache, maxCalls) {
	let used = 0;
	const now = /* @__PURE__ */ new Date();
	const wanted = monthList(new Date(Date.UTC(now.getUTCFullYear() - 3, now.getUTCMonth(), 1)), now).reverse();
	for (const ym of wanted) {
		if (used >= maxCalls) break;
		const key = toDash(ym);
		if (cache.months[key] && Object.keys(cache.months[key].byCode).length > 10) continue;
		const rows = await comtrade({
			reporterCode: "410",
			period: ym,
			flowCode: "X",
			partnerCode: "0"
		});
		used += 1;
		if (!rows.length) continue;
		cache.months[key] = snapFromRows(ym, rows);
	}
	if (!cache.destinations && used < maxCalls) {
		const latest = Object.keys(cache.months).sort().at(-1);
		if (latest) {
			const rows = await comtrade({
				reporterCode: "410",
				period: latest.replace("-", ""),
				flowCode: "X",
				cmdCode: "TOTAL"
			});
			used += 1;
			const world = rows.find((r) => String(r.partnerCode) === "0");
			const worldVal = Number(world?.primaryValue ?? 0) || 1;
			cache.destinations = {
				period: latest,
				rows: rows.filter((r) => String(r.partnerCode) !== "0").map((r) => {
					const valueUsd = Number(r.primaryValue ?? 0);
					return {
						partnerCode: String(r.partnerCode ?? ""),
						name: partnerName(String(r.partnerCode ?? "")),
						valueUsd,
						share: valueUsd / worldVal
					};
				}).filter((r) => r.valueUsd > 0).sort((a, b) => b.valueUsd - a.valueUsd).slice(0, 18)
			};
		}
	}
	const latest = Object.keys(cache.months).sort().at(-1);
	if (latest && used < maxCalls) {
		const snap = cache.months[latest];
		if (snap.byCode["8542"] == null) {
			const rows = await comtrade({
				reporterCode: "410",
				period: latest.replace("-", ""),
				flowCode: "X",
				partnerCode: "0",
				cmdCode: "8542"
			});
			used += 1;
			const v = Number(rows[0]?.primaryValue ?? NaN);
			if (Number.isFinite(v)) snap.byCode["8542"] = v;
		}
	}
	return used;
}
function observationsFromCache(cache) {
	const rows = [];
	const periods = Object.keys(cache.months).sort();
	for (const period of periods) {
		const snap = cache.months[period];
		for (const [code, valueUsd] of Object.entries(snap.byCode)) {
			if (code.length !== 2) continue;
			rows.push({
				period,
				categoryId: `hs2:${code}`,
				categoryName: hsName(code),
				valueUsd,
				classification: "HS",
				vintage: "UN Comtrade HS",
				sourceFile: "UN Comtrade preview C/M/HS reporter=410 partner=World"
			});
		}
		for (const proxy of CORE20_HS_PROXY) {
			const v = aggregateProxy(snap.byCode, proxy.codes);
			if (v == null) continue;
			rows.push({
				period,
				categoryId: proxy.key,
				categoryName: proxy.key,
				valueUsd: v,
				classification: "HS",
				vintage: `HS_PROXY ${proxy.label}`,
				sourceFile: `UN Comtrade ${proxy.label}`
			});
		}
	}
	return rows;
}
var getLiveTradeBundle_createServerFn_handler = createServerRpc({
	id: "d489b0d52357f9a21a93e40ac58eb85f3ba93f98f375bba794822788e13718c6",
	name: "getLiveTradeBundle",
	filename: "src/server/export-live.ts"
}, (opts) => getLiveTradeBundle.__executeServer(opts));
var getLiveTradeBundle = createServerFn({ method: "GET" }).handler(getLiveTradeBundle_createServerFn_handler, async () => {
	const notes = [];
	const [exp, imp] = await Promise.all([fetchFred(FRED_EXP).catch((e) => {
		notes.push(`FRED exports: ${String(e)}`);
		return [];
	}), fetchFred(FRED_IMP).catch((e) => {
		notes.push(`FRED imports: ${String(e)}`);
		return [];
	})]);
	const cache = await readCache();
	try {
		await Promise.race([(async () => {
			await ensureComtrade(cache, 2);
			cache.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
			await writeCache(cache);
		})(), new Promise((resolve) => setTimeout(resolve, 7e3))]);
	} catch (e) {
		notes.push(`Comtrade: ${String(e)}`);
	}
	const observations = [...exp.map((p) => ({
		period: p.period,
		categoryId: "TOTAL",
		categoryName: "대한민국 총수출",
		valueUsd: p.valueUsd,
		classification: "TOTAL",
		vintage: "FRED/OECD XTEXVA01KRM667S",
		sourceFile: "FRED XTEXVA01KRM667S"
	})), ...observationsFromCache(cache)];
	const newsRaw = await Promise.race([fetchGoogleNewsRss("한국 월별 수출입동향 MOTIE 반도체 수출", 8, "ko").catch(() => []), new Promise((resolve) => setTimeout(() => resolve([]), 4e3))]);
	const destPeriod = cache.destinations?.period ?? "";
	return {
		exports: exp,
		imports: imp,
		observations,
		destinations: {
			period: destPeriod,
			rows: cache.destinations?.rows ?? [],
			source: destPeriod ? "UN Comtrade HS TOTAL by partner" : "N/A"
		},
		news: newsRaw.map((n) => ({
			title: n.title,
			url: n.url,
			publishedAt: n.datetime,
			source: n.source
		})),
		comtradeLatestPeriod: Object.keys(cache.months).sort().at(-1) ?? null,
		comtradeMonthsCached: Object.keys(cache.months).length,
		source: {
			totals: "FRED/OECD International Trade: Exports/Imports Value Goods Korea (XTEXVA01KRM667S / XTIMVA01KRM667S)",
			items: "UN Comtrade monthly HS, reporter=Korea (410), partner=World",
			fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
		},
		notes: [
			...notes,
			"FRED 총수출은 OECD 월별 공식 시계열입니다. MOTIE 잠정치(당월)보다 시차가 있습니다.",
			"품목은 UN HS이지 MOTIE MTI가 아닙니다. 반도체는 HS 8542가 있을 때만 별도, 없으면 HS 85(전기기기)로 근사하지 않습니다.",
			"관세 통계는 제품이지 상장기업 선적이 아닙니다."
		]
	};
});
//#endregion
export { getLiveTradeBundle_createServerFn_handler };
