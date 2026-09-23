# Afronomics Feed

Kenya-first financial intelligence: banking, capital markets, and financial regulation. Primary sources. No tape noise.

This is a clean Next.js rebuild — not a scrape or clone of the prior live site.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Filesystem Markdown + YAML frontmatter (`gray-matter`)
- Deploy-ready for Vercel

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## How to add a Daily Brief

1. Create `content/briefs/your-slug.md`.
2. Use this frontmatter (all fields required except `asOf` and `gated`):

```yaml
---
title: "Your headline"
date: "2026-09-10"
authors:
  - "Afronomics Desk"
category: brief
labels:
  - Facts
  - Analysis
sources:
  - name: "Central Bank of Kenya"
    url: "https://www.centralbank.go.ke/"
    date: "2026-09-10"
asOf: "2026-09-10"
summary: "One sentence for indexes and RSS."
teaser:
  - "Free bullet one."
  - "Free bullet two."
  - "Free bullet three."
gated: true
---
```

3. Write the full body in Markdown below the frontmatter.
4. Optional but preferred: `topics` and `institutions` from `lib/taxonomy.ts`, plus a desk memo: `urgency` (`file` | `watch` | `cadence` | `reference`), `minutes`, `fileFor`, `soWhat`, `unknowns`.
5. The index at `/brief` and the article at `/brief/your-slug` pick it up automatically.

Weekly notes live in `content/weekly/`. Explainers live in `content/explainers/` (`category: weekly` or `explainer`). Explainers default to open (`gated: false`) unless you set `gated: true`.

### Trust rules for new copy

- Labels must be one or more of `Facts`, `Analysis`, `Opinion`.
- Every piece needs `sources[]` with `name`, `url`, and `date`.
- Any market figure needs `asOf`. If the figure is not copied from a cited public document, label it **EXAMPLE DATA** in the prose. Do not invent CBK or NSE prints and present them as fact.
- Do not use buy / sell / hold / overweight, price targets as advice, “guaranteed returns”, or personalized portfolio language.

## Deploy on Vercel

1. Push this repository to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Framework preset: Next.js. Build command: `npm run build`. Output: default.
4. No environment variables are required for the MVP.
5. After go-live, set the production domain. `metadataBase` in `app/layout.tsx` currently uses `https://afronomicsfeed.com`.

## What this MVP does not do

- Live M-Pesa or Stripe billing (checkout buttons are stubs)
- Live NSE quote redistribution or scraping (strip is static; tape links to [nse.co.ke](https://www.nse.co.ke/))
- Real authentication (Sign in is a mock toggle)
- Comments, tips, or UGC
- A CMS admin (edit Markdown on disk)

## Stretch included

- Dark / light toggle (class on `html`, remembered in `localStorage`)
- Client search over published teasers (`⌘K` / `Ctrl+K`)
- RSS of free teasers at `/rss.xml`

## Wave 4

Habit and willingness to pay — not more chrome.

- Desk memo fields on pieces: `urgency`, `minutes`, `fileFor`, `soWhat`, `unknowns` (memo gated on paid series)
- `/today` rebuilt as an 8-minute morning file + standing cadence (confirm on official sites)
- Pricing states who pays, what they buy, and who should not
- New brief: *When the T-bill result notice posts: a 12-minute file*

## Wave 3

- `/today` — morning file assembled from teasers + labelled tracker stubs
- `/institutions` and `/topics` — navigate by primary and subject
- Archive filters for series, Facts/Analysis/Opinion, and topic
- Regulatory tracker filter by authority
- Copy citation / copy link on articles; explainer table of contents
- New brief: *Anatomy of an NSE issuer announcement*

## Wave 2

- `/method` — house standard (labels, citations, bans, corrections)
- `/archive` — full file with type filters
- Article pages: lede preview on gated pieces, related briefs, newer/older in the same file
- Open Graph images (`next/og`) and Article JSON-LD
- Print stylesheet hides chrome and the paywall
