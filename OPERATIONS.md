# Running Afronomics

How the site runs day to day with one person and a set of agents.

## What updates itself

| Layer | Source | Refresh | Where |
| --- | --- | --- | --- |
| 22 indicator series, 54 countries | World Bank Open Data API | cached 24h | `lib/data/series.ts` |
| Development-finance pipeline | World Bank Projects API v3 | cached 6h | `lib/data/projects.ts` |
| FX reference | ExchangeRate-API (open endpoint) | cached 1h | `lib/data/fx.ts` |
| The Wire (headlines) | publisher RSS feeds | cached 15 min | `lib/data/wire.ts` |
| Signals | computed from the series | on page regeneration | `lib/data/signals.ts` |

Pages regenerate on their own (`revalidate`), so the site stays current with no deploys.

## The archive agent (the moat)

`/api/cron/archive` runs daily (vercel.json) and writes every FX reference rate and every Wire headline to Supabase
(`fx_daily`, `wire_archive`). Public APIs only give "latest"; the archive becomes history nobody else holds —
daily African FX since launch, and a searchable, country-tagged index of African business news.

## Environment variables (Vercel → Settings → Environment Variables)

| Name | Needed for |
| --- | --- |
| `SUPABASE_URL` | newsletter sign-ups and the archive |
| `SUPABASE_SERVICE_ROLE_KEY` | same (server only, never exposed) |
| `CRON_SECRET` | protects the archive cron; Vercel sends it automatically |
| `PAYSTACK_SECRET_KEY` | turns on Pro/Team/trial checkout on /pricing |
| `NEXT_PUBLIC_CONTACT_EMAIL` | public contact address (default desk@afronomicsfeed.com) |
| `AFRONOMICS_PAYWALL` | set to `on` only once accounts exist |

Database migrations live in `supabase/migrations`; 0003 and 0004 add `subscribers`, `fx_daily`, `wire_archive`.

## Adding coverage

- **New indicator:** add one entry to `indicatorDefs` in `lib/data/indicators.ts` (World Bank code). It appears on
  every country page, gets its own ranked page, CSV and sitemap entry.
- **New publisher on the Wire:** add its RSS URL to `feeds` in `lib/data/wire.ts`.
- **New official source:** add it to `lib/data/official.ts`.

## Weekly routine

1. Monday: send the Afronomics Weekly from `/signals`, `/capital` pipeline changes and the week's Wire.
2. Publish one analysis piece in `content/` (markdown with sources in frontmatter).
3. Log any correction in `lib/corrections.ts`.
