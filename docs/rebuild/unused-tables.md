# Supabase tables nothing reads (re-checked 14 Oct 2026, Phase 6)

Rebuild brief, section 4: tables from earlier plans are **left in place, not dropped**, and listed here.

**How this list was made.** A table is listed when its name appears nowhere in:
- the code that runs (`app/`, `components/`, `lib/`, `scripts/`, `.github/`);
- the body of any database function in `supabase/migrations/`.

It is a read-only check, re-runnable with the snippet at the end.

**Two caveats:**
- A table could still be read from outside this repository, for example by a Supabase dashboard query or an edge
  function deployed by hand. Check before any future clean-up.
- "Rows" is the live row count Postgres keeps per table (`pg_stat_user_tables.n_live_tup`), read on 14 Oct 2026.

| Table | Rows (live count, 14 Oct) | Likely purpose (from its name and migration; not verified) |
| --- | --- | --- |
| `af_jobs` | 0 | the jobs board (removed 14 Oct) |
| `af_push_keys` | 1 | web push (superseded by the alerts in use today) |
| `af_push_state` | 10 | web push |
| `api_keys` | 0 | the first API-key design (replaced by `data_keys`, migration 0028) |
| `api_usage` | 0 | the first API-key design (replaced by `data_key_usage`) |
| `article_entities` | 0 | a knowledge graph of articles |
| `article_sources` | 22 | a knowledge graph of articles |
| `audit_logs` | 0 | an admin audit trail |
| `capital_transactions` | 0 | the capital tracker (parked) |
| `citations` | 0 | a knowledge graph of articles |
| `climate_finance` | 0 | climate coverage (parked) |
| `climate_projects` | 0 | climate coverage (parked) |
| `document_chunks` | 0 | text chunks for search over documents (migration 0001; never filled) |
| `economic_indicators` | 11 | an early indicator store (the site reads `data/` files) |
| `entities` | 465 | a knowledge graph of institutions and people |
| `entity_relationships` | 621 | a knowledge graph of institutions and people |
| `funding_rounds` | 0 | startup coverage (parked) |
| `indicator_observations` | 178 | an early indicator store |
| `industries` | 12 | company coverage |
| `infrastructure_projects` | 116 | infrastructure coverage (parked) |
| `market_prices` | 0 | an early prices store |
| `newsletter_subscribers` | 0 | the first newsletter design (replaced by `subscribers`) |
| `profiles` | 0 | user accounts (never launched) |
| `saved_searches` | 0 | user accounts (never launched) |
| `signal_evidence` | 0 | the first signals design |
| `startups` | 0 | startup coverage (parked) |
| `tender_alert_payments` | 0 | tender alerts (removed 14 Oct) |
| `tender_alerts` | 0 | tender alerts (removed 14 Oct) |
| `trade_flows` | 0 | trade coverage (parked) |
| `watchlist_items` | 0 | user watchlists (never launched) |
| `watchlists` | 0 | user watchlists (never launched) |

`entities` and `entity_relationships` hold data, but the Phase 3 registry was built from the regulators' own files
(`data/registry/`), not from them.

**Phase 6 re-check.** The check now also follows database functions: a table counts as read only if code reads it, or
a database function that code calls (directly or through another function) reads it. That found one more table,
`document_chunks`.

**Jobs board and tender alerts (removed 14 Oct).** Their code was removed at the founder's request. Their three
tables join this list: `af_jobs`, `tender_alerts` and `tender_alert_payments`, each with 0 rows on 14 Oct. Their
database functions (`af_job_*`, `af_tender_alert_*`) also stay in place until the tables are dropped.

```python
# Re-run from the repo root (prints tables with no reference in code or database functions).
import re, pathlib
tables = [...]  # from: select relname from pg_class c join pg_namespace n on n.oid = c.relnamespace where nspname = 'public' and relkind = 'r'
code = "\n".join(p.read_text(errors="ignore") for d in ("app", "components", "lib", "scripts", ".github") for p in pathlib.Path(d).rglob("*") if p.is_file())
fns = "\n".join(b for m in pathlib.Path("supabase/migrations").glob("*.sql") for b in re.findall(r"\$\w*\$(.*?)\$\w*\$", m.read_text(), re.S))
print([t for t in tables if not re.search(rf"(?<![a-z_]){t}(?![a-z_])", code + fns)])
```
