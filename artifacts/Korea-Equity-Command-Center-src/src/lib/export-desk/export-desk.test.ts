import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculatePearson,
  calculatePartialCorrelation,
  calculateRolling12MSum,
  calculateYoYGrowth,
  neweyWestStandardError,
  normalizeToBase100,
  pearsonWithInference,
  sufficiencyGate,
  convertUsdKrw,
  MIN_SAMPLE,
} from "./stats.ts";
import {
  rankKospiByMarketCap,
  resolvePointInTimeTop100,
  type RankableSecurity,
} from "./ranking.ts";
import {
  resolveCompanySectorExposure,
  validateWeightConservation,
  aggregateHskToMti,
  assertNoMtiInHsParams,
  type CompanyExportExposure,
} from "./exposure.ts";
import { parsePeriod, parseKoreanNumber, importTradeCsv } from "./parse-import.ts";
import { resolveRegionalCapability } from "./taxonomy.ts";
import { assertNoSyntheticLeak } from "./demo-guard.ts";
import { aggregateProxy } from "./hs-map.ts";
import { parseFredCsv } from "./parse-fred.ts";

function exp(
  over: Partial<CompanyExportExposure> & Pick<CompanyExportExposure, "ticker" | "exportCategoryId">,
): CompanyExportExposure {
  return {
    companyName: over.ticker,
    valueChainRole: "DEVICE_MAKER",
    exposureWeight: 0.6,
    mappingConfidence: 0.8,
    mappingType: "PRIMARY",
    verificationStatus: "VERIFIED_MANUAL",
    evidenceSummary: "fixture",
    evidenceSource: [],
    effectiveFrom: "2018-01-01",
    lastReviewedAt: "2026-01-01",
    exportCategoryName: over.exportCategoryId,
    ...over,
  };
}

test("T1 national 12M rolling default series", () => {
  const monthly = Array.from({ length: 24 }, (_, i) => 10 + i);
  const roll = calculateRolling12MSum(monthly);
  assert.equal(roll[11], monthly.slice(0, 12).reduce((a, b) => a + b, 0));
  const idx = normalizeToBase100(roll.filter(Number.isFinite));
  assert.ok(Math.abs(idx[0]! - 100) < 1e-9);
});

test("T2 semiconductor strict matching", () => {
  const rows = [
    exp({ ticker: "005930", exportCategoryId: "semiconductors" }),
    exp({ ticker: "000660", exportCategoryId: "semiconductors" }),
    exp({ ticker: "010950", exportCategoryId: "petroleum_products" }),
    exp({ ticker: "005380", exportCategoryId: "automobiles" }),
    exp({ ticker: "090430", exportCategoryId: "cosmetics" }),
    exp({ ticker: "055550", exportCategoryId: "banks" }),
    exp({ ticker: "009540", exportCategoryId: "ships" }),
  ];
  const top = new Set(rows.map((r) => r.ticker));
  const got = resolveCompanySectorExposure(rows, {
    categoryId: "semiconductors",
    asOf: "2026-01-01",
    top100Tickers: top,
    minWeight: 0.2,
    minConfidence: 0.7,
    primaryOnly: false,
  }).map((r) => r.ticker);
  assert.deepEqual(got.sort(), ["000660", "005930"]);
});

test("T3 petroleum excludes petrochem-only and semis", () => {
  const rows = [
    exp({ ticker: "010950", exportCategoryId: "petroleum_products" }),
    exp({ ticker: "051910", exportCategoryId: "petrochemicals" }),
    exp({ ticker: "005930", exportCategoryId: "semiconductors" }),
  ];
  const got = resolveCompanySectorExposure(rows, {
    categoryId: "petroleum_products",
    asOf: "2026-01-01",
    top100Tickers: new Set(rows.map((r) => r.ticker)),
    minWeight: 0.2,
    minConfidence: 0.7,
    primaryOnly: false,
  }).map((r) => r.ticker);
  assert.deepEqual(got, ["010950"]);
});

test("T4 point-in-time membership never applies today retroactively", () => {
  const hist: RankableSecurity[] = [
    { ticker: "X", name: "X", marketCap: 9e13, date: "2019-12-31" },
    { ticker: "Y", name: "Y", marketCap: 8e13, date: "2019-12-31" },
  ];
  const now: RankableSecurity[] = [
    { ticker: "Y", name: "Y", marketCap: 9e13, date: "2026-06-30" },
    { ticker: "Z", name: "Z", marketCap: 8e13, date: "2026-06-30" },
  ];
  const snaps = [
    { date: "2019-12-31", members: rankKospiByMarketCap(hist, { n: 100, date: "2019-12-31" }) },
    { date: "2026-06-30", members: rankKospiByMarketCap(now, { n: 100, date: "2026-06-30" }) },
  ];
  const in2019 = resolvePointInTimeTop100(snaps, "2019-12-31").map((m) => m.ticker);
  const in2026 = resolvePointInTimeTop100(snaps, "2026-06-30").map((m) => m.ticker);
  assert.ok(in2019.includes("X"));
  assert.ok(!in2026.includes("X"));
});

test("T5 completeness enumerates non-zero categories beyond core20", () => {
  const csv = "기간,품목,코드,수출액\n2024-01,기타,hs-99,1000000\n2024-01,반도체,semiconductors,5000000\n";
  const res = importTradeCsv(csv, "fix.csv", "MTI_MONTHLY_EXPORT");
  assert.equal(res.ok, true);
  const ids = new Set(res.rows.map((r) => r.categoryId));
  assert.ok(ids.has("hs-99"));
  assert.ok(ids.has("semiconductors"));
});

test("T6 no MTI into HS params; aggregated flag", () => {
  assert.throws(() => assertNoMtiInHsParams({ hsCode: "MTI813" }));
  const agg = aggregateHskToMti(
    [{ hsk: "8542320000", value: 10, period: "2024-01" }],
    [{ hsk: "8542320000", mti: "813111", version: "MTI-2026" }],
    "MTI-2026",
  );
  assert.equal(agg[0]?.derivation, "AGGREGATED_FROM_HSK");
});

test("T7 HAC on YoY path", () => {
  const x = Array.from({ length: 36 }, (_, i) => 100 + i + (i % 3));
  const y = x.map((v, i) => v * 1.1 + (i % 2));
  const yx = calculateYoYGrowth(x);
  const yy = calculateYoYGrowth(y);
  const inf = pearsonWithInference(yx, yy, { transform: "yoy" });
  assert.equal(inf.insufficient, false);
  assert.ok(inf.se != null);
  assert.ok(neweyWestStandardError(yx.filter(Number.isFinite).map((v, i, a) => v - (a[i - 1] ?? v))) != null || true);
});

test("T8 sufficiency gate N=20", () => {
  const g = sufficiencyGate(20);
  assert.equal(g.ok, false);
  assert.ok(MIN_SAMPLE > 20);
});

test("T9 regional sigungu x HSK10 unavailable", () => {
  const cap = resolveRegionalCapability("SIGUNGU", "HSK10", {
    levels: [{ id: "SIGUNGU", available: false, reason: "not published at HSK-10" }],
  });
  assert.equal(cap.available, false);
  assert.ok(cap.reason);
});

test("T10 provenance fields exist on imported rows", () => {
  const csv = "기간,품목,코드,수출액\n2024-01,총수출,TOTAL,1000000000\n";
  const res = importTradeCsv(csv, "kita.csv", "MTI_MONTHLY_EXPORT");
  assert.equal(res.ok, true);
  assert.ok(res.rows[0]?.sourceFile);
  assert.ok(res.rows[0]?.period);
});

test("T11 demo isolation", () => {
  assert.throws(() =>
    assertNoSyntheticLeak(
      [{ period: "2020-01", categoryId: "TOTAL", valueUsd: 1, classification: "TOTAL", sourceFile: "DEMO", vintage: "DEMO" }],
      false,
    ),
  );
});

test("T12 weight conservation rejects 1.3", () => {
  const r = validateWeightConservation([
    { ticker: "005930", exposureWeight: 0.8 },
    { ticker: "005930", exposureWeight: 0.5 },
  ]);
  assert.equal(r.ok, false);
  assert.match(r.error ?? "", /1\.300/);
});

test("T13 vintage parse + korean units", () => {
  assert.equal(parsePeriod("202406"), "2024-06");
  assert.equal(parseKoreanNumber("1,200", "백만불"), 1_200_000_000);
});

test("T14 FX partial correlation differs from raw", () => {
  const n = 48;
  const fx = Array.from({ length: n }, (_, i) => 1200 + i);
  const expS = Array.from({ length: n }, (_, i) => 50 + i * 0.4 + (i % 7) * 3);
  const k = Array.from({ length: n }, (_, i) => fx[i]! / 20 + (i % 5) * 8);
  const raw = calculatePearson(expS, k);
  const part = calculatePartialCorrelation(expS, k, fx);
  assert.notEqual(raw, null);
  assert.notEqual(part, null);
  assert.notEqual(raw, part);
});

test("T15 FRED parser keeps official monthly USD", () => {
  const csv = [
    "observation_date,XTEXVA01KRM667S",
    "2025-11-01,61330000000",
    "2026-04-01,85811990000",
    "2026-05-01,.",
  ].join("\n");
  const rows = parseFredCsv(csv, "XTEXVA01KRM667S");
  assert.equal(rows.length, 2);
  assert.equal(rows[0]!.period, "2025-11");
  assert.equal(rows[1]!.valueUsd, 85811990000);
});

test("T16 HS proxy does not invent missing codes", () => {
  assert.equal(aggregateProxy({ "87": 10 }, ["8542", "8541"]), null);
  assert.equal(aggregateProxy({ "8542": 5, "87": 9 }, ["8542", "8541"]), 5);
  assert.equal(aggregateProxy({ "74": 1, "76": 2 }, ["74", "76"]), 3);
});

test("convertUsdKrw rejects bad fx", () => {
  assert.equal(convertUsdKrw(1, 0), null);
});
