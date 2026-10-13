# Security review, 13 October 2026

Scope: the Next.js app (main at `ba90006`, which includes #109 paid keys and bond alerts and #110 report-only CSP),
the Supabase project `ugjpcybhqwvzidcbqpik` (read-only catalogue queries: policies, grants, function definitions,
and the length of the cron secret, never its value), the GitHub Actions workflows, the dependencies, and the full
git history (312 commits).

Fixes are on this branch. The database change is a new migration, `supabase/migrations/0038_security_hardening.sql`.
It is **not applied**. No production setting, key or deployment was changed.

## Summary

| ID | Severity | Finding | Status |
|----|----------|---------|--------|
| C-1 | Critical | Next.js 16.3.4: remote code execution in `next/og` ImageResponse (GHSA-vcvr-r3jv-pc5j), plus an image-optimiser SSRF and cache poisoning | Fixed: upgraded to 16.3.8 |
| H-1 | High | Pilot form shows a 30-day API key to whoever types any work email address | Fixed in code |
| H-2 | High | Anyone with the public key can write FX rates and headlines into the archive that the Morning note, the Weekly and the paid pack read | Fixed in code, plus migration 0038 |
| H-3 | High | The desk key is the master cron secret, and the browser stored it in a script-readable cookie for a year | Partly fixed (HttpOnly sign-in); founder action needed |
| M-1 | Medium | A charge of any amount tagged `job_listing` publishes a job; underpaid plans reach the desk with no warning | Fixed in code |
| M-2 | Medium | `/thank-you?reference=…` reveals a new API key, and the buyer's email, to anyone who has the reference | Fixed in code |
| M-3 | Medium | Desk actions sent to `/api/desk` never received the `/desk`-scoped cookie, so they always failed. No CSRF origin check | Fixed in code |
| M-4 | Medium | Newsletter sign-up is single opt-in, re-subscribes people who unsubscribed, and reveals whether an address is subscribed (DB) | Open: needs a product decision |
| M-5 | Medium | Trial-key quotas can be used up on another organisation's behalf (3 per domain per 90 days, 40 a day site-wide) | Mostly fixed by H-1; quota design is open |
| M-6 | Medium | Job "apply" links accept any scheme | Fixed in code, plus migration 0038 |
| M-7 | Medium | Workflows install unpinned Python packages in jobs that hold `contents: write` and the cron secret | Open: recommendation |
| L-1 | Low | Secret and token comparisons were not constant-time (app). SQL comparisons cannot be | Fixed in app; SQL limitation noted |
| L-2 | Low | Emails could reach logs (pilot log line; mail-provider and database error text) and workflow output | Fixed in code |
| L-3 | Low | JSON-LD blocks in 6 places not escaped for `</script>` | Fixed in code |
| L-4 | Low | `index-release.yml` interpolated the secret into the script text | Fixed |
| L-5 | Low | Paid-key derivation falls back to the Paystack secret key | Founder action |
| L-6 | Low | Telegram bot token is read from the database by a workflow, where GitHub does not mask it | Recommendation |
| L-7 | Low | Remaining npm advisories: dev-only eslint chain, gray-matter/js-yaml (build-time, trusted input) | Accepted |
| L-8 | Low | GitHub Actions pinned by tag, not commit SHA | Recommendation |
| L-9 | Low | CSP (PR #110) is sound as report-only, but `'unsafe-inline'` scripts mean it will not stop XSS when enforced | Noted |
| L-10 | Low | Rate limits on public forms are per instance and in memory, and there is no limit on `/api/v1` | Noted |
| I-1 | Info | No secrets in the working tree or the git history | No action |
| I-2 | Info | Every public table has RLS on, and no policy lets anon read personal data | No action |

---

## Critical

### C-1 Next.js remote code execution and other advisories (fixed)
`package.json`: `next` was `16.3.4`. `npm audit` reports:
- GHSA-vcvr-r3jv-pc5j, critical, RCE in `next/og` ImageResponse (>=16.2.0 <16.3.6). The site serves many
  ImageResponse routes (`opengraph-image`, `/share/card`).
- GHSA-cjq9-62q9-8jv4, high, SSRF in image optimisation.
- GHSA-mcj8-r9mp-w47p and GHSA-4jqv-mc3x-m676, cache poisoning. GHSA-f87g-xv8r-7p7x, metadata-image disclosure. All are fixed in 16.3.8.

**Exploit:** an unauthenticated request to an OG image route runs code on the server function. That function's
environment holds `AF_CRON_SECRET`, `PAYSTACK_SECRET_KEY` and `RESEND_API_KEY`.

**Fix:** `next` and `eslint-config-next` are pinned to `16.3.8`, and `npm audit fix` updated sharp, source-map-js
and brace-expansion. `next build` passes.
**Founder:** deploy promptly. The patch was not live before this branch, so as a precaution consider rotating
`AF_CRON_SECRET`, `PAYSTACK_SECRET_KEY` and `RESEND_API_KEY` (see "Rotation" below). Vercel's runtime logs cannot
show whether the bug was exploited.

## High

### H-1 Pilot key shown to whoever types the address (fixed)
`app/api/pilot/route.ts:67` (before) returned the newly issued trial key in the JSON response.
`components/billing/PilotForm.tsx` then displayed it. The only check is that the address is not webmail.

**Exploit:** type `anything@bigbank.com` (or any domain you control, with any local part) and get a 30-day key on
screen without owning the mailbox. You can repeat this with 40 keys a day site-wide and 3 per domain. You can also
use up a real institution's quota (M-5).

**Fix:** the key now goes only to the typed address by email. The response carries `prefix` and `expiresAt`. If the
email fails, the response says so and the desk note reads "KEY EMAIL FAILED: revoke and reissue". The form says where
the key went.

### H-2 Public write access to the FX and headline archive (fixed in code, migration 0038)
`af_archive_fx(jsonb)` and `af_archive_wire(jsonb)` are SECURITY DEFINER, EXECUTE to anon, with no secret (live
definitions; `0006_public_write_functions.sql` documents them). `fx_daily` keeps the **first** row per day and code
(`on conflict do nothing`), and the accepted window includes tomorrow.

**Exploit:** with the publishable key (public, in `lib/store.ts`), call
`/rest/v1/rpc/af_archive_fx` with tomorrow's date and a false USD/KES rate before the 04:15 UTC archive. The real
rate is then dropped. `overnightFx()` (`lib/editions/morning.ts:38`), the Weekly (`lib/editions/weekly.ts:40`) and
the paid Investment Committee Pack (`lib/editions/pack.ts:46`) compute moves from these rows, and the Morning note
is emailed to subscribers. The wire archive can be filled with any `https://` links and headlines.

**Fix:** `lib/agents/archive.ts` calls new two-argument versions with `p_secret`, and falls back to the old ones
until the migration exists. Migration 0038 adds the gated functions and revokes anon/authenticated EXECUTE on the
old ones. **Order: deploy this branch, then apply 0038.**
**Founder:** after applying, check the last few days of `fx_daily` against the source if anything looked odd. A
read-only query: `select day, code, rate, source from fx_daily where day > current_date - 14 order by day, code`.

### H-3 The desk key is the master secret, stored in a script-readable cookie (partly fixed)
`app/desk/DeskKey.tsx:15` (before) set `af_desk` with `document.cookie` for a year. It was not HttpOnly, so any
script on the origin could read it. Its value is `AF_CRON_SECRET`, the same secret that unlocks every gated function:
the subscriber list (`af_subscribers`), the press list, payments, leads, API-key issue and revoke, and
`af_telegram_config`, which returns the **Telegram bot token**.

The key is not in a URL, query string or Referer: it is typed into a password field and kept in a cookie.

**Exploit:** any XSS anywhere on the site (CSP is report-only, with `'unsafe-inline'`), or a malicious browser
extension, reads `document.cookie` on `/desk` and gets the master secret.

**Fix:** new `POST /desk/session` (`app/desk/session/route.ts`) checks the key against `af_desk` and sets it as
**HttpOnly; Secure; SameSite=Strict; Path=/desk**, for 90 days. `DELETE` signs out. The old cookie still works (same
name and path), so nobody is locked out. The next sign-in replaces it with the HttpOnly one. If `/desk/session`
cannot be reached, the form falls back to the old cookie.
**Founder:** sign in to `/desk` once on each device, so the cookie becomes HttpOnly. Then plan to give the desk its
own secret, separate from the cron secret. That is a database change: an `af_secrets` row named `desk`, accepted by
the desk functions only. It would mean that a stolen desk cookie no longer exposes the Telegram token or the mailing
lists, and the cron secret could rotate without touching the desk. Not done here because it touches about 20 live
functions.

## Medium

### M-1 Plan metadata trusted for job listings and desk grants (fixed)
`lib/billing/record.ts:46` (before) called `af_job_publish` for any recorded payment with `plan = job_listing`,
whatever the amount or status. Paystack metadata is set by the payer: anyone can open Paystack's inline popup with
the public key and pay KES 1 tagged `{plan: "job_listing"}`. The webhook signature is valid because Paystack
genuinely sends it. Paid keys (`paidMonths`) and tender alerts already check the amount. Jobs did not, and the desk
note for every other plan said "Grant access" with no amount check.

**Fix:** `paidInFull()` in `lib/billing/plans.ts`. A job publishes only on `status = success` and the full fee. Any
charge below its plan's price makes the desk email say "CHECK AMOUNT: plan price is …" and "Do not grant access
until the amount is checked".

Webhook verification itself is correct (`lib/billing/paystack.ts:97`): HMAC-SHA512 over the raw body with the secret
key, then `timingSafeEqual` after a length check.
`/thank-you` verifies the reference server-side with `/transaction/verify` and validates its format.

### M-2 The reference alone revealed a new API key (fixed)
`app/thank-you/page.tsx:95` (before) called `confirmReturnWithKey(reference, { reveal: true })` for any visitor.
References appear in receipts, the desk email and server logs.

**Exploit:** whoever has the reference and opens `/thank-you?reference=…` before the buyer does (for example when
the webhook issued the key and the buyer closed the tab) sees the key once, and sees the buyer's email address.

**Fix:** `/api/checkout` sets an HttpOnly `af_checkout` cookie holding the reference, for 3 days with SameSite=Lax,
so it survives the top-level return from Paystack. `/thank-you` reveals the key, and shows the email in full, only
when that cookie matches. Anyone else sees "issued, sent to j…@domain". The key is always in the receipt email.

### M-3 Desk actions never authorised, and no CSRF check (fixed)
The cookie is scoped to `path=/desk`, but `app/desk/DeskActions.tsx:10,134` (before) posted to `/api/desk`. The
browser does not send a `/desk` cookie there, so every action (grant access, issue or revoke key, deals,
corrections) answered "No desk key."

**Fix:** actions now post to `/desk/actions`, which uses the same handler. `/api/desk` is kept. Both refuse
cross-site requests by checking `Sec-Fetch-Site` and `Origin` (`lib/security.ts` `sameOrigin`), in addition to
SameSite=Strict.

### M-4 Newsletter sign-up (open)
`af_subscribe_v2` (live; `0021_welcome_email.sql`) has four problems:
- (a) Single opt-in: anyone can subscribe any address, and it gets a welcome email. There is a 5-per-10-minutes
  in-memory limit per IP and a global cap of 60 welcome emails an hour.
- (b) An address that **unsubscribed** is silently re-subscribed by anyone who types it in. Under Kenya's Data
  Protection Act and GDPR, the opt-out should hold.
- (c) The function returns `exists`, `added` or `welcome`, so anyone holding the public key can test whether an
  address is a subscriber. The route hides this; the RPC does not.
- (d) Rate-alert and tender-alert sign-ups are double opt-in, which is good.

**Recommendation:** make the newsletter double opt-in, as the alerts are: confirm by link before
`unsubscribed_at` is cleared or the first send. Have the RPC return a single value, and gate it behind the cron
secret so only the server can call it. This changes the sign-up flow, so it is left to you.

### M-5 Trial-key quotas can be used up on someone else's behalf (mostly fixed)
`af_trial_key_issue` (`0035_trial_keys.sql:52`) allows 3 keys per domain per 90 days and 40 a day site-wide, counted
when issued, before anyone proves they own the mailbox. With H-1 fixed, fake requests no longer yield a usable key.
They still use up a domain's 3 slots, or the day's 40.
**Recommendation:** count only keys that have been used, or issue on email confirmation.

### M-6 Job apply links (fixed)
`app/jobs/page.tsx:62` (before) used `apply_url` as an `href` unchanged. React 19 blocks `javascript:` URLs, but
`data:` and other schemes passed.
**Fix:** links are allow-listed to http(s) or an email address in `/api/jobs`, on render (`applyHref`), and in
`af_job_submit` (migration 0038).

### M-7 Unpinned Python dependencies in privileged workflows (open)
`african-auctions.yml`, `kenya-quick.yml` and `remittances.yml` run `pip install pdfplumber requests openpyxl` with no
versions, then run steps with `contents: write` and `AF_CRON_SECRET`. A compromised release would run with push
rights to `main` (which deploys to production) and could read the secret in later steps.
**Recommendation:** add `requirements.txt` with exact versions and hashes (`pip install --require-hashes -r …`).
Not done here because versions cannot be verified offline.

The workflow review found no other problems:
- No `pull_request_target`.
- `tests.yml`, `probe.yml` and `reader-dry.yml` use `contents: read`.
- The `contents: write` workflows all commit data.
- No step prints a secret.
- `morning-note.yml` commits `send.json`, which holds counts only. Failures are now redacted (L-2).

## Low

### L-1 Constant-time comparisons
In the app, every `Authorization: Bearer` check now goes through `bearerOk` / `safeEqual` in `lib/security.ts`
(SHA-256 of both sides, then `timingSafeEqual`). That covers:
- `app/api/send/*` (6 routes)
- `app/api/cron/archive`
- the Telegram webhook secret
- the newsletter unsubscribe token

In SQL, the `af_secrets` comparisons (`k.value = p_secret`) are not constant-time, and SQL has no primitive for it.
The secret is 43 characters (checked by length only), and the comparison is behind PostgREST and network jitter, so
this is accepted. Remedies if it ever matters: compare `digest(p_secret)` values, or move checks to an Edge Function.

### L-2 Emails in logs and workflow output
These lines are fixed:
- `app/api/pilot/route.ts:58` (before) logged the requester's email. It now logs the domain only.
- Mail-provider and database error text is passed through `redactEmails` in every route that logs it.
- Failures returned by `app/api/send/*` are redacted too, because GitHub Actions prints those responses.
- `send/desk` no longer echoes the owner's address.

Elsewhere, the existing logs already keep to reference plus domain (billing) or domain only (subscribe, enquiry).
The analytics tables hold no personal data: `page_views`, `events_daily`, `feedback` and `survey_answers` contain
path, country, counts and free text with no identifiers.

**Retention: none is defined.** `leads`, `subscribers`, `payments` (including the raw Paystack payload),
`survey_answers`, `feedback`, `deals` and `data_keys.email` are kept indefinitely.
**Recommendation:** set a retention policy, for example deleting leads with no deal after 24 months, and add a
purge function.

### L-3 JSON-LD escaping
Raw `JSON.stringify` inside `<script type="application/ld+json">` appeared in:
- `app/markets/kenya-bonds/[date]/page.tsx:58`
- `app/markets/kenya-tbills/[date]/page.tsx:59`
- `app/markets/tbills/[country]/[date]/page.tsx:63`
- `app/reference/page.tsx:82`
- `app/data/[indicator]/page.tsx:82`
- `components/article/ArticleJsonLd.tsx:8`

A `</script>` in any value would break out of the block. The content is ours today, but some of it is scraped.
**Fix:** `<` is escaped to `<`, as `components/seo/JsonLd.tsx` already did. `react-markdown` runs without
`rehype-raw`, so markdown is safe.

### L-4 Secret interpolated into a workflow script
`.github/workflows/index-release.yml:25,28` used `${{ secrets.AF_CRON_SECRET }}` inside `run:`. It now passes through
`env:`.

### L-5 Paid-key secret fallback
`lib/billing/paidkey.ts:71` derives keys as HMAC(`PAID_KEY_SECRET || PAYSTACK_SECRET_KEY`, reference). If
`PAID_KEY_SECRET` is unset, the Paystack secret does two jobs. Rotating it then changes the key derivation, so the
one-time reveal on `/thank-you` stops matching. Keys already stored as hashes keep working.
**Founder:** set `PAID_KEY_SECRET` in Vercel (production and preview) to a fresh random value of 32 bytes or more.
Do it before rotating the Paystack key, and expect the one-time reveal of keys issued under the old secret to fail.
Those buyers have the key by email.

The derivation itself is sound: HMAC-SHA256 with a domain-separated input, 192-bit keys, only SHA-256 hashes stored,
no key logged. The desk email carries the prefix only.

### L-6 Telegram token unmasked in workflow logs
`scripts/telegram_post.py` takes the bot token from `af_telegram_config` when the `TELEGRAM_BOT_TOKEN` secret is
unset. GitHub only masks values that are registered secrets. The script removes the token from error text it prints,
but a library's own traceback would not be scrubbed.
**Founder:** add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHANNEL` as repository secrets so they are masked.

### L-7 Remaining npm advisories
These are in the dev-only eslint toolchain (`@next/eslint-plugin-next` → fast-glob, micromatch, braces), plus
gray-matter → js-yaml/argparse/sprintf-js, which parse our own committed markdown at build time. `npm audit fix
--force` would downgrade eslint-config-next to 14.x and gray-matter to 2.x, so it is not applied. Re-check when
gray-matter or eslint-config-next release fixes.

### L-8 Actions pinned by tag
`actions/checkout@v4` and `actions/setup-python@v5` are first-party. Pinning to commit SHAs (Dependabot can keep
them current) closes the moved-tag risk.

### L-9 Content-Security-Policy (PR #110) review
The policy is sensible for report-only:
- `object-src 'none'`, `base-uri 'self'`, and `frame-ancestors` aligned with the existing `X-Frame-Options`.
- Paystack origins are pre-listed.

The report endpoint (`app/api/csp-report/route.ts`) is good:
- It logs directive, blocked host and page path only, with no IP, user agent or query strings.
- Per-instance line limit, content-type allow-list, 64 KB cap.

Points to note:
- `script-src 'unsafe-inline'` (`next.config.ts:59`) means that, once enforced, the policy will not stop injected
  inline scripts. That needs nonces, and so dynamic rendering. Enforce the other directives first.
- The 64 KB cap is checked against `Content-Length`. A chunked body without that header is read in full before the
  cut. This is minor, because a report body costs little to read.
- Consider adding `upgrade-insecure-requests` when enforcing.

### L-10 Rate limiting
These limits are in-memory and per serverless instance, so they are weak:
- `/api/subscribe`, `/api/rate-alerts`, `/api/tender-alerts`: per IP.
- `/api/pilot`: per address, by `af_lead`, 5 a day.

`/api/v1` has no per-key or per-IP limit, and keyed calls are `no-store`. Every email-sending route also sends a desk
copy (pilot) or a confirmation to a stranger's address, so it can be used to send mail to arbitrary addresses at a
low rate.
**Recommendation:** Vercel WAF rate-limit rules on `/api/pilot`, `/api/subscribe`, `/api/*-alerts` and
`/api/v1/*`.

## Informational

### I-1 Secrets in the repository (none)
The working tree and all 312 commits of history were scanned for:
- Paystack `sk_`/`pk_` keys, Supabase `sb_secret_` keys and service-role JWTs, Telegram bot tokens, Resend `re_`
  keys, GitHub tokens, AWS keys, PEM private keys.
- High-entropy literals.

The only hits are public by design:
- the Supabase **publishable** key (`lib/store.ts:9`, `scripts/telegram_post.py:161`)
- the Web Push **VAPID public** key (`components/ui/AlertButton.tsx`)
- the Google Search Console verification token (`app/layout.tsx`)

No `.env` file has ever been committed (`.env*` is gitignored). The personal email addresses in history are public
lender contacts in `data/` (CBK directory) and form placeholders.

### I-2 Database
The live catalogue was checked:
- **RLS** is on for every table in `public`. Tables holding personal data have **no** policies, so anon and
  authenticated users get nothing, even though the default table grants exist: `leads`, `subscribers`, `payments`,
  `paid_subscriptions`, `deals`, `data_keys`, `data_key_usage`, `tender_alerts`, `rate_alerts`, `key_alert_prefs`,
  `survey_answers`, `feedback`, `af_secrets`, `af_press`, `af_jobs` and the rest. `newsletter_subscribers` has an
  insert-only policy (legacy, unused).
- **Functions:** all 71 `public` functions are SECURITY DEFINER with `search_path` pinned to `public` (or
  `public, extensions`). All are executable by anon. 47 check the `cron` secret. The 24 without it are:
  - The intended public write paths, each validated and throttled: `af_event`, `af_hit*`, `af_feedback`,
    `af_survey`, `af_lead`, `af_subscribe*`, `af_job_submit`, `af_push_*`.
  - Token-gated confirm and unsubscribe: `af_rate_alert_*`, `af_tender_alert_*`, `af_bond_alert_unsubscribe`. Each
    token is 244 random bits (two UUIDv4s) and the function requires a length of 32 or more.
  - Public reads with no emails: `af_jobs`, `af_corrections`, `af_timeliness`, `af_traffic`, `af_fx_history`.
  - `af_archive_fx` and `af_archive_wire`, which are H-2.
- **No function returns an email to a caller without the secret.** `af_subscribers`, `af_press`,
  `af_rate_alerts_live`, `af_bond_alert_recipients`, `af_payments` and `af_desk_people` all need it.
- **The cron secret is 43 characters** (about 256 bits if random), and no client component references it. The
  server components that use it (`components/data/FairCheckPage.tsx`, the loan-apps pages) are async server
  components, so it never reaches the browser.
- The **database is not fully described by `supabase/migrations`**. `af_desk`, `af_hit`, `af_jobs`/`af_job_*`,
  `af_press*`, `af_corrections`, `af_feedback`, `af_traffic`, `af_timeliness` and `af_payment_access` exist only in
  the live database. Recommendation: dump them into a migration (`pg_get_functiondef`) so reviews and rebuilds see
  them.
- `/api/v1` reads keys only from the `Authorization` or `X-API-Key` header, never the URL, and stores only SHA-256
  hashes. Keys are never logged. Keyed responses are `private, no-store` with `Vary: Authorization, X-API-Key`.
- No route fetches a user-supplied URL, so there is no SSRF in app code. `/go/*` redirects only to allow-listed
  partner and fund URLs from code. Unknown slugs return to the site.
- One-click unsubscribe on GET (bond, rate and tender alerts) can be triggered by mail scanners that prefetch links.
  This is a functional issue, not a security one.

## What the founder must do

1. **Merge and deploy this branch** (C-1 is critical). Then **apply `0038_security_hardening.sql`** (H-2), after the
   deploy.
2. **Sign in to `/desk` once on each device** to switch to the HttpOnly cookie. Desk actions (grant access,
   keys, deals) start working again.
3. **Set `PAID_KEY_SECRET`** in Vercel if it is not set (L-5).
4. **Rotation (recommended because of C-1 and H-3):** rotate `AF_CRON_SECRET`. That means updating the `af_secrets`
   row `cron`, Vercel `AF_CRON_SECRET`, the GitHub secret `AF_CRON_SECRET`, and then re-entering it on `/desk`.
   Rotating it also changes every newsletter unsubscribe link, because they are derived from it, so links in emails
   already sent stop working. Rotate the Telegram bot token with BotFather and update `af_secrets`
   `telegram_bot_token`. Consider rotating `PAYSTACK_SECRET_KEY` (after step 3) and `RESEND_API_KEY`.
5. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHANNEL` as GitHub secrets (L-6).
6. Decide on newsletter double opt-in (M-4), a separate desk secret (H-3), pinned Python requirements (M-7), WAF
   rate limits (L-10) and a retention policy (L-2).
