#!/usr/bin/env node
/**
 * Browser acceptance checks (C2) that need a real page. External data is
 * replaced with Playwright route mocks — synthetic fixture (format sample),
 * not market data — which exist only in this QA harness and never ship in
 * the app. Screenshots → .qa/at-*.png, verdict → .qa/acceptance.json.
 *
 * Usage: npm run qa:acceptance [-- --only AT-09,AT-12]
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, ".qa");
mkdirSync(outDir, { recursive: true });
const BASE = process.env.QA_BASE ?? "http://127.0.0.1:8080";
const onlyArg = process.argv.indexOf("--only");
const ONLY = onlyArg > 0 ? new Set(process.argv[onlyArg + 1].split(",")) : null;

async function chromium() {
  const { chromium } = await import("playwright");
  try {
    return await chromium.launch();
  } catch {
    const exe = "/opt/pw-browsers/chromium";
    if (existsSync(exe)) return chromium.launch({ executablePath: exe });
    throw new Error("no chromium");
  }
}

const NOW = Date.now();
const iso = (minsAgo) => new Date(NOW - minsAgo * 60_000).toISOString();

// synthetic fixture (format sample), not market data
function item(p) {
  return {
    kind: "news",
    region: "KR",
    sourceTier: 3,
    precision: "minute",
    fetchedAt: iso(0),
    tickers: [],
    sectors: [],
    topics: [],
    lang: "ko",
    ...p,
  };
}

// synthetic fixture (format sample), not market data
const KR_PAGE = {
  items: [
    item({ id: "qa:kr1", sourceId: "naver-flash", sourceName: "네이버 증권 속보", outlet: "연합뉴스", sourceTier: 1, title: "[QA 샘플] LG에너지솔루션 북미 공장 증설 검토", url: "https://example.com/qa/kr1", publishedAt: iso(5), tickers: [{ market: "KR", code: "373220" }], importance: { score: 72, tier: "high", reasons: ["1차 출처 +25", "기업 이벤트: 인수 +20"] } }),
    item({ id: "qa:kr2", sourceId: "hankyung-finance", sourceName: "한국경제 증권", sourceTier: 2, title: "[QA 샘플] 코스피 마감 시황", url: "https://example.com/qa/kr2", publishedAt: iso(40), snippet: "QA 샘플 요약" }),
    item({ id: "qa:kr3", sourceId: "krx-disclosures", sourceName: "KRX·DART 주요 공시", kind: "disclosure", sourceTier: 1, title: "[QA 샘플] 주요사항보고서", url: "https://example.com/qa/kr3", publishedAt: iso(300) }),
    item({ id: "qa:kr4", sourceId: "gn-kr-market", sourceName: "Google 뉴스", title: "[QA 샘플] 날짜만 있는 항목", url: "https://example.com/qa/kr4", publishedAt: new Date(NOW - 3 * 86_400_000).toISOString().slice(0, 10) + "T12:00:00.000Z", precision: "day" }),
  ],
  nextCursor: null,
  partial: false,
  sources: [
    { id: "naver-flash", ok: true, count: 1, state: "ok" },
    { id: "hankyung-finance", ok: true, count: 1, state: "ok" },
  ],
  generatedAt: iso(0),
};

// synthetic fixture (format sample), not market data
const US_PAGE = {
  items: [
    item({ id: "qa:us1", region: "US", lang: "en", sourceId: "bloomberg-markets", sourceName: "Bloomberg Markets", sourceTier: 1, paywalled: true, title: "[QA sample] Stocks rally as yields ease", url: "https://example.com/qa/us1", publishedAt: iso(10) }),
    item({ id: "qa:us2", region: "US", lang: "en", sourceId: "gn-us-market", sourceName: "Google News (US market)", outlet: "Reuters", sourceTier: 1, title: "[QA sample] Treasury yields fall", url: "https://example.com/qa/us2", publishedAt: iso(20), tickers: [{ market: "US", code: "NVDA" }] }),
  ],
  nextCursor: null,
  partial: true,
  sources: [
    { id: "bloomberg-markets", ok: true, count: 1, state: "ok" },
    { id: "gn-us-market", ok: true, count: 1, state: "ok" },
    { id: "fed-press", ok: false, count: 0, state: "error" },
  ],
  generatedAt: iso(0),
};

const results = [];
function record(id, ok, detail) {
  results.push({ id, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${id} — ${detail}`);
}

async function mockFeed(page, byRegion) {
  await page.route("**/api/feed?**", async (route) => {
    const u = new URL(route.request().url());
    const body = byRegion[u.searchParams.get("region") ?? "KR"] ?? { items: [], nextCursor: null, partial: false, sources: [], generatedAt: iso(0) };
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
}

async function run(browser, id, fn) {
  if (ONLY && !ONLY.has(id)) return;
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "ko-KR", timezoneId: "Asia/Seoul" });
  const page = await ctx.newPage();
  try {
    await fn(page, ctx);
  } catch (err) {
    record(id, false, String(err).slice(0, 300));
  } finally {
    await page.screenshot({ path: join(outDir, `at-${id.toLowerCase()}.png`) }).catch(() => undefined);
    await ctx.close();
  }
}

/**
 * Mock TanStack server functions by export name. Responses use seroval's
 * cross-JSON format — the same wire format the Start runtime emits.
 */
async function mockServerFns(page, handlers) {
  const { toCrossJSONAsync } = await import("seroval");
  await page.route("**/_serverFn/**", async (route) => {
    const url = new URL(route.request().url());
    const seg = url.pathname.split("/_serverFn/")[1] ?? "";
    let exp = "";
    try {
      exp = JSON.parse(Buffer.from(seg.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")).export ?? "";
    } catch {
      /* not decodable */
    }
    const name = exp.replace(/_createServerFn_handler$/, "");
    const h = handlers[name];
    if (!h) return route.continue();
    let payload = null;
    try {
      const raw = url.searchParams.get("payload");
      if (raw) {
        const { fromJSON } = await import("seroval");
        payload = fromJSON(JSON.parse(raw));
      }
    } catch {
      /* ignore */
    }
    const out = await h(payload?.data ?? payload);
    if (out && out.__status) return route.fulfill({ status: out.__status, body: "error" });
    const body = JSON.stringify(await toCrossJSONAsync({ result: out, error: undefined, context: {} }, { refs: new Map() }));
    await route.fulfill({ status: 200, contentType: "application/json", headers: { "x-tss-serialized": "true" }, body });
  });
}

// synthetic fixture (format sample), not market data
function report(i, extra = {}) {
  const day = new Date(NOW - Math.floor(i / 4) * 86_400_000 + 9 * 3_600_000).toISOString().slice(0, 10);
  return {
    researchId: 900000 - i,
    code: "005930",
    nameKo: "삼성전자",
    title: `[QA 샘플] 리포트 ${i}`,
    broker: i % 2 ? "가증권" : "나증권",
    date: day,
    preview: "QA 샘플 미리보기 문장입니다. 목표주가를 유지한다.",
    rating: "매수",
    targetPrice: 100000 + i * 100,
    category: "company",
    categoryLabel: "기업",
    pageUrl: `${BASE}/status/sources?page=${900000 - i}`,
    summary: "QA 샘플 요약",
    sectorIds: [],
    tags: [],
    hasInvestmentView: true,
    sourceKind: "naver",
    sourceLabel: "네이버 리서치 v2",
    v2Type: "company",
    summarySource: "preview",
    ...extra,
  };
}

function researchPage(type, index, n, total) {
  return {
    type,
    index,
    reports: type === "company" ? Array.from({ length: n }, (_, k) => report(index * n + k)) : [],
    totalCount: type === "company" ? total : 0,
    hasNext: type === "company" && index < 1,
    path: "v2",
    error: null,
    fetchedAt: iso(0),
  };
}

const EMPTY_BRIEFING = { todayCounts: [], up: [], down: [], weeklyHot: [], newCoverage: [], errors: [], fetchedAt: iso(0) };

const browser = await chromium();

await run(browser, "AT-09", async (page) => {
  await mockFeed(page, { KR: KR_PAGE });
  await page.goto(`${BASE}/news/kr`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-feed-id]", { timeout: 20_000 });
  const rows = await page.$$eval("[data-feed-list] [data-feed-id]", (els) => els.map((e) => ({ id: e.getAttribute("data-feed-id"), t: e.getAttribute("data-published") })));
  const times = rows.map((r) => Date.parse(r.t));
  const sorted = times.every((t, i) => i === 0 || times[i - 1] >= t);
  const anchors = await page.$$eval("[data-feed-list] article a[target]", (as) => as.map((a) => ({ target: a.getAttribute("target"), rel: a.getAttribute("rel") })));
  const relOk = anchors.length > 0 && anchors.every((a) => a.target === "_blank" && a.rel === "noopener noreferrer");
  const digest = await page.isVisible('[data-testid="briefing-digest"]');
  const sources = await page.$$eval("[data-feed-list] article", (as) => as.every((a) => a.textContent && a.textContent.length > 0));
  const dateOnly = await page.textContent('[data-feed-id="qa:kr4"] time');
  record("AT-09", sorted && relOk && digest && sources && !/:/.test(dateOnly ?? ""), `rows=${rows.length} newestFirst=${sorted} rel=${relOk} digest=${digest} dateOnlyLabel="${dateOnly}"`);
});

await run(browser, "AT-11", async (page) => {
  await mockFeed(page, { KR: KR_PAGE });
  await page.goto(`${BASE}/news/kr`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-feed-id="qa:kr1"]', { timeout: 20_000 });
  const hrefs = await page.$$eval('[data-feed-id="qa:kr1"] a[data-ticker]', (as) => as.map((a) => a.getAttribute("href")));
  const ok = hrefs.includes("/stock/373220") && !hrefs.includes("/stock/003550");
  record("AT-11", ok, `ticker chips ${JSON.stringify(hrefs)}`);
});

await run(browser, "AT-12", async (page) => {
  await mockFeed(page, { US: US_PAGE });
  await page.goto(`${BASE}/news/us`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-feed-id="qa:us1"]', { timeout: 20_000 });
  const bb = await page.textContent('[data-feed-id="qa:us1"]');
  const hasPaid = /유료/.test(bb ?? "");
  const hasSnippet = await page.$('[data-feed-id="qa:us1"] p');
  const tiles = await page.textContent('[data-testid="briefing-digest"]');
  const delayLabel = /지연/.test(tiles ?? "");
  const before = await page.textContent('[data-feed-id="qa:us2"] time');
  await page.click('button[aria-pressed]:has-text("ET")');
  await page.waitForTimeout(300);
  const title = await page.getAttribute('[data-feed-id="qa:us2"] time', "title");
  const toggled = /ET/.test(title ?? "");
  record("AT-12", hasPaid && !hasSnippet && delayLabel && toggled, `유료=${hasPaid} snippetHidden=${!hasSnippet} delayLabels=${delayLabel} tzToggle=${toggled} (${before})`);
});

await run(browser, "AT-13", async (page, ctx) => {
  await ctx.addInitScript(() => {
    localStorage.setItem(
      "korea-equity-cc",
      JSON.stringify({ state: { newsPrefs: { tz: "KST", disabledSources: [], bloombergEnabled: false, minImportance: 0, watchOnly: false } }, version: 2 }),
    );
  });
  await mockFeed(page, { US: US_PAGE });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${BASE}/news/us`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-feed-id="qa:us2"]', { timeout: 20_000 });
  const bloomberg = await page.$('[data-feed-id="qa:us1"]');
  record("AT-13", !bloomberg && errors.length === 0, `bloomberg row hidden=${!bloomberg} pageErrors=${errors.length}`);
});

async function researchMocks(page, resolveDelay = 1_200, resolveFails = false) {
  await mockServerFns(page, {
    getResearchV2: (d) => researchPage(d?.type ?? "company", d?.index ?? 0, 16, 1234),
    getResearchBriefing: () => EMPTY_BRIEFING,
    getResearchV2Detail: () => ({ report: null, bulletsText: "", prev: null, next: null, pdfUrl: null, pageUrl: `${BASE}/status/sources`, summarySource: "none", path: "v2", error: null }),
    resolveResearchOriginal: async (d) => {
      await new Promise((r) => setTimeout(r, resolveDelay));
      if (resolveFails) return { __status: 500 };
      return { pdfUrl: `${BASE}/status/sources?pdf=${d?.nid}`, pageUrl: `${BASE}/status/sources?page=${d?.nid}` };
    },
  });
}

await run(browser, "AT-15", async (page) => {
  await researchMocks(page);
  await page.goto(`${BASE}/research?tab=company`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-research-list] [data-research-id]", { timeout: 20_000 });
  const read = () => page.$$eval("[data-research-list] [data-research-id]", (els) => els.map((e) => ({ id: Number(e.getAttribute("data-research-id")), t: e.getAttribute("data-published") })));
  const first = await read();
  const headers = await page.$$eval("[data-research-list] [data-date-header]", (els) => els.length);
  const counts = await page.textContent('[data-testid="research-counts"]');
  await page.click("text=더 보기");
  await page.waitForFunction((n) => document.querySelectorAll("[data-research-list] [data-research-id]").length > n, first.length, { timeout: 15_000 });
  const second = await read();
  const ordered = second.every((r, i) => i === 0 || second[i - 1].t > r.t || (second[i - 1].t === r.t && second[i - 1].id > r.id));
  const noDup = new Set(second.map((r) => r.id)).size === second.length;
  record("AT-15", ordered && noDup && headers > 1 && /1,234/.test(counts ?? ""), `rows ${first.length}→${second.length} ordered=${ordered} noDup=${noDup} dateHeaders=${headers} counts="${counts?.trim()}"`);
});

for (const vp of [
  { id: "AT-16", w: 1280, h: 900, mobile: false },
  { id: "AT-16-mobile", w: 390, h: 844, mobile: true },
]) {
  await run(browser, vp.id, async (page, ctx) => {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await researchMocks(page);
    await page.goto(`${BASE}/research?tab=company`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-research-list] [data-research-id]", { timeout: 20_000 });
    // Row 14+ is never pre-resolved (only the first 12 are), so the click takes the async path.
    const target = page.locator("[data-research-list] [data-research-id]").nth(14);
    await target.scrollIntoViewIfNeeded();
    const nid = await target.getAttribute("data-research-id");
    const [popup] = await Promise.all([ctx.waitForEvent("page", { timeout: 10_000 }), target.locator('[data-action="pdf"]').click()]);
    await popup.waitForURL(/pdf=/, { timeout: 10_000 });
    const okUrl = popup.url().includes(`pdf=${nid}`);
    const opener = await popup.evaluate(() => window.opener === null);
    record(vp.id, okUrl && opener, `async-resolved popup ${popup.url().replace(BASE, "")} opener=null:${opener}`);
    await popup.close();
  });
}

await run(browser, "AT-16-fallback", async (page, ctx) => {
  await researchMocks(page, 300, true);
  await page.goto(`${BASE}/research?tab=company`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-research-list] [data-research-id]", { timeout: 20_000 });
  const target = page.locator("[data-research-list] [data-research-id]").nth(13);
  await target.scrollIntoViewIfNeeded();
  const nid = await target.getAttribute("data-research-id");
  const [popup] = await Promise.all([ctx.waitForEvent("page", { timeout: 10_000 }), target.locator('[data-action="pdf"]').click()]);
  await popup.waitForURL(/page=/, { timeout: 10_000 });
  record("AT-16-fallback", popup.url().includes(`page=${nid}`), `resolution failed → research page ${popup.url().replace(BASE, "")}`);
});

await run(browser, "AT-18", async (page) => {
  await researchMocks(page);
  await page.goto(`${BASE}/research?tab=company`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-research-list] [data-research-id]", { timeout: 20_000 });
  const body = await page.textContent("main");
  const oldFeatured = /주요 종목 최신 기업 리포트/.test(body ?? "");
  const hasMore = await page.isVisible("text=더 보기");
  record("AT-18", !oldFeatured && hasMore, `old 7-stock list text present=${oldFeatured}; company tab paginates (더 보기 visible=${hasMore})`);
});

// synthetic fixture (format sample), not market data
const STREET_PACK = {
  notes: [
    { id: "n1", symbol: "NVDA", broker: "QA Broker A", action: "Upgrade", actionKo: "상향", rating: "Hold → Buy", target: "$150 → $180", date: "2026-09-25", publishedAt: "2026-09-25T12:00:00.000Z", precision: "day", seq: 2, summary: "QA", pageUrl: "https://finviz.com/quote.ashx?t=NVDA", sourceLabel: "Finviz" },
    { id: "n2", symbol: "TSLA", broker: "QA Broker B", action: "Downgrade", actionKo: "하향", rating: "Buy → Hold", target: "$300", date: "2026-09-24", publishedAt: "2026-09-24T12:00:00.000Z", precision: "day", seq: 1, summary: "QA", pageUrl: "https://finviz.com/quote.ashx?t=TSLA", sourceLabel: "Finviz" },
    { id: "n3", symbol: "NVDA", broker: "QA Broker C", action: "Reiterated", actionKo: "유지", rating: "Buy", target: "$170 → $190", date: "2026-09-20", publishedAt: "2026-09-20T12:00:00.000Z", precision: "day", seq: 1, summary: "QA", pageUrl: "https://finviz.com/quote.ashx?t=NVDA", sourceLabel: "Finviz" },
  ].map((n) => ({ ...n, publishedAt: new Date(NOW - (n.id === "n1" ? 1 : n.id === "n2" ? 2 : 6) * 86_400_000).toISOString() })),
  headlines: [
    { id: "h1", symbol: "NVDA", title: "[QA sample] QA Broker A upgrades Nvidia", source: "기사", url: "https://example.com/qa/h1", when: "Today 09:00AM", publishedAt: iso(60), precision: "minute" },
    { id: "h2", symbol: "TSLA", title: "[QA sample] QA Broker B downgrades Tesla", source: "기사", url: "https://example.com/qa/h2", when: "Yesterday 09:00AM", publishedAt: iso(1500), precision: "minute" },
  ],
  consensus: [],
  note: "QA",
  fetchedAt: iso(0),
};

await run(browser, "AT-19", async (page) => {
  await mockServerFns(page, { getUsStreet: () => STREET_PACK });
  await page.goto(`${BASE}/research?market=us`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-testid="street-moves"] [data-street-rows] tr', { timeout: 20_000 });
  const banner = await page.isVisible('[data-testid="us-scope-banner"]');
  const bannerText = await page.textContent('[data-testid="us-scope-banner"]');
  const exact = (bannerText ?? "").includes("미국 투자은행 리포트 PDF는 고객 전용으로 공개되지 않습니다.");
  const links = await page.$$eval("main a[target=_blank]", (as) => as.length);
  record("AT-19", banner && exact && links > 3, `scope banner=${banner} exactText=${exact} original links=${links}`);
});

await run(browser, "AT-20", async (page) => {
  await mockServerFns(page, { getUsStreet: () => STREET_PACK });
  await page.goto(`${BASE}/research?market=us`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-testid="street-moves"] [data-street-rows] tr', { timeout: 20_000 });
  const stamps = await page.$$eval('[data-testid="street-moves"] [data-street-rows] tr', (trs) => trs.map((t) => t.getAttribute("data-published")));
  const sorted = stamps.every((t, i) => i === 0 || stamps[i - 1] >= t);
  await page.selectOption('[data-testid="street-moves"] select[aria-label="티커"]', "NVDA");
  const visibleRows = await page.$$eval('[data-testid="street-moves"] [data-street-rows] tr', (trs) => trs.length);
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click('[data-testid="street-csv"]')]);
  const path = await dl.path();
  const { readFileSync } = await import("node:fs");
  const csv = readFileSync(path, "utf8").replace(/^\uFEFF/, "").trim().split("\n");
  record("AT-20", sorted && csv.length - 1 === visibleRows && /street-moves-\d{8}-\d{4}\.csv$/.test(dl.suggestedFilename()), `dateDesc=${sorted} visible=${visibleRows} csvRows=${csv.length - 1} file=${dl.suggestedFilename()}`);
});

await browser.close();
writeFileSync(join(outDir, "acceptance.json"), JSON.stringify({ at: new Date().toISOString(), results }, null, 2));
process.exit(results.every((r) => r.ok) ? 0 : 1);
