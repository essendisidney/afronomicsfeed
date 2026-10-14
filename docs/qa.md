# Site QA: the automated quality gate

`scripts/site-qa.mjs` opens a curated set of pages in a real browser and fails when a page has a problem a reader
would notice: a page wider than the phone, a broken link, unreadable contrast, a footer that has grown out of
shape, or copy that claims more than the site can stand behind. It runs on every pull request, on every push to
`main` and every morning (`.github/workflows/site-qa.yml`), so problems are caught by the gate before anyone has to
point them out.

## What is checked

Every page in `tests/site/pages.json` is loaded at **390px and 1280px wide, in light and dark** (four runs per page).

| Check | Fails when | Where |
| --- | --- | --- |
| HTTP status | the page does not answer with its expected status (200, or 404 for the not-found page) | all runs |
| Horizontal overflow | `scrollWidth` is wider than the viewport; the report names the elements that stick out (outlined in red in the screenshot) | all runs |
| Console errors | anything logged as a console error or an uncaught exception | all runs |
| Broken internal links | any same-site link on any checked page answers 400 or more. Links are de-duplicated across all pages and checked once (HEAD, then GET). Redirects are followed while they stay on the site; a redirect off-site (`/go/fund/...`) counts as working | once per run |
| Accessibility | axe-core reports a WCAG 2.0/2.1/2.2 A or AA violation (contrast, names, labels, 24px target size, keyboard-scrollable regions...) | all runs |
| Images | an `<img>` has no `alt` (use `alt=""` for decoration) | 1280 light |
| Title and description | `<title>` or meta description missing; title over 65 characters; description over 160 | 1280 light |
| Headings | more than one `<h1>` (or none) | 1280 light |
| Tap targets | a link or button in the site header, the site footer, or a call to action in `<main>` (pill buttons and links, form submits, anything with `data-cta`) is under 44x44px. A hit area widened by a `::before` counts | 390 runs |
| Shared layout | no site `<header>` or `<footer>`; a footer column with fewer than 4 or more than 14 links; the longest footer column more than 2x the shortest; a header or footer link label over 32 characters | all runs |
| Copy | a known overclaim in the visible text, title or description (below) | 1280 light |

Overclaim rules (in `COPY_RULES` in the script). Each is judged one sentence at a time:

- "every African"
- "cited by institutions"
- "the minute they publish"
- "guaranteed" (unless the same sentence says *not / never / no* guarantee)
- "best fund" / "best money market fund" (unless the same sentence says "by yield")

The limits are in `LIMITS` at the top of the script.

## Run it locally

```bash
npm ci
npx next build
npm run qa -- --serve            # starts `next start` on :3000, runs, stops it
# or, against a server you already started:
npx next start -p 3000 &
npm run qa
```

Options: `--base URL` (another server, e.g. a preview deployment), `--only /pricing,/about` (just those pages),
`--concurrency 6`, `--out qa-report`, `--pages FILE` (a different page list), `--skip-links REGEX` (only for a
sandbox without internet: routes such as `/api/data/gdp` fetch from the World Bank when asked, and answer 503 when
they cannot reach it).

Playwright comes from the `@playwright/test` devDependency; install the browser once with
`npx playwright install chromium`. axe-core is injected from `node_modules/axe-core`.

The report is written to `qa-report/`:

- `report.md`: readable summary, grouped by check, with the variants each problem appears in
- `report.json`: the same data for tools
- `screenshots/`: a full-page screenshot of every page/variant that failed

In GitHub Actions the markdown report is also shown on the run's summary page, and `qa-report/` is uploaded as the
`site-qa-report` artifact. A full run (46 pages x 4 variants, ~600 links) takes about two minutes after the build.

## Add a page

Edit `tests/site/pages.json`. One entry per template is enough; add a page when you add a new kind of page.

- A fixed page: `"/new-page"`
- The newest of something, so the check follows the content:
  `{ "discover": "/brief", "match": "^/brief/[a-z0-9-]+$", "take": 3, "label": "Newest briefs" }`
  opens `/brief` and checks the first three links whose path matches.
- Nested discovery: `"each"` repeats the discovery on every page found (`{parent}` in its `match` is the page it
  was found on), and `"visit": false` skips the pages used only as a stepping stone. This is how one dated auction
  per bond market is found.
- A page that must fail: `{ "path": "/missing", "status": 404, "label": "404 page" }`

`tests/site/test_site_qa_config.py` (run by `pytest tests/site`) fails if a page the gate promises disappears from
the list.

## Allowlist an intentional use

When a finding is correct on purpose (a quote, a legal sentence that has to say "guaranteed"), add an entry to
`tests/site/allowlist.json` rather than bending the rule:

```json
{
  "check": "copy",
  "page": "/weekly/listed-bank-results-week-checklist",
  "match": "guaranteed",
  "reason": "Lists the words this series will not use; it is the opposite of a claim."
}
```

- `check`: one of `status`, `error`, `overflow`, `console`, `link`, `axe`, `img-alt`, `meta`, `h1`, `tap-target`,
  `layout`, `copy`
- `page`: an exact path, a prefix ending in `*` (`/markets/bonds/*`), or `*` for every page
- `match`: text that must appear in the finding's message or detail (case-insensitive), e.g. the phrase, the axe
  rule id, or the link path
- `reason`: required; the next reader needs to know why this is fine

Allowlisted findings are listed in the report but do not fail the run. An entry that no longer matches anything is
listed under "consider removing".

## When it fails

Open the `site-qa-report` artifact (or `qa-report/report.md` locally). Each row names the page, the variants
(`390-dark` etc.), the problem, and the elements involved; the screenshot shows the page as the check saw it. Fix
the cause with the shared UI kit (`components/ui/Button.tsx` `buttonClass` gives every button a 44px phone height),
or allowlist it with a reason if it is intentional.

## Pilot path smoke test (manual)

`.github/workflows/pilot-smoke.yml` (Actions → Pilot smoke → Run workflow) walks the path a prospect takes on the
live site, using `scripts/pilot_smoke.py`:

1. the pilot page loads and has the form (`#pilot`);
2. the keyless API is the free tier (truncated, `X-Afronomics-Free-Tier`);
3. the self-serve form issues a trial key at once and Resend accepts the key email;
4. a trial key unlocks the full history on the JSON API and the CSV.

Mail goes to Resend's test inbox (`delivered+…@resend.dev`), which accepts it without delivering it to anyone. The
founder still gets the usual desk note ("Pilot issued: Afronomics smoke test (QA)"). The key is masked in the log.

**Clean up after each run.** The run leaves a lead, a deal at stage `pilot`, and two trial keys. They would count
towards the D-004 gate. The agent's database connection runs updates but not deletes (deletes wait for a
confirmation that never comes), so neutralise the rows with:

```sql
update data_keys set revoked_at = now() where email like '%@resend.dev' and revoked_at is null;
update deals set stage = 'lost', next_step = 'None: smoke test row' where organisation = 'Afronomics smoke test (QA)';
```

The rows can then be deleted from the Supabase dashboard (founder):

```sql
delete from data_keys where email like '%@resend.dev';
delete from deals where organisation = 'Afronomics smoke test (QA)';
delete from leads where email like '%@resend.dev';
```

**Limit.** `af_trial_key_issue` allows three trial keys per domain in 90 days, and revoked keys still count. Each run
takes two `resend.dev` keys, so a second run fails "limited" until those rows are deleted.

**First run, 14 Oct 2026** (run 38550437546):
- 9 of 10 checks passed.
- The form issued a key and the email was accepted.
- The key unlocked 388 Kenya bond rows from 2010-03-29; the free tier gives 54.
- The CSV check failed only because the check was wrong: a key holder's CSV correctly starts with
  `# Licensed under your trial plan`, and the check has been fixed.
- Rows neutralised the same day:
  - keys 1 and 2 revoked;
  - deal 72 marked `lost`;
  - lead source `pilot:smoke-test` left in place.
