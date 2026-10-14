# Supabase tables nothing reads (14 Oct 2026)

Rebuild brief, section 4: tables from earlier plans are **left in place, not dropped**, and listed here.

**How this list was made.** A table is listed when its name appears nowhere in:
- the code that runs (`app/`, `components/`, `lib/`, `scripts/`, `.github/`);
- the body of any database function in `supabase/migrations/`.

It is a read-only check, re-runnable with the snippet at the end.

**Two caveats:**
- A table could still be read from outside this repository, for example by a Supabase dashboard query or an edge
  function deployed by hand. Check before any future clean-up.
- "Rows" is Postgres's own estimate. "not analysed" means Postgres has not counted it yet; it does not mean empty.

| Table | Rows (estimate) | Likely purpose (from its name and migration; not verified) |
| --- | --- | --- |
| `af_push_keys` | not analysed | web push (superseded by the alerts in use today) |
| `af_push_state` | not analysed | web push |
| `api_keys` | not analysed | the first API-key design (replaced by `data_keys`, migration 0028) |
| `api_usage` | not analysed | the first API-key design (replaced by `data_key_usage`) |
| `article_entities` | not analysed | a knowledge graph of articles |
| `article_sources` | not analysed | a knowledge graph of articles |
| `audit_logs` | not analysed | an admin audit trail |
| `capital_transactions` | not analysed | the capital tracker (parked) |
| `citations` | not analysed | a knowledge graph of articles |
| `climate_finance` | not analysed | climate coverage (parked) |
| `climate_projects` | not analysed | climate coverage (parked) |
| `economic_indicators` | not analysed | an early indicator store (the site reads `data/` files) |
| `entities` | about 412 | a knowledge graph of institutions and people |
| `entity_relationships` | about 549 | a knowledge graph of institutions and people |
| `funding_rounds` | not analysed | startup coverage (parked) |
| `indicator_observations` | about 177 | an early indicator store |
| `industries` | not analysed | company coverage |
| `infrastructure_projects` | about 116 | infrastructure coverage (parked) |
| `market_prices` | not analysed | an early prices store |
| `newsletter_subscribers` | not analysed | the first newsletter design (replaced by `subscribers`) |
| `profiles` | not analysed | user accounts (never launched) |
| `saved_searches` | not analysed | user accounts (never launched) |
| `signal_evidence` | not analysed | the first signals design |
| `startups` | not analysed | startup coverage (parked) |
| `trade_flows` | not analysed | trade coverage (parked) |
| `watchlist_items` | not analysed | user watchlists (never launched) |
| `watchlists` | not analysed | user watchlists (never launched) |

`entities` and `entity_relationships` hold data and may be useful seeds for the Phase 3 institutions registry.
Look at them before building a new table.

```python
# Re-run from the repo root (prints tables with no reference in code or database functions).
import re, pathlib
tables = [...]  # from: select relname from pg_class c join pg_namespace n on n.oid = c.relnamespace where nspname = 'public' and relkind = 'r'
code = "\n".join(p.read_text(errors="ignore") for d in ("app", "components", "lib", "scripts", ".github") for p in pathlib.Path(d).rglob("*") if p.is_file())
fns = "\n".join(b for m in pathlib.Path("supabase/migrations").glob("*.sql") for b in re.findall(r"\$\w*\$(.*?)\$\w*\$", m.read_text(), re.S))
print([t for t in tables if not re.search(rf"(?<![a-z_]){t}(?![a-z_])", code + fns)])
```
