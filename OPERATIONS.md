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

## Kenya Treasury bill auctions (Afronomics dataset)

`scripts/kenya_tbills.py` reads every CBK Treasury bill result notice (PDF) and writes
`data/kenya/tbill_auctions.json`, one row per auction per tenor, each linked to its notice. The GitHub Action
`.github/workflows/kenya-tbills.yml` runs it every Thursday and Friday and commits new results, which redeploys
the site. Run by hand with `python scripts/kenya_tbills.py` (add `--full` to re-read everything).
Page: `/markets/kenya-tbills`; CSV: `/api/data/kenya-tbills`.

## Environment variables (Vercel → Settings → Environment Variables)

| Name | Needed for |
| --- | --- |
| `AF_CRON_SECRET` | shared secret: the mail/desk/payment database functions, GitHub Actions and the /desk key |
| `CRON_SECRET` | optional: restricts the archive job to Vercel's scheduler |
| `PAYSTACK_SECRET_KEY` | turns on checkout: Pro, Team and the trial on /pricing, the two pack tiers on /pack |
| `PAYSTACK_PLAN_PRO`, `PAYSTACK_PLAN_TEAM`, `PAYSTACK_PLAN_PACK`, `PAYSTACK_PLAN_PACK_PLUS` | optional Paystack plan codes (PLN_…); with one set, that tier becomes a recurring monthly subscription at the plan's price |
| `PAYSTACK_CURRENCY` | `KES` (default: Pro 1,500, Team 6,000, trial 200, pack 12,000 / 18,000) or `USD` (Pro $12, Team $49; needs USD enabled on Paystack) |
| `PAYMENTS_NOTIFY_EMAIL` | where the "new payment" note goes (default the contact address) |
| `RESEND_API_KEY` | sends the Morning, receipts and payment notes |
| `NEXT_PUBLIC_CONTACT_EMAIL` | public contact address (default desk@afronomicsfeed.com) |
| `AFRONOMICS_PAYWALL` | set to `on` only once accounts exist |

Database migrations live in `supabase/migrations`; 0003–0005 add `subscribers`, `fx_daily`, `wire_archive`,
`payments` and `paid_subscriptions`. Set everything in one go with `scripts/setup-env.ps1`.

## Payments

Paystack webhook URL: `https://www.afronomicsfeed.com/api/paystack/webhook` (Settings → API Keys & Webhooks, live and
test). Verified charges land in `payments` and subscriptions in `paid_subscriptions` through `af_record_payment` /
`af_record_subscription` (secret-gated; no service-role key on Vercel). The return page verifies the reference with
Paystack and records it too, so nothing is lost if the webhook is down. Each charge emails the buyer a receipt and the
desk a note; /desk lists payments and totals. There are no user accounts yet: grant access by email from /desk.

## Adding coverage

- **New indicator:** add one entry to `indicatorDefs` in `lib/data/indicators.ts` (World Bank code). It appears on
  every country page, gets its own ranked page, CSV and sitemap entry.
- **New publisher on the Wire:** add its RSS URL to `feeds` in `lib/data/wire.ts`.
- **New official source:** add it to `lib/data/official.ts`.

## Weekly routine

1. Monday: send the Afronomics Weekly from `/signals`, `/capital` pipeline changes and the week's Wire.
2. Publish one analysis piece in `content/` (markdown with sources in frontmatter).
3. Log any correction in `lib/corrections.ts`.
