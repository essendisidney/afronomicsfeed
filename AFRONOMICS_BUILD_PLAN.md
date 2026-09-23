# Afronomics Feed — Architecture & Build Plan

**Product:** Africa’s economic intelligence layer  
**Thesis:** NEWS → DATA → CONTEXT → SIGNALS → DECISIONS  
**Positioning:** The economic intelligence graph for Africa — not “Bloomberg for Africa,” not a news site.

Audited: 23 Sep 2026.

---

## 1. Existing architecture (what stays)

| Layer | Today | Decision |
| --- | --- | --- |
| Stack | Next.js 16 App Router, React 19, TS, Tailwind v4 | **Keep.** |
| Content | Filesystem Markdown + gray-matter (`content/briefs`, `weekly`, `explainers`) | **Keep** as the original Kenya journalism layer. Trust fields (labels, sources, as-of, desk memo) remain the editorial contract. |
| Trust UI | Facts/Analysis/Opinion, citations, EXAMPLE DATA, corrections, method | **Keep and extend** to all new data widgets. |
| Chrome | Header, search ⌘K, theme, market strip, footer | **Refactor** into a terminal masthead. Do not delete search, theme, or legal/corrections. |
| Routes that must remain live | `/brief`, `/weekly`, `/explainers`, `/today`, `/method`, `/archive`, `/institutions`, `/topics`, `/trackers/*`, `/pricing`, `/subscribe`, `/advisory`, `/corrections`, `/legal/*` | **Keep.** Footer: “Kenya desk file.” |
| Payments / auth / CMS | Stubs only | **Do not fake.** Schema + UI shells; live billing/auth when Supabase + checkout exist. |
| Database | None | **Add** Postgres schema (Supabase). No Afronomics project exists yet (other org projects are unrelated). |
| Git remote / Vercel | Local git, no `origin` at last check; Vercel CLI present | Wire separately. Domain: `afronomicsfeed.com`. |
| Live market data | Explicitly none | **Never scrape.** All prints stay DEMO / Methodology Under Development until licensed pipelines. |

### Important assumptions

1. Kenya remains the **first populated file**, not the brand limit.
2. USD Pro/Professional prices are the commercial north star; the KES 500 trial stays as a local on-ramp.
3. Demo numbers exist only to prove layout and graph shape. They never ship without a `Demo Data` or `Methodology Under Development` mark.
4. External articles are **summaries + outbound links**, never republished copy.
5. AI answers may only cite stored documents/sources. Model output never writes verified observations.

---

## 2. Target information architecture

```
NEWS → DATA → CONTEXT → SIGNALS → DECISIONS
```

**Primary nav:** Markets · Economy · Capital · Climate · Technology · Trade · Companies · Countries · Data · Opinion  

**Utility:** Search · Brief · Terminal · PRO  

**Programmatic SEO (later phases):**  
`/countries/[slug]/[topic]`, `/markets/currencies/[code]`, `/capital/[type]/[country]`, `/indicators/[slug]`

---

## 3. Data architecture

### 3.1 Knowledge graph

Entities: country, city, company, bank, startup, fund, investor, industry, commodity, currency, project, agency, indicator, corridor, port, policy, person.

Stored as `entities` + `entity_relationships` (typed edges, source, as-of). Articles tag entities; ingestion upserts edges. That compounding graph is the moat.

### 3.2 Provenance (non-negotiable)

Every observation: `source_id`, `observation_date`, `retrieved_at`, `unit`, `currency`, `geography`, `status` ∈  
`verified | primary_source | secondary_source | estimated | modelled | unverified | demo`.

### 3.3 Ingestion pipeline (code exists as stubs; jobs later)

```
SOURCE → FETCH → VALIDATE → NORMALIZE → DEDUPE → RESOLVE → RAW → STRUCTURED → SIGNALS → PUBLISH
```

Folder: `lib/ingestion/{providers,normalizers,validators,deduplication,entity-resolution,jobs}`.

Historical observations are **append-only**. Never silent overwrite.

### 3.4 Schema

See `supabase/migrations/0001_afronomics_core.sql`.

Covers: profiles, subscriptions, articles, publishers, authors, countries, companies, people, industries, indicators + observations, currencies, market prices, exchanges, capital, investors, funds, climate, startups, trade, infrastructure, signals, graph, watchlists, alerts, documents/chunks/embeddings (pgvector), newsletters, api_keys, audit_logs.

RLS on from day one. Service role never in the client.

---

## 4. Implementation phases

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Terminal chrome, nav, premium homepage, demo widgets labelled | **Shipped** |
| 2 | Country intelligence pages (seed 6) | **54 terminals + 10 series files each** |
| 3 | Articles + editorial (MD remains; `/admin` shell) | MD live; `/admin` shell |
| 4 | Markets + indicators (demo, sourced fields) | Scaffold + currency files |
| 5 | Capital Tracker | Scaffold + demo table |
| 6 | Climate Capital | Scaffold + demo profiles |
| 7 | Signals | Scaffold + demo cards |
| 8 | Terminal | Scaffold |
| 9 | Ask Afronomics (RAG + pgvector) | Schema + retrieval-refusing UI |
| 10 | Subscriptions | Pricing copy + stubs |
| 11 | API keys + usage | Schema + metadata routes |
| 12 | Full graph + entity resolution jobs | Schema + Kenya edges |

The app stays runnable after every phase.

---

Phase 1 is live in-app: chrome, homepage, all initial routes, 54 country terminals, SQL, ingestion stubs.

## 5. What Phase 1 ships

- Wordmark **AFRONOMICS** + line **Africa’s Economic Intelligence Layer**
- Dense masthead + ticker (all **Demo Data**)
- Homepage: lead + 4 supports, Pulse, Markets, Capital, Climate, Tech, Country Watch, Signals, Data of the Day, Brief
- New primary routes (no dead buttons: each page states status and next data requirement)
- Existing Kenya desk routes unchanged
- SQL migration + ingestion stubs committed

---

## 6. Monetisation (architected, not charged)

| Tier | Price | Access |
| --- | --- | --- |
| Free | $0 | Headlines, basic country pages, Morning Brief teasers, limited search |
| Pro | $29/mo | Deep analysis, capital/climate explorers, alerts, AI allowance (later) |
| Professional | $149/mo | Downloads, API allowance, project lens, watchlists |
| Enterprise | Custom | Feeds, licences, white-label |
| Kenya desk trial | KES 500 / 14 days | Existing on-ramp |

Editorial and sponsored surfaces stay visually separate. No sponsor inventory in this build.

---

## 7. Analytics hooks (north star)

Events to emit when analytics lands: `brief_open`, `country_view`, `signal_open`, `search`, `ask_query`, `watchlist_add`, `pro_cta`, `export_csv`.  
Phase 1: typed event names in `lib/analytics.ts` only — no fake dashboards.

---

## 8. Quality bar

`npm run build` must pass. No invented official prints. No copyrighted republication. No placeholder buttons that claim a write succeeded.
