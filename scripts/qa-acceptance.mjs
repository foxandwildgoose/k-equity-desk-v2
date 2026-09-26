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

await browser.close();
writeFileSync(join(outDir, "acceptance.json"), JSON.stringify({ at: new Date().toISOString(), results }, null, 2));
process.exit(results.every((r) => r.ok) ? 0 : 1);
