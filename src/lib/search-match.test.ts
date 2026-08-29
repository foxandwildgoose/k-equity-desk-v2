import assert from "node:assert/strict";
import { test } from "node:test";
import {
  matchesSearchQuery,
  scoreSearchHit,
  tokenMatchesFields,
} from "./search-match.ts";

test("alphanumeric ETF codes do not collide with digit-stripped stocks", () => {
  assert.equal(scoreSearchHit("0226A0", "KODEX 반도체", "0226A0"), 200);
  assert.ok(scoreSearchHit("0226A0", "현대차", "002260") < 90);
  assert.equal(tokenMatchesFields("0226A0", ["002260"]), false);
  assert.equal(tokenMatchesFields("0226A0", ["0226A0"]), true);
  assert.equal(matchesSearchQuery("0226A0", ["002260", "현대차"]), false);
  assert.equal(matchesSearchQuery("0226A0", ["0226A0", "KODEX 반도체"]), true);
});

test("single-token SOL does not match Soulbrain", () => {
  assert.equal(matchesSearchQuery("SOL", ["솔브레인", "Soulbrain", "357780"]), false);
  assert.equal(matchesSearchQuery("SOL", ["SOL 미국S&P500", "438850"]), true);
});
