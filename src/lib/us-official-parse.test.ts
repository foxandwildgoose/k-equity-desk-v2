import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  factLines,
  filingArchiveUrl,
  framedQuarterlyFacts,
  parseBeaSchedule,
  parseBeigeIndex,
  parseFomcCalendar,
  parseForm4Owner,
  priorFact,
  tradesFromLines,
} from "./us-official-parse.ts";

const FOMC = `
<h4><a id="1">2026 FOMC Meetings</a></h4>
<div class="fomc-meeting__month"><strong>September</strong></div>
<div class="fomc-meeting__date">15-16*</div>
<a href="/newsevents/pressreleases/monetary20260916a.htm">HTML</a>
<a href="/monetarypolicy/files/monetary20260916a1.pdf">PDF</a>
<a href="/monetarypolicy/fomcminutes20260916.htm">HTML</a>
<div class="fomc-meeting__month"><strong>October</strong></div>
<div class="fomc-meeting__date">27-28</div>
<h4><a id="2">2025 FOMC Meetings</a></h4>
<div class="fomc-meeting__month"><strong>January</strong></div>
<div class="fomc-meeting__date">28-29</div>
`;

describe("official research parsers", () => {
  it("parses FOMC meetings without inventing missing links", () => {
    const rows = parseFomcCalendar(FOMC);
    const sept = rows.find((r) => r.iso === "2026-09-16");
    assert.ok(sept);
    assert.equal(sept?.links.some((l) => l.kind === "statement-html"), true);
    assert.equal(sept?.links.some((l) => l.kind === "statement-pdf"), true);
    assert.equal(sept?.links.some((l) => l.kind === "minutes-html"), true);
    const oct = rows.find((r) => r.month === "October" && r.year === 2026);
    assert.ok(oct);
    assert.equal(oct?.links.length, 0);
    assert.equal(oct?.iso, "2026-10-28");
    assert.equal(rows.some((r) => r.year === 2025 && r.month === "January"), true);
  });

  it("parses beige rows and leaves unlinked dates as scheduled", () => {
    const html = `<th id="year">2026</th><td>September 2: <a href="/monetarypolicy/beigebook202608-summary.htm">HTML</a> | <a href="/monetarypolicy/files/BeigeBook_20260902.pdf">PDF</a></td><td>October 14</td>`;
    const rows = parseBeigeIndex(html);
    assert.equal(rows[0]?.iso, "2026-09-02");
    assert.match(rows[0]?.htmlUrl ?? "", /beigebook202608-summary\.htm/);
    assert.equal(rows[1]?.scheduledOnly, true);
    assert.equal(rows[1]?.htmlUrl, null);
  });

  it("parses a BEA schedule row only from the year heading", () => {
    const html = `<th>Year 2026</th><div class="release-date">September 30</div><small class="text-muted">8:30 AM</small><td class="release-title">GDP (Third Estimate), 2nd Quarter 2026</td>`;
    const rows = parseBeaSchedule(html);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.iso, "2026-09-30");
    assert.equal(rows[0]?.timeLabel, "8:30 AM");
    assert.match(rows[0]?.title ?? "", /Third Estimate/);
  });

  it("keeps only framed quarterly XBRL facts", () => {
    const facts = framedQuarterlyFacts([
      { end: "2026-07-26", start: "2026-01-26", val: 177, fp: "Q2", fy: 2027, form: "10-Q", frame: undefined, accn: "a" },
      { end: "2026-07-26", start: "2026-04-27", val: 96, fp: "Q2", fy: 2027, form: "10-Q", frame: "CY2026Q2", accn: "a", filed: "2026-08-26" },
      { end: "2025-07-27", start: "2025-04-28", val: 40, fp: "Q2", fy: 2026, form: "10-Q", frame: "CY2025Q2", accn: "b", filed: "2025-08-27" },
    ]);
    assert.equal(facts.length, 2);
    assert.equal(facts[1]?.val, 96);
    const prior = priorFact(facts, facts[1]!);
    assert.equal(prior?.val, 40);
  });

  it("builds an EDGAR archive URL from the accession and refuses traversal", () => {
    assert.equal(
      filingArchiveUrl("0001045810-26-000075", "nvda-20260726.htm"),
      "https://www.sec.gov/Archives/edgar/data/1045810/000104581026000075/nvda-20260726.htm",
    );
    assert.equal(filingArchiveUrl("0001045810-26-000075", "../evil.htm"), null);
  });

  it("reads a Form 4 owner and printed sale rows", () => {
    const html = `<a href="/cgi-bin/browse-edgar?action=getcompany&CIK=0001696841">Teter Timothy S.</a>`;
    assert.equal(parseForm4Owner(html), "Teter Timothy S.");
    const trades = tradesFromLines([
      "Date of Earliest Transaction",
      "09/21/2026",
      "Common Stock",
      "09/21/2026",
      "S",
      "12,483",
      "D",
      "222.1932",
    ]);
    assert.equal(trades.length, 1);
    assert.match(trades[0] ?? "", /transaction code S/);
    assert.match(trades[0] ?? "", /12,483/);
    assert.match(trades[0] ?? "", /222\.1932/);
  });

  it("does not keep boilerplate as a summary line", () => {
    const lines = factLines([
      "An official website of the United States government. This line is long enough to otherwise qualify as a bullet.",
      "The Committee decided to raise the target range for the federal funds rate by 1/4 percentage point to 3-3/4 to 4 percent.",
    ]);
    assert.equal(lines.length, 1);
    assert.match(lines[0] ?? "", /target range/);
  });
});
