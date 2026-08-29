import assert from "node:assert/strict";
import { test } from "node:test";
import {
  inferSectorId,
  looksLikeEtf,
  normalizeKrTicker,
  isDigitTicker,
  isAlphanumericTicker,
  shouldRouteToEtf,
} from "./infer-sector.ts";

test("normalizeKrTicker never strips letters from 0226A0", () => {
  assert.equal(normalizeKrTicker("0226A0"), "0226A0");
  assert.equal(normalizeKrTicker("0226a0"), "0226A0");
  assert.equal(normalizeKrTicker("5930"), "005930");
  assert.equal(normalizeKrTicker("005930"), "005930");
  assert.ok(isAlphanumericTicker("0226A0"));
  assert.ok(isDigitTicker("005930"));
  assert.equal(isDigitTicker("0226A0"), false);
});

test("looksLikeEtf does not match Soulbrain / 솔브레인", () => {
  assert.equal(looksLikeEtf("357780", "솔브레인"), false);
  assert.equal(looksLikeEtf("357780", "Soulbrain"), false);
  assert.equal(looksLikeEtf("069500", "KODEX 200"), true);
  assert.equal(looksLikeEtf("069500", "TIGER 2차전지"), true);
  assert.equal(looksLikeEtf("0226A0"), true);
  assert.equal(shouldRouteToEtf("069500", "KODEX 200"), true);
  assert.equal(shouldRouteToEtf("005930", "삼성전자"), false);
  assert.equal(shouldRouteToEtf("005930", "삼성전자", true), true);
});

test("inferSectorId matches coverage-universe names", () => {
  assert.equal(inferSectorId("삼성전자"), "semiconductors");
  assert.equal(inferSectorId("SK하이닉스"), "semiconductors");
  assert.equal(inferSectorId("DB하이텍"), "semiconductors");
  assert.equal(inferSectorId("레인보우로보틱스"), "robotics");
  assert.equal(inferSectorId("두산로보틱스"), "robotics");
  assert.equal(inferSectorId("한국콜마"), "consumer");
  assert.equal(inferSectorId("CJ"), "consumer");
  assert.equal(inferSectorId("효성중공업"), "energy");
  assert.equal(inferSectorId("포스코퓨처엠"), "battery");
  assert.equal(inferSectorId("POSCO홀딩스"), "steel");
  assert.equal(inferSectorId("LG화학"), "chemicals");
  assert.equal(inferSectorId("NAVER"), "telecom");
  assert.equal(inferSectorId("HD한국조선해양"), "shipbuilding");
  assert.equal(inferSectorId("풍산"), "defense");
  assert.equal(inferSectorId("S-Oil"), "energy");
  assert.equal(inferSectorId("에쓰오일"), "energy");
});
