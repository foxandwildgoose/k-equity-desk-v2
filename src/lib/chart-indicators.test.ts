import assert from "node:assert/strict";
import { test } from "node:test";
import {
  classifySwingDivergence,
  closePercentile,
  compareBollingerAndPercentile,
  computeRangePosition,
  computeSeriesRangePosition,
  detectMacdCrosses,
  detectRsiDivergences,
  disparity,
  findPivots,
  quantSnapshot,
  rollingPercentileBands,
  stochastic,
} from "./chart-indicators.ts";

function bar(high: number, low: number, close: number, date: string) {
  return { high, low, close, date };
}

test("findPivots marks isolated swing high and low", () => {
  const highs = [10, 12, 18, 12, 11, 10, 11];
  const lows = [9, 10, 12, 10, 8, 9, 10];
  const p = findPivots(highs, lows, 2, 2);
  assert.deepEqual(p.highIdx, [2]);
  assert.deepEqual(p.lowIdx, [4]);
});

test("computeRangePosition: at period high, high-drawdown is 0 and low-rally is positive", () => {
  const bars = [
    bar(100, 80, 90, "2026-01-01"),
    bar(110, 85, 100, "2026-01-02"),
    bar(140, 100, 140, "2026-01-03"),
  ];
  const s = computeRangePosition(bars);
  assert.ok(s);
  assert.equal(s.periodHigh, 140);
  assert.equal(s.periodLow, 80);
  assert.equal(s.fromPeriodHighPct, 0);
  assert.equal(s.fromPeriodLowPct, ((140 - 80) / 80) * 100);
});

test("computeRangePosition: at period low, rally from low is 0", () => {
  const bars = [
    bar(120, 100, 110, "2026-01-01"),
    bar(110, 70, 70, "2026-01-02"),
  ];
  const s = computeRangePosition(bars);
  assert.ok(s);
  assert.equal(s.periodLow, 70);
  assert.equal(s.fromPeriodLowPct, 0);
  assert.ok(s.fromPeriodHighPct < 0);
});

test("recent swing high is the last confirmed pivot, not an unconfirmed new high", () => {
  // Swing high at idx 4 (18), pullback, then unconfirmed new high on last bars.
  const highs = [10, 12, 14, 16, 18, 16, 14, 12, 15, 17, 19, 21, 22];
  const lows = [9, 11, 13, 15, 17, 15, 13, 11, 14, 16, 18, 20, 21];
  const closes = [10, 12, 14, 16, 17, 15, 13, 12, 15, 17, 19, 21, 22];
  const bars = highs.map((h, i) =>
    bar(h, lows[i]!, closes[i]!, `2026-01-${String(i + 1).padStart(2, "0")}`),
  );
  const s = computeRangePosition(bars, { pivotLeft: 2, pivotRight: 2 });
  assert.ok(s);
  assert.equal(s.periodHigh, 22);
  assert.equal(s.periodHighIdx, 12);
  assert.equal(s.recentHigh, 18);
  assert.equal(s.recentHighIdx, 4);
  assert.equal(s.fromPeriodHighPct, 0);
  assert.ok(Math.abs(s.fromRecentHighPct - ((22 - 18) / 18) * 100) < 1e-9);
});

test("visible slice [from,to] uses only that window for extrema", () => {
  const bars = [
    bar(50, 40, 45, "2026-01-01"),
    bar(80, 60, 70, "2026-01-02"),
    bar(90, 70, 85, "2026-01-03"),
    bar(200, 90, 180, "2026-01-04"),
  ];
  const s = computeRangePosition(bars, { from: 0, to: 2, close: 180 });
  assert.ok(s);
  assert.equal(s.periodHigh, 90);
  assert.equal(s.periodLow, 40);
  assert.ok(s.fromPeriodHighPct > 0);
});

test("empty or invalid bars return null", () => {
  assert.equal(computeRangePosition([]), null);
  assert.equal(computeRangePosition([bar(0, 0, 0, "2026-01-01")]), null);
});

test("computeSeriesRangePosition maps a line onto the same stats", () => {
  const s = computeSeriesRangePosition([
    { value: 100, date: "2026-01-01" },
    { value: 80, date: "2026-01-02" },
    { value: 120, date: "2026-01-03" },
  ]);
  assert.ok(s);
  assert.equal(s.periodHigh, 120);
  assert.equal(s.periodLow, 80);
  assert.equal(s.fromPeriodHighPct, 0);
  assert.equal(s.fromPeriodLowPct, 50);
});

test("rolling percentile bands stay inside the window and do not use the future", () => {
  const values = Array.from({ length: 30 }, (_, i) => i + 1);
  const bands = rollingPercentileBands(values, 20);
  assert.equal(bands.p50[18], null);
  assert.ok(bands.p50[19] != null);
  assert.ok(bands.p10[29]! < bands.p50[29]! && bands.p50[29]! < bands.p90[29]!);
  const early = rollingPercentileBands(values.slice(0, 20), 20);
  assert.equal(early.p50[19], bands.p50[19]);
});

test("disparity is 100 on a flat series and stochastic is 100 at the high", () => {
  const flat = Array.from({ length: 25 }, () => 10);
  const disp = disparity(flat, 20);
  assert.equal(disp[19], 100);
  const highs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const lows = highs.map((n) => n - 1);
  const closes = highs.slice();
  const st = stochastic(highs, lows, closes, 5, 3);
  assert.equal(st.k[13], 100);
});

test("quant snapshot reports drawdown from the peak and a full-sample percentile", () => {
  const bars = [
    { high: 10, low: 9, close: 10 },
    { high: 12, low: 10, close: 12 },
    { high: 11, low: 8, close: 8 },
    { high: 9, low: 7, close: 9 },
    { high: 10, low: 8, close: 10 },
    { high: 11, low: 9, close: 11 },
    { high: 12, low: 10, close: 12 },
    { high: 13, low: 11, close: 12 },
  ];
  const snap = quantSnapshot(bars, 252);
  assert.ok(snap);
  assert.equal(snap!.currentDrawdownPct, 0);
  assert.ok(snap!.maxDrawdownPct < 0);
  assert.ok(Math.abs(snap!.maxDrawdownPct - ((8 - 12) / 12) * 100) < 1e-9);
  assert.equal(closePercentile(bars.map((b) => b.close)), 100);
});

test("bollinger percent-b and the longer percentile rank can disagree", () => {
  const calm = Array.from({ length: 40 }, () => 10);
  const spike = compareBollingerAndPercentile([...calm, 30], 20, 2, 120);
  assert.ok(spike);
  assert.ok(spike.percentB != null && spike.percentB > 1);
  assert.equal(spike.pctRank, 100);
  assert.match(spike.note, /같이 위에/);

  const mixed = compareBollingerAndPercentile(
    [...Array.from({ length: 100 }, () => 50), ...Array.from({ length: 19 }, () => 10), 30],
    20,
    2,
    120,
  );
  assert.ok(mixed);
  assert.ok(mixed.percentB != null && mixed.percentB > 1);
  assert.ok(mixed.pctRank != null && mixed.pctRank < 90);
  assert.match(mixed.note, /어긋난/);
});

test("swing divergence ignores ties and classifies both regular and hidden", () => {
  assert.equal(classifySwingDivergence("low", 10, 9, 20, 35), "regular-bullish");
  assert.equal(classifySwingDivergence("low", 10, 12, 40, 25), "hidden-bullish");
  assert.equal(classifySwingDivergence("high", 10, 12, 70, 55), "regular-bearish");
  assert.equal(classifySwingDivergence("high", 12, 10, 55, 70), "hidden-bearish");
  assert.equal(classifySwingDivergence("low", 10, 10, 20, 30), null);
  assert.equal(classifySwingDivergence("high", 10, 12, 40, 40), null);
});

test("RSI divergence uses only confirmed pivots and the latest pair", () => {
  const closes: number[] = [];
  for (let i = 0; i < 14; i++) closes.push(80 + i);
  closes.push(90, 82, 74, 66, 58, 50, 42);
  for (let i = 1; i <= 14; i++) closes.push(42 + i * 4);
  for (let i = 1; i <= 8; i++) closes.push(98 - i * 3);
  closes.push(80, 86, 90, 84, 70, 36);
  for (let i = 1; i <= 8; i++) closes.push(36 + i * 4);
  const highs = closes.map((c) => c + 0.4);
  const lows = closes.slice();
  const found = detectRsiDivergences(highs, lows, closes, {
    rsiPeriod: 14,
    left: 5,
    right: 5,
    maxAge: 40,
  });
  const bull = found.find((item) => item.kind === "regular-bullish");
  assert.ok(bull, `expected regular bullish, got ${found.map((item) => item.kind).join(",")}`);
  assert.ok(bull.price2 < bull.price1);
  assert.ok(bull.rsi2 > bull.rsi1);
  assert.ok(closes.length - 1 - bull.i2 <= 40);
});

test("MACD golden cross is the bar the MACD line rises through the signal", () => {
  const closes: number[] = [];
  for (let i = 0; i < 60; i++) closes.push(100);
  for (let i = 0; i < 15; i++) closes.push(100 - i * 2);
  for (let i = 0; i < 20; i++) closes.push(70 + i * 2);
  const crosses = detectMacdCrosses(closes, { maxAge: 40 });
  const golden = crosses.find((item) => item.kind === "golden");
  assert.ok(golden, `expected golden, got ${crosses.map((item) => item.kind).join(",")}`);
  assert.ok(golden.index >= 75);
  assert.ok(golden.macd > golden.signal);
  assert.equal(golden.belowZero, true);
});

test("hidden bullish is a higher price low with a lower RSI", () => {
  const closes: number[] = [];
  for (let i = 0; i < 15; i++) closes.push(100 + i);
  closes.push(112, 110, 108, 109, 111, 116, 122, 128, 134);
  closes.push(128, 120, 112, 114, 118, 124, 130, 136);
  const highs = closes.map((c) => c + 0.3);
  const lows = closes.slice();
  const found = detectRsiDivergences(highs, lows, closes, {
    rsiPeriod: 14,
    left: 3,
    right: 3,
    maxAge: 80,
  });
  const hidden = found.find((item) => item.kind === "hidden-bullish");
  assert.ok(hidden, `expected hidden bullish, got ${found.map((item) => item.kind).join(",") || "none"}`);
  assert.ok(hidden.price2 > hidden.price1);
  assert.ok(hidden.rsi2 < hidden.rsi1);
});
