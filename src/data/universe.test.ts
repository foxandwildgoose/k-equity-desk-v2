import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { seedWeight, validateWeightConservation } from "../lib/export-desk/exposure.ts";
import type { ProvisionalTier } from "../lib/export-desk/exposure.ts";

const dir = dirname(fileURLToPath(import.meta.url));

function parseUniverse(): { code: string; sectorId: string }[] {
  const src = readFileSync(join(dir, "universe.ts"), "utf8");
  const rows: { code: string; sectorId: string }[] = [];
  const re =
    /code: "(\d{6})"[^}]*sectorId: "([a-z-]+)"/g;
  for (const m of src.matchAll(re)) {
    rows.push({ code: m[1]!, sectorId: m[2]! });
  }
  return rows;
}

test("universe codes are unique 6-digit tickers", () => {
  const rows = parseUniverse();
  const codes = rows.map((u) => u.code);
  assert.ok(codes.length >= 120);
  assert.equal(codes.length, new Set(codes).size);
});

test("export-desk seed tickers exist in universe and weights conserve", () => {
  const seed = JSON.parse(
    readFileSync(join(dir, "export-desk/exposureSeed.config.json"), "utf8"),
  ) as {
    links: { ticker: string; tier: ProvisionalTier }[];
  };
  const inUniverse = new Set(parseUniverse().map((u) => u.code));
  for (const row of seed.links) {
    assert.ok(inUniverse.has(row.ticker), `missing universe row for ${row.ticker}`);
  }
  const check = validateWeightConservation(
    seed.links.map((l) => ({ ticker: l.ticker, exposureWeight: seedWeight(l.tier) })),
  );
  assert.equal(check.ok, true, check.error);
});

test("POSCO Holdings is steel; LG Chem is chemicals; CJ is consumer", () => {
  const by = Object.fromEntries(parseUniverse().map((u) => [u.code, u]));
  assert.equal(by["005490"]?.sectorId, "steel");
  assert.equal(by["051910"]?.sectorId, "chemicals");
  assert.equal(by["001040"]?.sectorId, "consumer");
  assert.equal(by["000990"]?.sectorId, "semiconductors");
  assert.equal(by["161890"]?.sectorId, "consumer");
});
