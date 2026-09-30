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
| `SUPABASE_SERVICE_ROLE_KEY` | optional: needed only to record Paystack payments in the database. Sign-ups and the archive already work without it, through validated database functions and the public key |
| `CRON_SECRET` | optional: restricts the archive job to Vercel's scheduler |
| `PAYSTACK_SECRET_KEY` | turns on Pro/Team/trial checkout on /pricing |
| `PAYSTACK_PLAN_PRO`, `PAYSTACK_PLAN_TEAM` | optional Paystack plan codes; makes Pro/Team recurring subscriptions |
| `PAYSTACK_CURRENCY` | `USD` (default, needs USD enabled on Paystack) or `KES` (Pro KES 3,900, Team KES 19,500) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | public contact address (default desk@afronomicsfeed.com) |
| `AFRONOMICS_PAYWALL` | set to `on` only once accounts exist |

Database migrations live in `supabase/migrations`; 0003–0005 add `subscribers`, `fx_daily`, `wire_archive`,
`payments` and `paid_subscriptions`. Set everything in one go with `scripts/setup-env.ps1`.

## Payments

Paystack webhook URL: `https://www.afronomicsfeed.com/api/paystack/webhook`. Verified charges land in `payments`,
subscriptions in `paid_subscriptions`. There are no user accounts yet: grant access by email from those tables.

## Adding coverage

- **New indicator:** add one entry to `indicatorDefs` in `lib/data/indicators.ts` (World Bank code). It appears on
  every country page, gets its own ranked page, CSV and sitemap entry.
- **New publisher on the Wire:** add its RSS URL to `feeds` in `lib/data/wire.ts`.
- **New official source:** add it to `lib/data/official.ts`.

## Weekly routine

1. Monday: send the Afronomics Weekly from `/signals`, `/capital` pipeline changes and the week's Wire.
2. Publish one analysis piece in `content/` (markdown with sources in frontmatter).
3. Log any correction in `lib/corrections.ts`.
