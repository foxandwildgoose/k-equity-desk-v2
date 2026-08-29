# Korea Export × KOSPI Intelligence Desk — Grok Build Master Prompt v3.0 (ALL-IN-ONE)

> **How to use:** select this entire file from the line below (`===== PROMPT START =====`)
> down to `===== PROMPT END =====` and paste it into Grok Build in one go.
> Nothing needs to be edited, assembled, or filled in first.

---

===== PROMPT START =====

You are an elite quantitative equity strategist, trade-statistics data engineer, and senior full-stack developer specializing in South Korean capital markets, Korea Customs Service trade data, KRX market data, and institutional-grade financial visualization.

I have an existing Korean stock-investment dashboard built in Grok Build. **Extend it — do not replace it.** Add one new production module:

# Korea Export × KOSPI Intelligence Desk

The module must show how South Korea's aggregate and industry-level export performance relates to the KOSPI index and to the share prices of **the KOSPI Top-100 companies that genuinely belong to each export industry**.

Before writing any code, read Sections 0 through 3. They are the contract. Everything after that is the specification.

---

## SECTION 0 — BUILD INTEGRITY PROTOCOL (READ FIRST)

This module is large. Most failures on a spec this size come from the builder trying to emit everything at once, truncating, and leaving a project that does not compile. Prevent that as follows.

**0.1 — Runtime tier detection.** Before generating code, determine which runtime this environment actually supports and state your choice in one line at the top of your output:

- **Tier A (preferred):** server-side code + a persistent database + scheduled jobs are available. Build the full pipeline.
- **Tier B (fallback):** browser-only runtime, no server, no cron. Build with IndexedDB as the local store, a file-import ingestion path, and a manual "Refresh data" action instead of cron.

**Never** silently generate a Tier-A monorepo (DB migrations, cron workers, `.env` server secrets) into a Tier-B runtime. If you are unsure, build Tier B first and structure the data layer so a Tier-A backend can be dropped in behind the same interface.

**0.2 — Phase gates.** Build in this order and make each gate independently runnable before moving on:

| Gate | Deliverable | Must be true before you continue |
|---|---|---|
| G1 | Data layer + Total Exports × KOSPI chart | App compiles, loads, and renders one real chart from imported/seeded data |
| G2 | Taxonomy engine + All Export Industries explorer | Every export category with non-zero value is enumerable and searchable |
| G3 | Point-in-time KOSPI Top-100 engine + company↔industry map | Sector pages show correctly filtered company sets |
| G4 | Statistics, lead/lag, signal layer, QA panel | All acceptance tests in Section 20 pass |

**0.3 — No stubs in shipped code.** Do not emit `// TODO`, `// implement later`, `throw new Error("not implemented")`, or a component that returns placeholder text, in any file you present as complete. If you are approaching an output limit, **finish the current file cleanly**, then state exactly: `NEXT FILE: <path>` and what it must contain. A smaller set of working files beats a larger set of broken ones.

**0.4 — Self-check before you declare done.** Print a checklist confirming: (a) the app builds, (b) no unresolved imports, (c) every chart has a data source and a fallback empty state, (d) no synthetic number appears outside DEMO MODE, (e) each acceptance test in Section 20 has a corresponding test file.

---

## SECTION 1 — NON-NEGOTIABLE PRINCIPLES

1. Preserve the existing app's navigation, layout system, theme tokens, state management, auth, and unrelated modules. Add this as a new section and reuse existing components where sensible.
2. **Never fabricate a number.** Do not invent export values, market caps, MTI code numbers, API responses, correlation results, or Top-100 membership. If a value is unknown, render `N/A` with a reason.
3. Synthetic data is permitted **only** behind an explicit `DEMO MODE` flag that paints a persistent banner across the viewport. Production mode never shows a synthetic number.
4. Every chart, card, and table exposes: source, latest observation period, publication/ingestion timestamp, revision status, taxonomy version, and mapping confidence where applicable.
5. All membership and mapping data is **date-aware**: every record carries `effectiveFrom` / `effectiveTo`, and every historical query resolves against the values valid on that date.
6. Default UI language Korean, with an English toggle. Use an i18n key map (`t('export.total.title')`), never hard-coded bilingual strings scattered through components.
7. Every statistical function is a pure, exported, unit-tested utility. No math inline inside a chart component.
8. All API keys live server-side (Tier A) or in a user-entered local settings store never bundled into source (Tier B). Never commit a key.

---

## SECTION 2 — DUAL-TRACK DATA INGESTION (THE MOST IMPORTANT DESIGN DECISION)

Korean public data APIs require per-service key registration, are frequently blocked by CORS from a browser, and rate-limit aggressively. A build that depends on live API keys will ship as an empty shell.

Therefore implement **two ingestion tracks behind one interface**, and make Track F work first.

### Track F — File Import (must work on day one, zero credentials)

Build a first-class **Data Import** screen that accepts CSV/XLSX files the user downloads manually from official portals, parses them, validates them, and writes them into the store.

Required importers, each with column auto-detection, a preview table, a validation report, and idempotent upsert:

| Importer | Expected source | Target table |
|---|---|---|
| `MTI_MONTHLY_EXPORT` | KITA K-stat → 품목 수출입 (MTI, monthly, by category) | `trade_observation` |
| `HS_MONTHLY_EXPORT` | Customs / K-stat HS 2·4·6·10-digit monthly | `trade_observation` |
| `MTI_TAXONOMY` | K-stat hierarchical item-code list (HSK / MTI / SITC) | `trade_taxonomy` |
| `HSK_MTI_CROSSWALK` | KITA HSK–MTI linkage table | `hsk_mti_crosswalk` |
| `REGIONAL_EXPORT` | Customs 시도별 / 시도별 품목별 실적 | `trade_observation` (geo-scoped) |
| `KOSPI_INDEX_DAILY` | KRX index daily series | `market_index_daily` |
| `KOSPI_STOCK_DAILY` | KRX daily trading data (price + market cap + shares) | `stock_price_daily` |
| `LISTED_SECURITY_MASTER` | KRX / FSC listed-security master | `security_master` |
| `FX_USDKRW_DAILY` | Bank of Korea / official FX series | `fx_daily` |

Rules for Track F:
- Accept both Korean and English header rows; keep a per-importer alias map for column names.
- Handle Korean number formatting (thousands separators, `천달러` / `백만불` / `억달러` unit headers) and normalize to a single stored unit (USD, unrounded).
- Detect the period column in any of `YYYYMM`, `YYYY-MM`, `YYYY.MM`, `YYYY년 M월`.
- Reject a file with a clear error rather than importing partial garbage; show row-level validation failures.
- Store the original filename, sheet name, row count, and import timestamp in `data_ingestion_log`.
- Provide an **Export Store** action that dumps the whole store back to JSON so the user can re-seed after a reset.

### Track A — Live API adapters (optional, key-gated)

Implement a `DataSourceAdapter` interface and one isolated module per source. Every source is declared in a single config file, never hard-coded into components:

```ts
interface DataSourceDefinition {
  id: string;
  displayName: string;
  operator: string;                    // e.g. 'Korea Customs Service', 'KRX'
  portal: string;                      // registration/portal URL
  baseUrl: string;                     // from config, never hard-coded in a component
  authMode: 'SERVICE_KEY_QUERY' | 'HEADER_TOKEN' | 'NONE';
  classification: 'HS' | 'HSK' | 'MTI' | 'NONE';
  geographyLevel: 'NATIONAL' | 'SIDO' | 'SIGUNGU' | 'CUSTOMS_OFFICE' | 'COUNTRY' | 'ECONOMIC_BLOC';
  cadence: 'DAILY' | 'MONTHLY';
  status: 'CONFIGURED' | 'KEY_MISSING' | 'UNVERIFIED' | 'FAILING';
}
```

Seed the registry with the sources listed in Section 3. Build a **Source Health** panel that lets the user paste a key, run a live connection test against one known-good request, and see pass/fail with the raw error. Until a source passes its connection test its `status` is `UNVERIFIED` and the UI must not present its data as live.

**Endpoint discipline:** you may not invent request paths or parameter names. For any source whose exact request schema you cannot confirm, generate the adapter against the normalized internal schema, put the request builder in one clearly-marked function, and surface an `Endpoint not verified — configure in Settings` state. Never ship a fabricated URL as if it were tested.

### The one classification rule that matters

Customs product APIs are **HS/HSK**-based. MTI is a separate MOTIE classification (HSK 10-digit codes are reclassified into MTI 6-digit codes). **Never pass an MTI code into a parameter that expects HS/HSK.** MTI-level series are produced one of two ways only:

1. imported directly from an MTI-native source (K-stat), or
2. aggregated from HSK observations through the versioned `hsk_mti_crosswalk`.

Any MTI series produced by route 2 carries a `derivation: 'AGGREGATED_FROM_HSK'` badge and must be reconciled against the official MTI total before display.

---

## SECTION 3 — OFFICIAL SOURCE REGISTRY (SEED VALUES)

Seed `dataSources.config.ts` with the following. Treat every `baseUrl` as configurable; treat every unverified request path as requiring a connection test before use.

### 3.1 Trade / customs

| id | Source | Notes |
|---|---|---|
| `customs.total` | Korea Customs Service — 수출입총괄 (Public Data Portal dataset 15102108) | national totals |
| `customs.item` | Korea Customs Service — 품목별 수출입실적 (dataset 15101609) | HS 2/4/6/10-digit |
| `customs.item_country` | Korea Customs Service — 품목별 국가별 수출입실적 (dataset 15100475) | verified request path: `http://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList` |
| `customs.country` | 국가별 수출입실적 (dataset 15101612) | |
| `customs.sido` | 시도별 수출입실적 (dataset 15101643) | 17 시도 |
| `customs.sido_item` | 시도별 품목별 수출입실적 (dataset 15101641) | region × HS |
| `customs.office` | 세관별 수출입실적 (dataset 15101633) | customs office ≠ production site |
| `customs.bloc` | 경제권별 수출입실적 (dataset 15101632) | APEC/ASEAN/EU/OECD etc. |
| `kita.kstat` | KITA K-stat (`https://stat.kita.net`) | MTI-native; hierarchical code browser at `/stat/kts/statCode/ItemHierCodeList.screen`; HSK–MTI linkage table published by KITA |
| `motie.release` | MOTIE monthly 수출입 동향 press release | authoritative for the 20 major export items and 일평균 수출 |

Registration for the Public Data Portal sources is at `https://www.data.go.kr` (`serviceKey` query parameter, per-dataset approval, development accounts are traffic-capped).

### 3.2 Market data

| id | Source | Notes |
|---|---|---|
| `krx.openapi` | KRX Open API (`https://openapi.krx.co.kr`) | stock daily prices, index daily series, listed-security master; key issued from My Page after per-service application |
| `krx.datasys` | KRX 정보데이터시스템 (`https://data.krx.co.kr`) | manual CSV/XLSX download source for Track F |
| `fsc.listed` | FSC KRX상장종목정보 (Public Data Portal dataset 15094775) | ISIN / security master fallback |
| `bok.fx` | Bank of Korea — USD/KRW daily | required, see Section 9 |

### 3.3 Company business-exposure evidence

Open DART filings (business reports, **segment revenue tables**), IR decks, and product disclosures. These are the only acceptable basis for a company↔industry exposure weight.

**Hard rule:** customs statistics describe *products, quantities, values and destinations*. They do **not** disclose which listed company exported a shipment. The company↔industry link in this module is an explicitly-labelled *analytical exposure map*, never a claim of customs attribution. This wording must appear in the UI provenance drawer.

---

## SECTION 4 — TAXONOMY ENGINE: 20 MAJOR ITEMS + ALL EXPORT INDUSTRIES

### 4.1 The 2026 MTI revision — handle it explicitly

MOTIE revised the MTI classification in 2026, the first full revision in six years. Material facts your implementation must encode as configuration (not as prose in a component):

- The framework of **15 major export items was expanded to 20**, adding 전기기기 (electrical equipment), 비철금속 (non-ferrous metals), 농수산식품 (agri-fishery-food), 화장품 (cosmetics), 생활용품 (household/lifestyle goods).
- Sub-item structure changed: **semiconductors** now separate memory from system semiconductors, with memory further split (DRAM, NAND); **automobiles** separate new from used vehicles; **bio-health** received its own code split into pharmaceuticals and medical devices; **secondary batteries** gained a distinct lithium-ion-battery code and consolidated cathode/electrolyte/separator materials into a single battery-materials code; **textiles** absorbed natural materials, bags and footwear; **steel** moved other steel products and raw/subsidiary materials into "other steel & metal products".
- The revision was **backcast to 2022 onward** by the statistical authorities, and applied to monthly releases from June 2026.
- Scale: roughly 11,000+ HSK 10-digit codes map into roughly 1,200+ MTI 6-digit codes.

Implementation consequences:

1. `trade_taxonomy` carries a `taxonomyVersion` and `effectiveFrom`. Store both the pre-revision and post-revision versions.
2. For periods **2022-01 onward**, use the official backcast series.
3. For periods **before 2022**, either use a documented bridge or render a **visible structural-break marker** on the chart at the boundary with a tooltip explaining it. A "ratio-linked splice" mode is allowed but must be labelled `SPLICED — not an official series`.
4. Never silently extrapolate the revised taxonomy into older periods.
5. Show a taxonomy-version badge on every category page.

### 4.2 Navigation modes

**A. `Total Exports`** — national aggregate.

**B. `20 Major Export Items` (20대 주력품목)** — a pinned, curated investment view. Load the list from `core20.config.json` (provided in the appendix section of this prompt, Section 21) with an `effectiveFrom` date and source reference. **Render whatever is in the config.** Do not hard-code the list into a component, and do not hard-code MTI numeric codes from memory — resolve them from the loaded taxonomy.

**C. `All Export Industries`** — this satisfies the requirement that *every* Korean export field with recorded exports is covered, not just the curated 20.

### 4.3 Depth tiering (this is what makes "all industries" actually buildable)

A flat "one full analytical page per node" design collapses at MTI 6-digit and HSK 10-digit scale, and a KOSPI-company overlay is meaningless for a node like "other miscellaneous preparations". Implement three tiers:

| Tier | Nodes | What renders |
|---|---|---|
| **T1 — Full analysis** | MTI major categories + the 20 major items + any node with an active company mapping | export chart + matched-company stock overlay + correlation + lead/lag + detail tables |
| **T2 — Chart + stats** | MTI 3-digit / 4-digit | export chart (indexed / absolute / growth), full statistics block, link up to the T1 ancestor for company overlay |
| **T3 — Table + sparkline** | MTI 6-digit, HS 4/6, HSK 10 | virtualized data table with sparkline, YoY, share, rank; no company matching |

Rules:
- Enumerate **every** category with non-zero exports in the selected period — completeness is a requirement, depth of analysis is tiered.
- Generate pages dynamically from taxonomy metadata. Never pre-code thousands of chart components.
- Company matching is offered at a node only if a mapping exists at that node or at an ancestor; when inherited, badge it `inherited from <ancestor>`.
- Prevent parent/child double counting in any aggregate card. Aggregations sum leaf nodes only, and the UI states which level was summed.
- Virtualized lists, server-side (or worker-side) search, pagination, lazy chart mount on intersection.

### 4.4 Per-category statistics (all tiers)

Export value, YoY, MoM, 3M momentum (annualized), 3M MA, 12M MA, **12M rolling sum**, share of national total, rank by value, rank by YoY, and — where working-day data is available — **working-day-adjusted daily average export** (일평균 수출), which is the official way Korea normalizes month-length and holiday effects.

---

## SECTION 5 — POINT-IN-TIME KOSPI TOP-100 ENGINE

`KOSPI Top 100` = the top 100 eligible KOSPI common-stock issuers ranked by market capitalization **on the selected ranking date**. It is computed, never stored as a hand-written list.

Requirements:

1. Rank from KRX daily market-cap data.
2. Exclude preferred shares, ETFs, ETNs, REITs-by-default, SPACs, and non-operating vehicles. Make each exclusion a named, toggleable rule so the user can audit it.
3. Consolidate multi-class issuers to the common share; do not let a preferred line occupy a rank slot.
4. Persist a **monthly snapshot** of Top-100 membership in `kospi_top100_snapshot`, plus a snapshot at each month-end.
5. Historical analysis resolves membership as of the historical date. **Never** apply today's list retroactively — that is survivorship bias and it is the single most common way this kind of dashboard produces a fake backtest.
6. Delisted or renamed companies remain in historical analysis where price data exists; maintain a security-identifier history so a ticker change does not sever a series.
7. Display current rank, market cap, primary sector mapping, mapping confidence, and membership effective date.
8. Offer an `Expand to Top 200` toggle. Default stays strict Top 100.

---

## SECTION 6 — COMPANY ↔ EXPORT-INDUSTRY EXPOSURE MAP

This is where the user's core requirement lives: **a semiconductor export chart must show only semiconductor companies. Refiners, banks, insurers, shipbuilders and cosmetics firms must not appear in it.**

### 6.1 Data model

```ts
interface CompanyExportExposure {
  ticker: string;                  // 6-digit KRX code
  companyName: string;
  exportCategoryId: string;        // resolves against trade_taxonomy
  exportCategoryName: string;
  valueChainRole: 'MATERIALS' | 'EQUIPMENT' | 'COMPONENTS' | 'DEVICE_MAKER' | 'DOWNSTREAM' | 'LOGISTICS';
  exposureWeight: number;          // 0.00–1.00, share of consolidated revenue tied to this export category
  mappingConfidence: number;       // 0.00–1.00
  mappingType: 'PRIMARY' | 'SECONDARY' | 'MULTI_SEGMENT';
  verificationStatus: 'VERIFIED_DART' | 'VERIFIED_MANUAL' | 'UNVERIFIED_SEED';
  evidenceSummary: string;
  evidenceSource: string[];        // DART filing ids / URLs
  effectiveFrom: string;
  effectiveTo?: string;
  lastReviewedAt: string;
}
```

### 6.2 The bootstrap problem — and its resolution

A rule that says "never fabricate a mapping" combined with an empty mapping table produces an app where every sector chart is blank. That is the worst possible outcome, and it is the defect this version fixes. Resolve it in three layers:

**Layer 1 — Seed candidate links (shipped, marked unverified).** Section 21 of this prompt contains a seed list of company↔export-category *candidate* links with a qualitative `provisionalExposureTier`. These record only publicly-known lines of business (what a company manufactures), never a numeric revenue claim. Every seed row is written with `verificationStatus: 'UNVERIFIED_SEED'` and renders with an amber "unverified mapping" badge everywhere it appears.

**Layer 2 — Derive real weights.** Implement `deriveExposureFromSegments()` which computes `exposureWeight` from DART segment-revenue disclosures when the user imports or connects them, flipping the row to `VERIFIED_DART` and replacing the provisional tier. Provisional tier → default weight mapping: `PRIMARY → 0.60`, `MATERIAL → 0.30`, `MINOR → 0.10`, each with `mappingConfidence: 0.50` until verified.

**Layer 3 — Admin editor.** Ship a mapping admin screen: search company, add/edit/remove category links, set weight and confidence, attach evidence URL, bulk CSV import/export, full change history. The user's manual edit sets `VERIFIED_MANUAL`.

The seed is a **candidate superset**. It says nothing about market cap or Top-100 membership — that intersection is computed live in Section 5. This is how the module ships functional without inventing market data.

### 6.3 Strict filtering rules

A company appears on a sector chart only if **all** of the following hold:

```
company ∈ point-in-time KOSPI Top 100 (as of the selected ranking date)
AND an active exposure record exists for that category on that date
AND exposureWeight ≥ threshold.weight       (default 0.20)
AND mappingConfidence ≥ threshold.confidence (default 0.70; seeds at 0.50 are excluded by default)
```

Both thresholds are configurable in Settings, and the active threshold is displayed on the chart. Because seed rows default to confidence 0.50, the strict default view shows only verified mappings — with a prominent `N candidate companies hidden pending verification → review` link that opens the admin editor. This keeps the default honest while making the path to a populated chart obvious.

Additional rules:

1. Do **not** map a company to a sector merely because it sits in a broad KRX/GICS industry bucket. Operating exposure is the criterion.
2. Exclude pure holding companies and financials unless a consolidated operating exposure is explicitly modelled, in which case flag `mappingType: 'MULTI_SEGMENT'` and show the look-through basis.
3. **Weight conservation:** a company's `exposureWeight` across all export categories must sum to ≤ 1.00. The remainder is implicit non-export/domestic revenue. Validate this on save and reject violations.
4. **Weighted breadth:** aggregate metrics (matched-company count, breadth of positive returns, sector composite return) must weight by `exposureWeight`, so a conglomerate active in four categories does not count as a full member of each. Show both raw count and exposure-weighted count.
5. If a sector has zero eligible matches, render exactly: `해당 산업에 노출 기준을 충족하는 KOSPI 100대 기업이 없습니다.` Do **not** backfill with lower-ranked or loosely-related companies.
6. Provide a `Primary exposure only` toggle that restricts each company to its single highest-weight category.

### 6.4 Value-chain adjacency

The boundary between an *export product category* and a *company's business* is genuinely fuzzy: semiconductor equipment makers export under machinery, not semiconductors; battery-materials producers export under the battery-materials code, not finished cells. Handle it explicitly rather than pretending it away:

- Each T1 sector page defines a **primary export category** plus an optional ordered set of **adjacent categories**.
- Companies carry `valueChainRole`. The chart legend groups by role (Materials / Equipment / Components / Device makers / Downstream).
- A `Value chain view` toggle expands the chart from the primary category to primary + adjacent, with each added series labelled by its own category.
- Adjacency never silently changes the headline export series. The headline number is always the primary category.

---

## SECTION 7 — LEVEL A: TOTAL EXPORTS × KOSPI

Flagship panel at the top of the module. Title: `대한민국 총수출 × KOSPI`.

### 7.1 Seasonality — do not chart raw monthly exports against KOSPI by default

Korean monthly exports are strongly seasonal (Lunar New Year timing, working-day count, year-end). Plotting the raw monthly level against a smooth index produces a sawtooth that hides the actual relationship. Default series selection:

- **Default level series: 12-month rolling sum of exports** (seasonality removed, trend preserved), indexed to 100 at window start, against KOSPI month-end close indexed to 100 at the same date.
- **Secondary level option:** working-day-adjusted daily-average exports (일평균 수출).
- **Raw monthly** remains available but is labelled `seasonal — for reference`.

### 7.2 Chart modes

1. `Indexed = 100` — default, single normalized axis.
2. `Absolute` — exports (USD bn) on left axis, KOSPI level on right axis.
3. `Growth / Return` — export YoY % and KOSPI monthly log return %.
4. `Export in KRW` — exports converted at monthly average USD/KRW (see Section 9).

Time ranges: 1Y / 3Y / 5Y / 10Y / MAX / custom.

### 7.3 High-frequency panel

Add a separate, clearly-labelled panel for the **1–10 day and 1–20 day preliminary export figures** published intra-month by the customs authority. This is the highest-frequency official read on the export cycle and it is what actually moves Korean equities mid-month. Requirements: plot the same-period YoY of the partial-month figure, mark it `PRELIMINARY / PARTIAL MONTH`, never splice it into the monthly series, and show the working-day count for both the current and comparison period since that alone can flip the sign.

### 7.4 KPI cards

Latest monthly exports; YoY; 3M momentum; 12M rolling sum; working-day-adjusted daily average; KOSPI latest close; KOSPI 1M/3M/12M return; Pearson r; Spearman ρ; best lead/lag; rolling correlation; observation count N; USD/KRW level and YoY.

---

## SECTION 8 — LEVEL B: INDUSTRY EXPORT × MATCHED TOP-100 STOCKS

For every T1 category (the 20 major items and every mapped node), build a reusable industry page.

### 8.1 The mandatory single comparison chart

One primary multi-series chart containing:

- the industry's monthly export series, **and**
- the adjusted price series of **only** the matched point-in-time KOSPI Top-100 companies for that industry.

Default mode `Indexed to 100`: export value and every matched stock rebased to 100 at window start, single normalized Y axis.

### 8.2 Additional modes

1. `Absolute export + one selected stock` — export left axis, adjusted KRW price right axis.
2. `Export growth + stock returns` — sector export YoY vs monthly stock returns.
3. `Relative performance` — stock/KOSPI relative strength lines against export-growth z-score.
4. `Sector index overlay` — add the relevant **KRX/KOSPI sector index** as a reference line. This middle layer between "the whole index" and "one company" materially improves interpretability and is required where a corresponding published sector index exists.

### 8.3 Series handling

1. Interactive legend showing ticker, company name, exposure weight, value-chain role, and verification badge.
2. Toggle individual series; `Show all matched companies` control.
3. If more than 8 companies match, initially render the 8 highest `exposureWeight × marketCap`, but every eligible match must be reachable on the same page without navigation.
4. Above 15 simultaneous series, switch the renderer to canvas and downsample the daily drill-down; keep month-end points exact.
5. Hover tooltip: date, export value, export YoY, stock adjusted price, indexed value, monthly return, exposure weight.
6. Distinct line styles per value-chain role; never rely on color alone.

### 8.4 Industry detail panel (below the chart)

**A. Export statistics** — as listed in Section 4.4.

**B. Company mapping table** — KOSPI rank, ticker, name, market cap, exposure weight, value-chain role, mapping confidence, verification status, mapping type, evidence link, latest return, correlation with sector exports, best lead/lag.

**C. Correlation heatmap** — rows = matched companies; columns = contemporaneous, export leads 1M, export leads 3M, stock leads 1M, stock leads 3M, 24M rolling, 36M rolling. Every cell shows N on hover and greys out below the sufficiency threshold.

---

## SECTION 9 — FX LAYER (MANDATORY, MISSING IN PRIOR VERSIONS)

Exports are reported in USD; KOSPI and Korean share prices are in KRW. USD/KRW commonly moves 10%+ a year and mechanically affects both sides. Ignoring it silently injects a common factor into every correlation in this module.

Requirements:

1. Load a daily USD/KRW series; compute monthly average and month-end.
2. Provide `Export in USD` (default) and `Export in KRW` display toggles, and a `KOSPI in USD` toggle.
3. In the statistics layer, offer **partial correlation controlling for USD/KRW change**, shown side-by-side with the raw correlation. When the two differ by more than 0.15 in absolute terms, surface an explicit note that the relationship is substantially FX-driven.
4. Show USD/KRW as an optional overlay line on Level A.

---

## SECTION 10 — STATISTICAL METHODOLOGY

Naïve level-vs-level correlation between two trending series is spurious. The rules below are not optional polish; they are the difference between a research tool and a misleading one.

### 10.1 Frequency synchronization

Exports are monthly; prices are daily. For every stock and index compute month-end adjusted close, monthly average adjusted close, monthly log return, and 3M/6M forward returns. Month-end adjusted close is the default. **Never** correlate daily price observations against a single monthly export value.

### 10.2 Two alignment modes — point-in-time correctness

Month *M* export data is not public until the following month. Any correlation that pairs month-*M* exports with month-*M* stock returns is look-ahead biased for any trading interpretation. Implement both, and label which is active:

- **`OBSERVATION_TIME`** — align by the month the trade occurred. Correct for economic analysis. Default on the descriptive charts.
- **`RELEASE_TIME`** — align by the month the figure was *published* (using the stored `releaseDate`). Correct for signal and forward-return analysis. **Default in the signal layer and in any forward-return statistic.**

An event-study panel around the monthly release date is a required deliverable: mean abnormal return of matched companies over t-5 to t+10 trading days around publication, versus the surprise sign.

### 10.3 Default variables

Primary: `Export YoY growth` vs `stock monthly log return`.

Secondary: export YoY vs 3M forward return; export YoY vs 6M forward return; 3M export momentum vs stock return; export-growth z-score vs KOSPI-relative return.

**Export surprise (required).** Markets price known trends, so raw YoY is a weak explanatory variable. Compute `exportSurprise = actual − forecast` where the forecast comes from a seasonal-naïve or AR(p) baseline fitted on the trailing window, and expose it as a first-class variable. Document the baseline in the UI.

### 10.4 Inference — this is where most dashboards get it wrong

1. **YoY growth induces MA(12)-type autocorrelation** and 3M/6M forward returns create **overlapping windows**. Both inflate t-statistics badly. Compute **Newey–West (HAC) standard errors** with a lag length of at least the overlap horizon, and report them instead of naïve ones. Where HAC is used, say so on the panel.
2. Report Pearson r, Spearman ρ, N, HAC-adjusted p-value, and rolling 24M/36M correlations.
3. Sufficiency gates: `N < 24` → render `Insufficient data`, no coefficient; `24 ≤ N < 36` → show with a low-confidence flag; `N ≥ 36` → normal. Never show a strong/weak verbal label without N attached.
4. Run a stationarity check on each input series and warn when a level series is used in a correlation.
5. **Multiple testing:** scanning ~100 companies × 25 lags is ~2,500 tests. Apply Benjamini–Hochberg FDR control across the scan and display both raw and adjusted significance. Never present the single best cell from a large scan as a discovery without the correction.
6. Never describe correlation as causation anywhere in the UI copy.

### 10.5 Lead-lag

Cross-correlation for lags −12…+12 months. State the convention in the UI: `+k = exports lead stock returns by k months`; `−k = stock returns lead exports by k months`. Display best lag, correlation at best lag, N, HAC p-value, and stability of the best lag across rolling windows (a lag that jumps around is noise, and the panel should say so).

---

## SECTION 11 — CORPORATE ACTIONS AND PRICE QUALITY

1. Use adjusted prices for all returns and indexed comparisons.
2. Correct splits, reverse splits, rights issues, spin-offs, mergers, and ticker changes.
3. Maintain security-identifier history so a rename does not break a series.
4. Retain delisted historical Top-100 constituents in historical analysis where data exists.
5. Never backfill a current company identity into a historical period without an identifier bridge.
6. Flag any single-day move beyond ±30% as a suspected unadjusted corporate action and surface it in the data-quality panel rather than charting it silently.

---

## SECTION 12 — REGIONAL EXPORT INTELLIGENCE

Default region = `전국 (National)`. Do **not** assume the user's location or default to any single region.

### 12.1 Capability matrix, not assumptions

```ts
interface RegionalDataCapability {
  sourceId: string;
  geographyLevel: 'SIDO' | 'SIGUNGU' | 'CUSTOMS_OFFICE';
  productClassification: 'MTI' | 'HS' | 'HSK' | 'NATURE' | 'TOTAL_ONLY';
  maxProductDepth: string;
  amountAvailable: boolean;
  quantityAvailable: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  disclosureNotes?: string;
}
```

### 12.2 Known disclosure limits to encode

These are real published restrictions, not hypotheticals — encode them as capability rows so the UI degrades correctly rather than showing a blank chart with no explanation:

- **시·군·구 level, HSK 10-digit item statistics: not disclosed at all** (business-secret protection under customs guidance).
- **시·군·구 level, HS 2/4/6-digit weight/quantity data: not disclosed.** Value may still be available.
- 시·도 level and country level: provided as before.

When a requested combination is unavailable, render `해당 세분류에서는 제공되지 않는 통계입니다` with the reason and the source rule — never synthesize a number, never silently fall back without telling the user, and always offer an explicit one-click fallback to the nearest available granularity.

### 12.3 Administrative boundary versioning

Korean administrative divisions change. A concrete current example your region model must handle: the creation of **전남광주통합특별시**, merging the former 광주광역시 and 전라남도 into a single unit in regional trade statistics. Therefore:

1. Region codes carry `effectiveFrom`/`effectiveTo`.
2. Historical queries resolve against the code set valid in that period.
3. Where a series crosses a boundary reorganization, either present the merged successor consistently across history (labelled as a reconstruction) or mark a structural break. State which you did.
4. Distinguish clearly, in labels and tooltips, between **region of customs declaration**, **production location**, and **customs-office location**. They are not the same thing and conflating them is a common analytical error.

### 12.4 Presets

Offer regional presets (for example, a heavy-industry preset covering automobiles, shipbuilding, petroleum products and petrochemicals) as *optional shortcuts*. Never force one as the default.

---

## SECTION 13 — DATA VINTAGE AND REVISIONS

Korean trade data is revised on a known schedule: customs updates prior months around the 15th of each month, and monthly figures remain provisional until the annual statistics are finalized (for a given year, in February of the year after next). A dashboard that overwrites history silently will show a chart that changes shape between sessions with no explanation.

```ts
interface TradeObservation {
  period: string;                 // YYYY-MM
  categoryId: string;
  taxonomyVersion: string;
  geographyId: string;
  exportUsd: number;
  quantity?: number;
  workingDays?: number;
  source: string;
  releaseDate?: string;           // used by RELEASE_TIME alignment
  revisionStatus: 'PRELIMINARY' | 'FINAL' | 'REVISED' | 'UNKNOWN';
  vintageId: string;              // which publication this value came from
  ingestedAt: string;
}
```

Behavior: keep vintages instead of overwriting; badge preliminary values with `P`; show a revision tooltip when a published month changes, including the prior value and the delta; never mix preliminary and final in one series without disclosure; add a `Vintage` selector so the user can reproduce what the chart looked like as of a past date.

---

## SECTION 14 — PIPELINE AND STORAGE

`Sources (API or file import) → raw tables → validation → taxonomy mapping → curated series → analytics → UI`

Tables: `trade_observation_raw`, `trade_observation`, `trade_taxonomy`, `hsk_mti_crosswalk`, `market_index_daily`, `stock_price_daily`, `kospi_marketcap_daily`, `kospi_top100_snapshot`, `security_master`, `security_identifier_history`, `fx_daily`, `company_export_exposure`, `regional_capability`, `analytics_correlation_monthly`, `data_ingestion_log`, `data_quality_result`.

Tier A scheduling is **source-aware**, never a fixed arbitrary hour: refresh market data after official daily publication; snapshot Top-100 at month end; refresh customs monthlies after the publication and again after the mid-month revision window; refresh taxonomy/crosswalk only on version change.

Reliability requirements: exponential-backoff retry, rate-limit handling, schema validation, idempotent upsert with deduplication, missing-period detection, source health status, stale-data warning, source-aware cache TTL, and an audit log.

Tier B equivalent: same interfaces, IndexedDB store, manual refresh button, and the store-export/import round-trip from Section 2.

---

## SECTION 15 — VALIDATION AND RECONCILIATION

Run before publishing any refresh, and surface results in a Data Quality tab:

1. Sum of category exports vs official national total (where the taxonomy is additive) — report the gap in absolute and %.
2. Reject negative export values.
3. Detect taxonomy-driven discontinuities and month-over-month jumps beyond a configurable z-threshold.
4. Detect missing months and gaps in daily price series across trading days.
5. Assert every company displayed in a sector chart was in the Top 100 on the relevant ranking date.
6. Assert every company displayed has an active, threshold-passing mapping for that date.
7. Assert **no unrelated company appears in a sector chart** — implemented as a positive test, see Section 20.
8. Assert exposure weights sum to ≤ 1.00 per company.
9. Store every result with a timestamp and a pass/warn/fail status.

On failure, display the last validated dataset with a visible warning banner rather than publishing suspicious values.

---

## SECTION 16 — UX AND LAYOUT

Header: `Korea Export × KOSPI Intelligence Desk`.

Global controls: date range; taxonomy mode (`20대 주력 | 전체 MTI | HS 탐색기`); region; universe (`Top 100 | Top 200`); chart mode; currency (`USD | KRW`); alignment (`관측시점 | 발표시점`); correlation window; lag range; revision filter; vintage selector.

Tabs:

1. `총수출 × KOSPI`
2. `20대 주력 수출`
3. `전체 수출 산업`
4. `산업 × KOSPI Top 100`
5. `상관관계 / 선후행`
6. `지역 수출`
7. `데이터 품질 / 출처`
8. `매핑 관리 (Admin)`
9. `데이터 가져오기 (Import)`

Major-item matrix cards show: latest export value, YoY, share, 3M momentum, matched company count (raw and exposure-weighted), strongest matched correlation, best lead/lag, and a verification badge. Clicking opens the T1 detail page.

The All Export Industries explorer needs: search by Korean or English name or code, sort by value / YoY / acceleration / share, hierarchy breadcrumbs, lazy load, watchlist, a `Top-100 매칭 있는 산업만` filter, and a tier badge on every row.

Visual rules: responsive desktop-first with tablet support; dark and light mode; never encode meaning in color alone; accessible tooltips and keyboard navigation; Korean numeric formatting with USD/KRW unit switching; avoid dual axes wherever indexed comparison will do; scrollable searchable legend above 8 series.

---

## SECTION 17 — INVESTMENT SIGNAL LAYER

Optional, clearly labelled analytical rather than predictive. **Must run on `RELEASE_TIME` alignment.**

**Export Momentum Score** — standardized composite of YoY, 3M momentum, 6M momentum, export-share trend, and export surprise.

**Market Confirmation Score** — matched-company 3M relative return vs KOSPI, exposure-weighted breadth of positive returns, rolling export-return correlation, and lead/lag stability.

**Regime labels:** `수출↑ / 주가↑`, `수출↑ / 주가 후행`, `수출 부진 / 주가 선행 회복`, `동반 부진`.

Never render these as buy/sell recommendations. Every score panel carries the sample size, the alignment mode, and a plain-language statement of what the score does not tell you.

---

## SECTION 18 — PERFORMANCE

1. Never fetch every chart on initial load; summary rankings first.
2. Fetch a time series only when its category is selected or its chart scrolls into view.
3. Cache common ranges; memoize correlation results keyed on input hash.
4. Server-side (or worker) aggregation for large scans; do not compute a 100×25 correlation grid on the UI thread.
5. Virtualize the taxonomy explorer.
6. Precompute standard monthly analytics after each refresh into `analytics_correlation_monthly`.
7. Target: first meaningful chart under 2 seconds on cached data; taxonomy explorer scroll at 60fps with 10,000+ rows.

---

## SECTION 19 — REQUIRED COMPONENTS AND UTILITIES

```tsx
<ExportKospiOverview />          <HighFrequencyExportPanel />
<Core20ExportMatrix />           <AllExportIndustryExplorer />
<IndustryExportStockChart />     <ValueChainToggle />
<KospiTop100UniverseTable />     <CompanyExposureTable />
<ExposureMappingAdmin />         <CorrelationHeatmap />
<LeadLagPanel />                 <ReleaseEventStudyPanel />
<RegionalExportPanel />          <FxOverlayControl />
<DataImportWizard />             <SourceHealthPanel />
<DataQualityPanel />             <VintageSelector />
<DataFreshnessBadge />           <SourceProvenanceDrawer />
```

```ts
normalizeToBase100()          resampleDailyToMonthEnd()
calculateLogReturns()         calculateYoYGrowth()
calculateRolling12MSum()      calculateWorkingDayAdjusted()
calculateMomentum()           calculateZScore()
calculatePearson()            calculateSpearman()
calculatePartialCorrelation() calculateRollingCorrelation()
calculateCrossCorrelation()   calculateForwardReturn()
neweyWestStandardError()      benjaminiHochbergFDR()
testStationarity()            calculateExportSurprise()
applyCorporateActionAdjustment()
rankKospiByMarketCap()        resolvePointInTimeTop100()
resolveCompanySectorExposure() deriveExposureFromSegments()
aggregateHskToMti()           validateTradeTotals()
alignByReleaseDate()          convertUsdKrw()
```

Every function in the second block ships with unit tests including a hand-computed fixture.

---

## SECTION 20 — ACCEPTANCE TESTS (WRITE THESE AS EXECUTABLE TESTS)

Each item below must exist as a runnable test file, not a description.

- **T1 — National chart.** Total exports and KOSPI render synchronized by month with Indexed / Absolute / Growth modes, and the default level series is the 12M rolling sum.
- **T2 — Semiconductor strict matching.** Given a fixture universe containing semiconductor, refining, banking, shipbuilding and cosmetics companies, the semiconductor sector chart returns **only** the semiconductor-exposed subset. Assert the returned ticker set equals the expected set exactly — not a subset check.
- **T3 — Petroleum strict matching.** The petroleum-products chart excludes petrochemical-only and semiconductor companies unless a documented petroleum-products exposure exists in the fixture.
- **T4 — Point-in-time membership.** With a fixture where company X was Top-100 in 2019 but not in 2026, a 2019 window includes X and a 2026 window excludes it. Assert today's list is never applied to the historical window.
- **T5 — Completeness.** `All Export Industries` enumerates every non-zero category in the fixture, not only the curated 20, and drills from major category to the deepest available level.
- **T6 — No MTI-into-HS misuse.** Assert that no adapter sends an MTI code to an HS/HSK parameter, and that any MTI series derived from HSK carries the `AGGREGATED_FROM_HSK` flag.
- **T7 — Statistical integrity.** The primary correlation path uses stationary transforms; assert HAC standard errors are applied when the input uses YoY or overlapping forward returns.
- **T8 — Sufficiency gate.** With N = 20 the UI renders `Insufficient data` and no coefficient.
- **T9 — Regional integrity.** Requesting 시군구 × HSK-10 returns the unavailable state with a reason; no number is synthesized.
- **T10 — Provenance.** Every chart exposes source, period, ingestion timestamp, and taxonomy version.
- **T11 — Demo isolation.** With DEMO MODE off, no synthetic value can reach a component; assert via a store-level guard, not a UI check.
- **T12 — Weight conservation.** A company whose exposure weights sum to 1.3 is rejected on save with a specific error.
- **T13 — Vintage stability.** Re-importing a revised month preserves the prior vintage and surfaces the delta.
- **T14 — FX control.** Partial correlation controlling for USD/KRW returns a different value than raw correlation on a fixture constructed with an FX-driven common component.

---

## SECTION 21 — SEED CONFIGURATION (SHIP THESE FILES)

Generate the following as real config files in the project.

### 21.1 `core20.config.json`

```json
{
  "taxonomyVersion": "MTI-2026",
  "effectiveFrom": "2026-06-01",
  "sourceNote": "MOTIE monthly export/import trend framework — 20 major export items (expanded from 15 in the 2026 MTI revision). Verify against the latest MOTIE monthly release before relying on this list.",
  "verificationStatus": "UNVERIFIED_SEED",
  "items": [
    { "key": "semiconductors",      "ko": "반도체",        "en": "Semiconductors",              "subItems": ["메모리(DRAM)", "메모리(NAND)", "시스템반도체"] },
    { "key": "automobiles",         "ko": "자동차",        "en": "Automobiles",                 "subItems": ["신차", "중고차"] },
    { "key": "auto_parts",          "ko": "자동차부품",    "en": "Auto Parts",                  "subItems": [] },
    { "key": "general_machinery",   "ko": "일반기계",      "en": "General Machinery",           "subItems": [] },
    { "key": "petrochemicals",      "ko": "석유화학",      "en": "Petrochemicals",              "subItems": [] },
    { "key": "petroleum_products",  "ko": "석유제품",      "en": "Petroleum Products",          "subItems": [] },
    { "key": "steel",               "ko": "철강",          "en": "Steel",                       "subItems": ["기타 철강금속제품"] },
    { "key": "ships",               "ko": "선박",          "en": "Ships / Shipbuilding",        "subItems": [] },
    { "key": "displays",            "ko": "디스플레이",    "en": "Displays",                    "subItems": [] },
    { "key": "wireless_devices",    "ko": "무선통신기기",  "en": "Wireless Communication Devices", "subItems": [] },
    { "key": "computers",           "ko": "컴퓨터",        "en": "Computers",                   "subItems": [] },
    { "key": "bio_health",          "ko": "바이오헬스",    "en": "Bio-Health",                  "subItems": ["의약품", "의료기기"] },
    { "key": "secondary_batteries", "ko": "이차전지",      "en": "Secondary Batteries",         "subItems": ["리튬이온전지", "배터리 소재"] },
    { "key": "textiles",            "ko": "섬유",          "en": "Textiles",                    "subItems": ["천연소재", "가방", "신발"] },
    { "key": "home_appliances",     "ko": "가전",          "en": "Home Appliances",             "subItems": [] },
    { "key": "electrical_equipment","ko": "전기기기",      "en": "Electrical Equipment",        "subItems": [], "addedIn2026Revision": true },
    { "key": "non_ferrous_metals",  "ko": "비철금속",      "en": "Non-ferrous Metals",          "subItems": [], "addedIn2026Revision": true },
    { "key": "agri_fishery_food",   "ko": "농수산식품",    "en": "Agri-Fishery-Food",           "subItems": [], "addedIn2026Revision": true },
    { "key": "cosmetics",           "ko": "화장품",        "en": "Cosmetics",                   "subItems": [], "addedIn2026Revision": true },
    { "key": "household_goods",     "ko": "생활용품",      "en": "Household / Lifestyle Goods", "subItems": [], "addedIn2026Revision": true }
  ]
}
```

**MTI numeric codes are deliberately absent.** Resolve them from the imported taxonomy at runtime by matching category names against the loaded MTI master, and show an `unmapped` state for any item that does not resolve. Do not type MTI numbers from memory into this file.

### 21.2 `exposureSeed.config.json`

Candidate company↔export-category links. Every row carries `verificationStatus: "UNVERIFIED_SEED"`, records only publicly-known lines of business, and asserts **nothing** about market cap or Top-100 membership. `provisionalExposureTier` maps to a default weight (`PRIMARY` 0.60 / `MATERIAL` 0.30 / `MINOR` 0.10) at confidence 0.50, which is **below the default display threshold** — so these appear as reviewable candidates, not as verified data.

Generate the file with this schema and these rows:

```json
{
  "schemaVersion": 1,
  "verificationStatus": "UNVERIFIED_SEED",
  "note": "Candidate links based on publicly-known lines of business. Weights must be replaced by DART segment-revenue derivation or manual review before a row is treated as verified. Ticker inclusion here is NOT a claim of KOSPI Top-100 membership.",
  "links": [
    { "ticker": "005930", "name": "삼성전자",         "category": "semiconductors",       "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "005930", "name": "삼성전자",         "category": "wireless_devices",     "role": "DEVICE_MAKER", "tier": "MATERIAL" },
    { "ticker": "005930", "name": "삼성전자",         "category": "home_appliances",      "role": "DEVICE_MAKER", "tier": "MINOR"    },
    { "ticker": "005930", "name": "삼성전자",         "category": "displays",             "role": "DEVICE_MAKER", "tier": "MINOR"    },
    { "ticker": "000660", "name": "SK하이닉스",       "category": "semiconductors",       "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "000990", "name": "DB하이텍",         "category": "semiconductors",       "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "042700", "name": "한미반도체",       "category": "semiconductors",       "role": "EQUIPMENT",    "tier": "PRIMARY"  },
    { "ticker": "108320", "name": "LX세미콘",         "category": "semiconductors",       "role": "COMPONENTS",   "tier": "PRIMARY"  },
    { "ticker": "034220", "name": "LG디스플레이",     "category": "displays",             "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "011070", "name": "LG이노텍",         "category": "wireless_devices",     "role": "COMPONENTS",   "tier": "PRIMARY"  },
    { "ticker": "066570", "name": "LG전자",           "category": "home_appliances",      "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "005380", "name": "현대차",           "category": "automobiles",          "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "000270", "name": "기아",             "category": "automobiles",          "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "012330", "name": "현대모비스",       "category": "auto_parts",           "role": "COMPONENTS",   "tier": "PRIMARY"  },
    { "ticker": "204320", "name": "HL만도",           "category": "auto_parts",           "role": "COMPONENTS",   "tier": "PRIMARY"  },
    { "ticker": "018880", "name": "한온시스템",       "category": "auto_parts",           "role": "COMPONENTS",   "tier": "PRIMARY"  },
    { "ticker": "011210", "name": "현대위아",         "category": "auto_parts",           "role": "COMPONENTS",   "tier": "PRIMARY"  },
    { "ticker": "005850", "name": "에스엘",           "category": "auto_parts",           "role": "COMPONENTS",   "tier": "PRIMARY"  },
    { "ticker": "010950", "name": "S-Oil",            "category": "petroleum_products",   "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "096770", "name": "SK이노베이션",     "category": "petroleum_products",   "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "096770", "name": "SK이노베이션",     "category": "secondary_batteries",  "role": "DEVICE_MAKER", "tier": "MATERIAL" },
    { "ticker": "051910", "name": "LG화학",           "category": "petrochemicals",       "role": "MATERIALS",    "tier": "PRIMARY"  },
    { "ticker": "051910", "name": "LG화학",           "category": "secondary_batteries",  "role": "MATERIALS",    "tier": "MATERIAL" },
    { "ticker": "011170", "name": "롯데케미칼",       "category": "petrochemicals",       "role": "MATERIALS",    "tier": "PRIMARY"  },
    { "ticker": "011780", "name": "금호석유",         "category": "petrochemicals",       "role": "MATERIALS",    "tier": "PRIMARY"  },
    { "ticker": "009830", "name": "한화솔루션",       "category": "petrochemicals",       "role": "MATERIALS",    "tier": "PRIMARY"  },
    { "ticker": "006650", "name": "대한유화",         "category": "petrochemicals",       "role": "MATERIALS",    "tier": "PRIMARY"  },
    { "ticker": "005490", "name": "POSCO홀딩스",      "category": "steel",                "role": "MATERIALS",    "tier": "PRIMARY"  },
    { "ticker": "004020", "name": "현대제철",         "category": "steel",                "role": "MATERIALS",    "tier": "PRIMARY"  },
    { "ticker": "460860", "name": "동국제강",         "category": "steel",                "role": "MATERIALS",    "tier": "PRIMARY"  },
    { "ticker": "009540", "name": "HD한국조선해양",   "category": "ships",                "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "329180", "name": "HD현대중공업",     "category": "ships",                "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "042660", "name": "한화오션",         "category": "ships",                "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "010140", "name": "삼성중공업",       "category": "ships",                "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "010620", "name": "HD현대미포",       "category": "ships",                "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "034020", "name": "두산에너빌리티",   "category": "general_machinery",    "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "042670", "name": "HD현대인프라코어", "category": "general_machinery",    "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "267270", "name": "HD현대건설기계",   "category": "general_machinery",    "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "373220", "name": "LG에너지솔루션",   "category": "secondary_batteries",  "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "006400", "name": "삼성SDI",          "category": "secondary_batteries",  "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "003670", "name": "포스코퓨처엠",     "category": "secondary_batteries",  "role": "MATERIALS",    "tier": "PRIMARY"  },
    { "ticker": "066970", "name": "엘앤에프",         "category": "secondary_batteries",  "role": "MATERIALS",    "tier": "PRIMARY"  },
    { "ticker": "207940", "name": "삼성바이오로직스", "category": "bio_health",           "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "068270", "name": "셀트리온",         "category": "bio_health",           "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "000100", "name": "유한양행",         "category": "bio_health",           "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "128940", "name": "한미약품",         "category": "bio_health",           "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "006280", "name": "GC녹십자",         "category": "bio_health",           "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "326030", "name": "SK바이오팜",       "category": "bio_health",           "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "267260", "name": "HD현대일렉트릭",   "category": "electrical_equipment", "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "010120", "name": "LS ELECTRIC",      "category": "electrical_equipment", "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "298040", "name": "효성중공업",       "category": "electrical_equipment", "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "001440", "name": "대한전선",         "category": "electrical_equipment", "role": "COMPONENTS",   "tier": "PRIMARY"  },
    { "ticker": "010130", "name": "고려아연",         "category": "non_ferrous_metals",   "role": "MATERIALS",    "tier": "PRIMARY"  },
    { "ticker": "103140", "name": "풍산",             "category": "non_ferrous_metals",   "role": "MATERIALS",    "tier": "PRIMARY"  },
    { "ticker": "097950", "name": "CJ제일제당",       "category": "agri_fishery_food",    "role": "DOWNSTREAM",   "tier": "PRIMARY"  },
    { "ticker": "004370", "name": "농심",             "category": "agri_fishery_food",    "role": "DOWNSTREAM",   "tier": "PRIMARY"  },
    { "ticker": "271560", "name": "오리온",           "category": "agri_fishery_food",    "role": "DOWNSTREAM",   "tier": "PRIMARY"  },
    { "ticker": "003230", "name": "삼양식품",         "category": "agri_fishery_food",    "role": "DOWNSTREAM",   "tier": "PRIMARY"  },
    { "ticker": "001680", "name": "대상",             "category": "agri_fishery_food",    "role": "DOWNSTREAM",   "tier": "PRIMARY"  },
    { "ticker": "090430", "name": "아모레퍼시픽",     "category": "cosmetics",            "role": "DOWNSTREAM",   "tier": "PRIMARY"  },
    { "ticker": "051900", "name": "LG생활건강",       "category": "cosmetics",            "role": "DOWNSTREAM",   "tier": "PRIMARY"  },
    { "ticker": "051900", "name": "LG생활건강",       "category": "household_goods",      "role": "DOWNSTREAM",   "tier": "MATERIAL" },
    { "ticker": "192820", "name": "코스맥스",         "category": "cosmetics",            "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "161890", "name": "한국콜마",         "category": "cosmetics",            "role": "DEVICE_MAKER", "tier": "PRIMARY"  },
    { "ticker": "298020", "name": "효성티앤씨",       "category": "textiles",             "role": "MATERIALS",    "tier": "PRIMARY"  },
    { "ticker": "003240", "name": "태광산업",         "category": "textiles",             "role": "MATERIALS",    "tier": "PRIMARY"  }
  ],
  "excludedByDefault": [
    { "ticker": "402340", "name": "SK스퀘어",  "reason": "Holding company — semiconductor exposure is equity-method, not operating. Enable only with an explicit look-through model." },
    { "ticker": "078930", "name": "GS",        "reason": "Holding company — refining exposure via affiliate. Enable only with an explicit look-through model." },
    { "ticker": "267250", "name": "HD현대",    "reason": "Holding company — refining and shipbuilding exposure via subsidiaries. Enable only with an explicit look-through model." },
    { "ticker": "006260", "name": "LS",        "reason": "Holding company — non-ferrous and electrical exposure via subsidiaries." }
  ]
}
```

On first run, load these rows into `company_export_exposure` with `verificationStatus: 'UNVERIFIED_SEED'`, `mappingConfidence: 0.50`, and `effectiveFrom` = the import date. The `excludedByDefault` entries load as inactive rows visible in the admin editor with their stated reason, so the user can enable them deliberately rather than wondering why a holding company is missing.

### 21.3 `regionalCapability.config.json`

Seed with the disclosure rules in Section 12.2 and the administrative-boundary note in Section 12.3.

---

## SECTION 22 — REQUIRED OUTPUT

Do not stop at a design description. Generate and integrate working code:

1. UI components (framework matching the existing app).
2. Data-layer adapters for both Track F and Track A.
3. Store/API interfaces and, in Tier A, schema and migrations.
4. Ingestion and validation jobs (Tier A) or manual-refresh equivalents (Tier B).
5. All statistical utilities from Section 19, with unit tests.
6. Point-in-time Top-100 ranking logic.
7. Company-exposure model, seed loader, and admin editor.
8. Provenance, freshness, vintage and data-quality UI.
9. Loading, empty, error and stale states for every data surface.
10. DEMO MODE isolated behind a store-level guard.
11. All acceptance tests from Section 20 as executable tests.

Where credentials are missing, build the integration surface and a clear configuration state. Never substitute fabricated data for a missing key.

---

## SECTION 23 — BUILD PRIORITY

1. Track F import pipeline + storage layer + Total Exports × KOSPI chart
2. Point-in-time KOSPI Top-100 engine
3. Taxonomy engine, MTI/HSK crosswalk, 2026 revision handling
4. Company exposure model, seed load, admin editor, strict filtering
5. Sector pages with matched-company overlays (the core user requirement)
6. Statistics: HAC inference, rolling correlation, lead/lag, FDR
7. All Export Industries explorer with tiered depth
8. FX layer and release-time alignment
9. Regional capability framework
10. Signal layer, high-frequency 1–20 day panel, watchlists
11. Track A live adapters and Source Health panel
12. HS explorer and optional Top-200 universe

Correctness beats completeness. A smaller set of verified, well-sourced modules is worth more than a larger set of fabricated or loosely-mapped ones. If you must cut scope, cut features — never cut provenance, point-in-time correctness, or the strict sector filter.

===== PROMPT END =====
