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

**Programmatic SEO:**  
`/countries/[slug]/[topic]`, `/markets/{currencies|exchanges|commodities}/[slug]`, `/capital/[type]/[country]`, `/indicators/[slug]/[country]`, `/climate/[slug]`, `/signals/[slug]`, `/economy/[slug]`, `/technology/[lens]/[country]`, `/trade/[corridor]/[country]`, `/trade/ports/[slug]`, `/projects/[country]`, `/ask/[slug]`, `/ask/corpus`, `/data/[slug]`, `/industries/[slug]/[country]`, `/agencies/[kind]/[country]`, `/cities/[slug]`, `/investors/[slug]`, `/people/[role]/[country]`, `/developers`, `/graph/[desk]`, `/graph/resolve`, `/account`, `/account/usage`, `/watchlists`, `/alerts`, `/exports`, `/method/registry`, `/packs`, `/sources`, `/compare`, `/ingestion`, `/feeds`, `/status`, `/searches`, `/licensing`, `/notifications`, `/changelog`, `/audit`, `/reports`, `/calendar`, `/partners`, `/coverage`, `/glossary`, `/onboarding`, `/webhooks`, `/regions`, `/regions/[slug]`, `/runbooks`, `/layers`, `/press`, `/golive`, `/social`, `/embeds`, `/security`, `/integrations`, `/sla`, `/brand`, `/roadmap`, `/accessibility`, `/sdk`, `/templates`, `/support`, `/newsletters`, `/careers`, `/contact`, `/faq`, `/legal/cookies`, `/trust`, `/credits`, `/manifesto`, `/imprint`, `/syndication`, `/notices`, `/languages`, `/units`, `/correspondents`, `/citations`, `/corridors`, `/identifiers`, `/series`, `/revisions`, `/classifications`, `/releases`, `/datelines`, `/borders`, `/customs`, `/modes`, `/observations`, `/frequencies`, `/vintages`, `/lineage`, `/gaps`, `/periods`, `/lags`, `/benchmarks`, `/baskets`, `/thresholds`, `/peers`, `/weights`, `/constituents`, `/horizons`, `/baselines`, `/spreads`, `/seasons`, `/adjustments`, `/footnotes`, `/scales`, `/precision`, `/rounding`, `/crosswalks`, `/aliases`, `/embargoes`, `/sessions`, `/holidays`, `/factors`, `/tenors`, `/grades`, `/flags`, `/windows`, `/cutoffs`, `/stamps`, `/breaks`, `/curves`, `/fixes`, `/lots`, `/quotes`, `/contracts`, `/samples`, `/indices`, `/manifests`, `/parcels`, `/draws`

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

See `supabase/migrations/0001_afronomics_core.sql`. Applied on the `afronomicsfeed` project. Reference catalogues are loaded. Observation and price tables stay empty until a sourced print exists.

Covers: profiles, subscriptions, articles, publishers, authors, countries, companies, people, industries, indicators + observations, currencies, market prices, exchanges, capital, investors, funds, climate, startups, trade, infrastructure, signals, graph, watchlists, alerts, documents/chunks/embeddings (pgvector), newsletters, api_keys, audit_logs.

RLS on from day one. Service role never in the client.

---

## 4. Implementation phases

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Terminal chrome, nav, premium homepage, demo widgets labelled | **Shipped** |
| 2 | Country intelligence pages (seed 6) | **54 terminals + 10 series files each** |
| 3 | Articles + editorial (MD remains; `/admin` shell) | MD live; `/admin` shell |
| 4 | Markets + indicators (demo, sourced fields) | **Currency, exchange, commodity files + indicator×country** |
| 5 | Capital Tracker | **12 books × 54 country files + demo table** |
| 6 | Climate Capital | **54 country climate files + Project Lens** |
| 7 | Signals | **Signal files + 13 category hubs** |
| 8 | Terminal | **Monitor wired to market, economy, tech, capital, climate, company and signal files** |
| 9 | Ask Afronomics (RAG + pgvector) | **Question files + `/ask/corpus` empty slots; RAG still unconnected** |
| 10 | Subscriptions | **Entitlement matrix + `/account`; checkout/Auth still stubs** |
| 11 | API keys + usage | **`/developers` + `/api/meta` catalogue; keys not issued** |
| 12 | Full graph + entity resolution jobs | **`/graph` + featured + WA/NA/CA desks through SL/MR/GM/TD + corridors (incl. Trans-Kalahari, Beira); resolve stub** |
| 13 | Decisions (watches / alerts / opinion rubrics) | **`/watchlists` + `/alerts` shells; Opinion rubrics; no fake deliveries** |
| 14 | Multi-desk graph + exports + Ask corpus | **NG/ZA/EG desks; `/exports` shells; `/ask/corpus` empty index** |
| 15 | Featured desks complete + method/usage/packs | **GH/RW desks; `/method/registry`; `/account/usage`; `/packs` shells** |
| 16 | Sources + compare + ingestion ops | **`/sources` registry; `/compare` empty matrix; `/ingestion` job board** |
| 17 | Feeds + status + EAC corridor desks | **`/feeds` catalogue; `/status` board; UG/TZ graph desks** |
| 18 | Searches + licensing + notifications + corridor desk | **`/searches`; `/licensing`; `/notifications`; ET + Northern Corridor desks** |
| 19 | Changelog + audit + reports + Morocco | **`/changelog`; `/audit`; `/reports`; Morocco graph desk** |
| 20 | Calendar + partners + Central Corridor + API | **`/calendar`; `/partners`; Central Corridor desk; `/api/graph` + `/api/status`** |
| 21 | Coverage + glossary + WA/Lobito desks | **`/coverage`; `/glossary`; CI + Angola + Lobito Corridor desks** |
| 22 | Onboarding + webhooks + SN/MZ + Maputo | **`/onboarding`; `/webhooks`; Senegal + Mozambique + Maputo Corridor desks** |
| 23 | Regions + runbooks + Zambia / Lobito span | **`/regions`; `/runbooks`; Zambia desk; Lobito spans AO+ZM** |
| 24 | Layers + press + Tunisia desk | **`/layers`; `/press`; Tunisia graph desk** |
| 25 | Go-live gates + LinkedIn social desk | **`/golive` blockers; `/social` LinkedIn share + company URL hook** |
| 26 | Embeds + Algeria desk + LI cross-post runbook | **`/embeds` catalogue; Algeria graph desk; LinkedIn cross-post SOP** |
| 27 | Security trust + Botswana desk | **`/security` control catalogue; Botswana graph desk** |
| 28 | Integrations + Cameroon desk | **`/integrations` delivery catalogue; Cameroon graph desk** |
| 29 | SLA catalogue + Namibia desk | **`/sla` commitment shells; Namibia graph desk** |
| 30 | Brand kit + Trans-Kalahari corridor | **`/brand` identity catalogue; Trans-Kalahari graph + trade file** |
| 31 | Roadmap + a11y + Libya + Beira | **`/roadmap`; `/accessibility`; Libya + Zimbabwe desks; Beira Corridor** |
| 32 | SDK catalogue + Mauritius desk | **`/sdk` client catalogue; Mauritius graph desk** |
| 33 | Templates + support + Djibouti desk | **`/templates`; `/support`; Djibouti graph desk** |
| 34 | Newsletters + Gabon desk | **`/newsletters` digest catalogue; Gabon graph desk** |
| 35 | Careers + Malawi desk | **`/careers` role shapes; Malawi graph desk** |
| 36 | Contact doors + Benin desk | **`/contact` door catalogue; Benin graph desk** |
| 37 | FAQ + Togo desk | **`/faq` honest answers; Togo graph desk** |
| 38 | Cookies posture + Mali desk | **`/legal/cookies`; Mali graph desk** |
| 39 | Trust center + Niger desk | **`/trust` hub; Niger graph desk** |
| 40 | Credits + BF/GN/LR desks | **`/credits`; Burkina Faso, Guinea, Liberia graph desks** |
| 41 | Manifesto + SL/MR/GM/TD desks | **`/manifesto`; Sierra Leone, Mauritania, Gambia, Chad desks** |
| 42 | Imprint + Madagascar / Congo desks | **`/imprint`; Madagascar + Congo graph desks** |
| 43 | Syndication + BI/CF/GQ desks | **`/syndication`; Burundi, CAR and Equatorial Guinea graph desks** |
| 44 | Notices + CD/ST/SS desks | **`/notices`; DR Congo, São Tomé and Príncipe, and South Sudan graph desks** |
| 45 | Languages + SD/ER/SO desks | **`/languages`; Sudan, Eritrea and Somalia graph desks** |
| 46 | Units + CV/GW/KM desks | **`/units`; Cabo Verde, Guinea-Bissau and Comoros graph desks** |
| 47 | Correspondents + SZ/LS desks | **`/correspondents`; Eswatini and Lesotho graph desks** |
| 48 | Citations + Seychelles desk | **`/citations`; Seychelles graph desk. Country desks cover the full set** |
| 49 | Corridors + Abidjan–Lagos / Nacala | **`/corridors`; Abidjan–Lagos and Nacala graph desks. No stored volumes** |
| 50 | Identifiers + LAPSSET / North-South | **`/identifiers`; LAPSSET and North-South corridor desks** |
| 51 | Series + Douala–N'Djamena / Walvis–Ndola | **`/series`; Douala–N'Djamena and Walvis Bay–Ndola desks** |
| 52 | Revisions + Djibouti–Addis / Dakar–Bamako | **`/revisions`; Djibouti–Addis and Dakar–Bamako desks** |
| 53 | Classifications + Cotonou–Niamey / Lomé–Ouagadougou | **`/classifications`; Cotonou–Niamey and Lomé–Ouagadougou desks** |
| 54 | Releases + Abidjan–Ouagadougou / Conakry–Bamako | **`/releases`; Abidjan–Ouagadougou and Conakry–Bamako desks** |
| 55 | Datelines + Pointe-Noire / TAZARA | **`/datelines`; Pointe-Noire–Brazzaville and TAZARA desks** |
| 56 | Borders + Douala–Bangui / Tema–Ouagadougou | **`/borders`; Douala–Bangui and Tema–Ouagadougou desks** |
| 57 | Customs + Abidjan–Bamako / Lomé–Niamey | **`/customs`; Abidjan–Bamako and Lomé–Niamey desks** |
| 58 | Modes + Nouakchott–Dakar / Lagos–Niamey | **`/modes`; Nouakchott–Dakar and Lagos–Niamey desks** |
| 59 | Observations + Matadi–Kinshasa / Berbera–Addis | **`/observations`; Matadi–Kinshasa and Berbera–Addis desks** |
| 60 | Frequencies + Cape Town–Johannesburg / Alexandria–Cairo | **`/frequencies`; Cape Town–Johannesburg and Alexandria–Cairo desks** |
| 61 | Vintages + Port Said–Cairo / Banjul–Dakar | **`/vintages`; Port Said–Cairo and Banjul–Dakar desks** |
| 62 | Lineage + Freetown–Monrovia / Luanda–Lobito | **`/lineage`; Freetown–Monrovia and Luanda–Lobito desks** |
| 63 | Gaps + Port Sudan–Khartoum / Toamasina–Antananarivo | **`/gaps`; Port Sudan–Khartoum and Toamasina–Antananarivo desks** |
| 64 | Periods + Mbabane–Maputo / Maseru–Johannesburg | **`/periods`; Mbabane–Maputo and Maseru–Johannesburg desks** |
| 65 | Lags + Bissau–Dakar / Mogadishu–Berbera | **`/lags`; Bissau–Dakar and Mogadishu–Berbera desks** |
| 66 | Benchmarks + Accra–Tema / Abuja–Lagos | **`/benchmarks`; Accra–Tema and Abuja–Lagos desks** |
| 67 | Baskets + Douala–Yaoundé / Massawa–Asmara | **`/baskets`; Douala–Yaoundé and Massawa–Asmara desks** |
| 68 | Thresholds + Tangier–Casablanca / Tunis–Sfax | **`/thresholds`; Tangier–Casablanca and Tunis–Sfax desks** |
| 69 | Peers + Algiers–Oran / Tripoli–Benghazi | **`/peers`; Algiers–Oran and Tripoli–Benghazi desks** |
| 70 | Weights + Libreville–Port-Gentil / Malabo–Bata | **`/weights`; Libreville–Port-Gentil and Malabo–Bata desks** |
| 71 | Constituents + Nouakchott–Nouadhibou / Lusaka–Ndola | **`/constituents`; Nouakchott–Nouadhibou and Lusaka–Ndola desks** |
| 72 | Horizons + Beira–Lilongwe / Harare–Bulawayo | **`/horizons`; Beira–Lilongwe and Harare–Bulawayo desks** |
| 73 | Baselines + Accra–Kumasi / Brazzaville–Kinshasa | **`/baselines`; Accra–Kumasi and Brazzaville–Kinshasa desks** |
| 74 | Spreads + Gaborone–Francistown / Windhoek–Walvis Bay | **`/spreads`; Gaborone–Francistown and Windhoek–Walvis Bay desks** |
| 75 | Seasons + Mombasa–Nairobi / Dar es Salaam–Dodoma | **`/seasons`; Mombasa–Nairobi and Dar es Salaam–Dodoma desks** |
| 76 | Adjustments + Kano–Lagos / Blantyre–Lilongwe | **`/adjustments`; Kano–Lagos and Blantyre–Lilongwe desks** |
| 77 | Footnotes + Cairo–Aswan / Casablanca–Marrakech | **`/footnotes`; Cairo–Aswan and Casablanca–Marrakech desks** |
| 78 | Scales + Durban–Johannesburg / Kampala–Kigali | **`/scales`; Durban–Johannesburg and Kampala–Kigali desks** |
| 79 | Precision + Juba–Kampala / Ouagadougou–Niamey | **`/precision`; Juba–Kampala and Ouagadougou–Niamey desks** |
| 80 | Rounding + Addis Ababa–Nairobi / Bamako–Ouagadougou | **`/rounding`; Addis Ababa–Nairobi and Bamako–Ouagadougou desks** |
| 81 | Crosswalks + Niamey–Kano / Algiers–Constantine | **`/crosswalks`; Niamey–Kano and Algiers–Constantine desks** |
| 82 | Aliases + Accra–Takoradi / Kigali–Bujumbura | **`/aliases`; Accra–Takoradi and Kigali–Bujumbura desks** |
| 83 | Embargoes + Lusaka–Harare / Lagos–Port Harcourt | **`/embargoes`; Lusaka–Harare and Lagos–Port Harcourt desks** |
| 84 | Sessions + Nairobi–Kisumu / Abidjan–San-Pédro | **`/sessions`; Nairobi–Kisumu and Abidjan–San-Pédro desks** |
| 85 | Holidays + Beira–Tete / Monrovia–Buchanan | **`/holidays`; Beira–Tete and Monrovia–Buchanan desks** |
| 86 | Factors + Casablanca–Rabat / Johannesburg–Pretoria | **`/factors`; Casablanca–Rabat and Johannesburg–Pretoria desks** |
| 87 | Tenors + Dakar–Saint-Louis / Accra–Tamale | **`/tenors`; Dakar–Saint-Louis and Accra–Tamale desks** |
| 88 | Grades + Luanda–Namibe / Kinshasa–Lubumbashi | **`/grades`; Luanda–Namibe and Kinshasa–Lubumbashi desks** |
| 89 | Flags + Algiers–Annaba / Lagos–Calabar | **`/flags`; Algiers–Annaba and Lagos–Calabar desks** |
| 90 | Windows + Kampala–Entebbe / Dar es Salaam–Mwanza | **`/windows`; Kampala–Entebbe and Dar es Salaam–Mwanza desks** |
| 91 | Cutoffs + Cotonou–Porto-Novo / Lomé–Kara | **`/cutoffs`; Cotonou–Porto-Novo and Lomé–Kara desks** |
| 92 | Stamps + Tunis–Sousse / Cairo–Luxor | **`/stamps`; Tunis–Sousse and Cairo–Luxor desks** |
| 93 | Breaks + Conakry–Kankan / Libreville–Franceville | **`/breaks`; Conakry–Kankan and Libreville–Franceville desks** |
| 94 | Curves + Nairobi–Nakuru / Addis Ababa–Dire Dawa | **`/curves`; Nairobi–Nakuru and Addis Ababa–Dire Dawa desks** |
| 95 | Fixes + Abidjan–Bouaké / Lagos–Ibadan | **`/fixes`; Abidjan–Bouaké and Lagos–Ibadan desks** |
| 96 | Lots + Johannesburg–Bloemfontein / Lusaka–Livingstone | **`/lots`; Johannesburg–Bloemfontein and Lusaka–Livingstone desks** |
| 97 | Quotes + Marrakech–Agadir / Kampala–Jinja | **`/quotes`; Marrakech–Agadir and Kampala–Jinja desks** |
| 98 | Contracts + Yaoundé–Garoua / Harare–Mutare | **`/contracts`; Yaoundé–Garoua and Harare–Mutare desks** |
| 99 | Samples + Maputo–Nampula / Accra–Cape Coast | **`/samples`; Maputo–Nampula and Accra–Cape Coast desks** |
| 100 | Indices + Windhoek–Rundu / Gaborone–Maun | **`/indices`; Windhoek–Rundu and Gaborone–Maun desks** |
| 101 | Manifests + Tripoli–Misrata / Oran–Constantine | **`/manifests`; Tripoli–Misrata and Oran–Constantine desks** |
| 102 | Parcels + Blantyre–Zomba / Asmara–Keren | **`/parcels`; Blantyre–Zomba and Asmara–Keren desks** |
| 103 | Draws + Luanda–Malanje / Antananarivo–Fianarantsoa | **`/draws`; Luanda–Malanje and Antananarivo–Fianarantsoa desks** |

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

Events to emit when analytics lands: `brief_open`, `country_view`, `signal_open`, `search`, `ask_query`, `watchlist_add`, `alert_subscribe`, `graph_open`, `pro_cta`, `export_csv`, `pack_open`, `usage_view`, `method_open`, `source_open`, `compare_open`, `ingestion_view`, `feed_open`, `status_view`, `search_save`, `licence_view`, `notification_pref`, `changelog_open`, `audit_view`, `report_open`, `calendar_open`, `partner_view`, `coverage_view`, `glossary_open`, `onboarding_open`, `webhook_view`, `region_open`, `runbook_open`, `layers_open`, `press_open`, `golive_open`, `social_open`, `embed_view`, `security_open`, `integration_view`, `sla_open`, `brand_open`, `roadmap_open`, `a11y_open`, `sdk_open`, `template_view`, `support_open`, `newsletter_view`, `careers_open`, `contact_open`, `faq_open`, `cookies_open`, `trust_open`, `credits_open`, `manifesto_open`, `imprint_open`, `syndication_open`, `notices_open`, `languages_open`, `units_open`, `correspondents_open`, `citations_open`, `corridors_open`, `identifiers_open`, `series_open`, `revisions_open`, `classifications_open`, `releases_open`, `datelines_open`, `borders_open`, `customs_open`, `modes_open`, `observations_open`, `frequencies_open`, `vintages_open`, `lineage_open`, `gaps_open`, `periods_open`, `lags_open`, `benchmarks_open`, `baskets_open`, `thresholds_open`, `peers_open`, `weights_open`, `constituents_open`, `horizons_open`, `baselines_open`, `spreads_open`, `seasons_open`, `adjustments_open`, `footnotes_open`, `scales_open`, `precision_open`, `rounding_open`, `crosswalks_open`, `aliases_open`, `embargoes_open`, `sessions_open`, `holidays_open`, `factors_open`, `tenors_open`, `grades_open`, `flags_open`, `windows_open`, `cutoffs_open`, `stamps_open`, `breaks_open`, `curves_open`, `fixes_open`, `lots_open`, `quotes_open`, `contracts_open`, `samples_open`, `indices_open`, `manifests_open`, `parcels_open`, `draws_open`.  
Phase 1: typed event names in `lib/analytics.ts` only — no fake dashboards.

---

## 8. Quality bar

`npm run build` must pass. No invented official prints. No copyrighted republication. No placeholder buttons that claim a write succeeded.
