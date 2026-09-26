# PROGRESS

## Base
- Base commit: `7c154f5` ("Export from Grok"), verified with `git rev-parse --short HEAD` — matches A1, no re-verification differences.
- Node `v22.22.2`, npm `10.9.7`.
- Branch: `claude/new-session-mz0027` (harness-designated session branch; the spec's
  `feat/v3-briefings-robotics-procharts` is **not** created — the harness forbids
  pushing to other branches without explicit permission). Deviation recorded here.

## Baseline gates @ 7c154f5
| Gate | Result |
|---|---|
| `npm run typecheck` | pass (0 errors) |
| `npm test` | pass — 195 script tests + 113 app tests |
| `npm run build` | pass; rewrote 109 tracked files under `.vercel/output/` (restored) |
| `npx eslint .` | 20 errors / 49 warnings (pre-existing; matches A1 table) |

## Mode (A9): **OFFLINE-BUILD**
`npm run verify:sources` (2026-09-26): 61 probed → 61 `blocked` (`x-deny-reason: host_not_allowed`
from the session egress proxy), 3 skipped (env-gated: KIS, Finnhub; builder-only). Hosts denied
include stock.naver.com, m.stock.naver.com, www.hankyung.com, feeds.bloomberg.com,
www.federalreserve.gov, news.google.com, query1.finance.yahoo.com, www.therobotreport.com,
www.sec.gov. Consequences: every source stays `unverified` (candidates `candidate`,
disabled); parsers are built against documented formats and tested with synthetic
fixtures; the UI shows an honest `소스 미검증` state. **Next step for the owner:** rerun
`npm run verify:sources` with normal internet or after switching the environment network
access to "Full".

GitHub (git over the proxy) works: read-only clones of `dd3ok/naverstock-api-skill@47a4274`
and `koreainvestment/open-trading-api` (sparse: `examples_llm/domestic_stock/news_title`,
`examples_llm/kis_auth.py`) were read in P0. The catalog documents list keys
(`articles`, `items`, `researchSets`, `content`, top-level `aid` array) and id fields
(`nid`, `aid`, `researchId`) but **not** per-item field names beyond those, so Naver v2
mappers accept several candidate field names and stay `unverified`.

## Phase status
| Phase | Status | Notes |
|---|---|---|
| P0 | done | docs, registry, probe, baseline |
| P1 | done | kernel, registry, fetch policy, health, UI kit, store v2, D1–D5(name)/D7/D8 |
| P2 | done | /api/feed, news adapters, /news/kr, /news/us, grouped sidebar, LiveNews paging, US MarketBar |
| P3 | pending | |
| P4 | pending | |
| P5 | pending | |
| P6 | pending | |
| P7 | pending | |

## Decisions
- Dependency: `fast-xml-parser@^5.11.1` (allowed by A6) for RSS/Atom/RDF.
- Date-only timestamps normalize to 12:00 UTC of the calendar date (same date in KST and ET);
  `precision: "day"` prevents any fake clock time.
- Candidates stay `enabled: false` until verified, except Bloomberg (F3.1 MUST) which is
  enabled with status `candidate`, env kill switch, circuit breaker and GN fallback.
- `PUBLIC_RESEARCH` registry is empty: nothing could be verified as public-without-login offline.
- Pure `src/lib/**` modules receive data that lives behind `@/` imports (e.g. `UNIVERSE`)
  as parameters, so tests run under `node --experimental-strip-types`.

## Deviations
- Branch name (see Base).
- FeedList "virtualization" uses native `content-visibility: auto` on rows above 200 (no new dependency).
- `retrySource` is a POST server function (mutation semantics); everything else is GET.
- Extra optional env `FEED_SOURCES_DISABLED` (comma list of registry ids) as a server-side kill switch alongside the registry `enabled` flag.
- Source health is in-memory per server instance (serverless instances keep separate views; stated on the page).
- KRX tick table (unified 2023 stock table, ETF/ETN flat 5 KRW) could not be re-verified offline; used only for drawing snap.
- F1.6 KR calendar strip omitted (spec: only with a verifiable source). F3.7 US earnings-today not built (Nasdaq calendar JSON unverified).
- KIS news titles have no public original page; rows link to a Naver news search for the title and say so in the snippet.
- Naver AI briefing links to https://stock.naver.com/ (no per-briefing page route is documented).
- Client re-scores importance with the viewer's watchlist/keywords (server score is watch-agnostic because `/api/feed` is CDN-cached).

## Blockers
- Network egress denies every market-data host (not a credential issue). No paid service needed.

## Phase log
### P1 — foundations (done)
1. Kernel: `src/lib/feed/{types,time,sort,text,rss-parse,cluster,importance,tickers,filters,briefing,mappers}.ts` + tests (AT-01..05).
2. Server: `src/server/feeds/{registry,http,health,runner}.ts`, `src/lib/feed-fns.ts`, `/status/sources` page with toggles + 지금 재시도.
3. Store v2 (`store-migrate.ts`, AT-08), chart formatters + KRX tick (AT-06), attribution footer (AT-07), popup-safe opener (D2).
4. D1 call sites moved onto the kernel (research, disclosures, us-street, us-link, official); fabricated `00:00`/"now" timestamps removed.
5. Gates: typecheck 0 · tests 201 + 150 pass · ESLint changed files 0 errors · build ok · qa:smoke ok (dashboard hydration race fixed).

### P2 — news (done)
1. Adapters (`src/server/feeds/adapters/news.ts`): Naver list/focus/world/search, generic RSS/Atom (Hankyung, Fed, Bloomberg headline-only), Google News groups (via the reused `fetchGoogleNewsRss` path now on `fetchWithPolicy`), KRX/DART disclosures, KIS news-title (token ≤ 1/min), Finnhub, SEC 8-K (candidate), Finviz ratings.
2. `GET /api/feed` (budget 7.5 s, partial, cursor, `s-maxage=30, swr=60`), `useFeed` (merge without dups, client re-score with watchlist/keywords, source toggles).
3. `/news/kr` (indices + USD/KRW tiles, KRX session, digest, Naver AI briefing card), `/news/us` (11 delayed Yahoo tiles, NY session estimate, KST/ET toggle, 7-day Fed/BEA calendar), `/news` → `/news/kr`.
4. Grouped sidebar; LiveNews paging via kernel; MarketBar US segment (delayed); US watchlist + keyword-watch editors on /watchlist.
5. Gates: typecheck 0 · tests 201 + 161 · ESLint changed 0 errors · build ok · qa:smoke 34/34 · qa:acceptance AT-09/11/12/13 pass (mocked data in the QA harness only).

## Next steps
- P3: research v2 adapter + ResearchDesk rewrite (tabs, strip, cards, pre-resolve, detail sheet), BrokerReports Δ%, US research tiers, Street Moves table + CSV, scope banner, lazy universe.
