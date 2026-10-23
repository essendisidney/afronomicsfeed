import { documentHtml, exhibit, section, type DocMeta } from "@/lib/documents/design";
import { d, esc, pct } from "@/lib/editions/pack-html";
import { kindLabels, type Figure } from "@/lib/registry";
import { sourceName } from "@/lib/registry";
import { site } from "@/lib/site";
import type { Line, Watch } from "@/lib/watch";

/**
 * The Watch pack (docs/rebuild/phase-5-plan.md) in the house document design (lib/documents/design.ts). Every
 * figure names its source; the soundness page sets each ratio beside SASRA's prescribed level and the tier median,
 * with no verdict. For the sample, the "SACCO" column is the tier median itself, so no institution is described.
 */

const fmt = (v: number | null | undefined, unit: string) =>
  v == null
    ? "—"
    : unit === "%"
      ? pct(v)
      : unit === "KES bn"
        ? `KES ${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} bn`
        : `${v.toLocaleString("en-US")} ${unit}`;

const src = (f: Figure | null) =>
  f ? `<a href="${esc(f.source)}">${esc(sourceName(f.source, f.report))}${f.page ? `, p. ${f.page}` : ""}</a>` : "";

/** "+4.2%" for amounts, "+0.35 pts" for ratios; a dash when either year is missing. */
const fmtChange = (v: number | null, unit: string) =>
  v == null ? "—" : `${v >= 0 ? "+" : "−"}${unit === "%" ? `${Math.abs(v).toFixed(2)} pts` : `${Math.abs(v).toFixed(1)}%`}`;

/** The tier's middle half (25th to 75th percentile): a spread, with no position or rank. */
const fmtSpread = (l: Line) => (l.q1 == null || l.q3 == null ? "—" : `${fmt(l.q1, l.unit)} – ${fmt(l.q3, l.unit)}`);

function lineHead(colOwn: string, sample: boolean, extra = "") {
  return `<thead><tr><th>Measure</th><th class="num">${colOwn}<div class="small muted">change on the year</div></th>${extra}<th class="num">Tier median<div class="small muted">middle half of the tier</div></th>${sample ? "" : "<th>Source</th>"}</tr></thead>`;
}

function lineRows(lines: Line[], sample: boolean, extra?: (l: Line) => string) {
  return lines
    .map((l) => {
      const own = sample ? l.median : (l.value?.value ?? null);
      const note = !sample && l.value?.note ? `<div class="small muted">${esc(l.value.note)}</div>` : "";
      return `<tr><td>${esc(l.label)}${note}</td><td class="num"><b>${fmt(own, l.unit)}</b><div class="small muted">${fmtChange(l.change, l.unit)}</div></td>${extra ? extra(l) : ""}<td class="num">${fmt(l.median, l.unit)}<div class="small muted">${fmtSpread(l)}</div><div class="small muted">${l.peers} SACCOs</div></td>${sample ? "" : `<td class="small">${src(l.value)}</td>`}</tr>`;
    })
    .join("");
}

/** The sample's back page: what a subscribing SACCO gets, how it is delivered and how often it changes. */
function offerPage(n: number, year: number) {
  return section(
    n,
    "What a subscribing SACCO receives",
    `<p class="lead">This sample is the real layout with real figures, for a demo SACCO that does not exist. A subscribing SACCO receives the same pack about itself.</p>
<ul>
<li><b>Its own figures</b> from SASRA’s annual report for ${year}, each beside the median and middle half of its SASRA tier, with the change on the year before.</li>
<li><b>Its soundness ratios</b> as SASRA published them, beside SASRA’s prescribed levels and the tier median. This page goes only to that SACCO’s board and management; it is never published.</li>
<li><b>The sector this quarter</b> from SASRA’s quarterly report, and <b>where surplus funds earn</b> after withholding tax, from the latest auctions and fund yields.</li>
<li><b>A private link</b> for the named contacts, valid for 120 days and withdrawable at any time, and a PDF for the board papers.</li>
<li><b>A member widget</b> for the SACCO’s own website, showing only the figures SASRA published for it, with source and date.</li>
</ul>
<p>Per-SACCO figures change once a year, when SASRA publishes its annual report (about nine months after year-end). The sector and market pages change every quarter. Every figure names its source and date. Information, not advice.</p>
<p>Ask for a pilot pack at <a href="${site.url}/for-institutions/saccos">${site.url.replace("https://", "")}/for-institutions/saccos</a>.</p>`,
    { aside: "For SACCO boards and management" },
  );
}

export function watchHtml(w: Watch) {
  const s = w.subject;
  const sample = s.sample;
  const tier = s.tier ? `${s.tier} tier` : "no SASRA tier";
  const asOf = `31 Dec ${w.year}`;
  const colOwn = sample ? "Demo SACCO" : esc(s.name);
  const sector = w.sector;
  const sectorDate = sector ? d.format(new Date(`${sector.report}T00:00:00Z`)) : "";
  const m = w.market;
  const meta: DocMeta = {
    series: "Watch pack",
    title: s.name,
    subtitle: `${kindLabels[s.kind]}, ${tier}${s.county ? `, ${s.county} County` : ""}. ${sample ? "SAMPLE. The demo SACCO does not exist: each of its figures is the median of SASRA’s large tier, so the pack describes no institution." :"Size, soundness against SASRA’s standards, the sector this quarter and where surplus funds earn."}`,
    number: `AF-WATCH-${sample ? "SAMPLE" : (s.slug ?? "SACCO").toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 24)}-${w.generatedAt.slice(0, 7)}`,
    edition: `SASRA year ${w.year}`,
    asOf: `${w.year}-12-31`,
    preparedFor: sample ? undefined : `the board and management of ${s.name}`,
    sample,
    sections: [
      `${sample ? "The demo SACCO" : s.name} at a glance`,
      "Soundness beside SASRA’s standards",
      ...(sector ? ["Deposit-taking SACCOs this quarter"] : []),
      "Where surplus funds earn",
      "From the casebook",
      ...(sample ? ["What a subscribing SACCO receives"] : []),
    ],
    method: [
      `Figures for the SACCO are SASRA’s, as at ${asOf}, the latest year SASRA has published for each SACCO. Ratios are SASRA’s, not recomputed.`,
      "Tier medians and the middle half of the tier (25th to 75th percentile) are worked out by code from SASRA’s figures for every SACCO in the same tier; the method is at /method/peer-comparison. Where SASRA’s report repeats total assets in the deposits column for a SACCO, its deposits are left out. No rank or score is worked out.",
      "Change on the year is worked out by code from two published figures: per cent for amounts, percentage points for ratios. In the sample it is the median of the tier’s changes.",
      "Sector figures are SASRA’s quarterly report. Market figures are the latest auction results and fund managers’ published yields, after Kenya’s withholding tax for residents.",
      "Ranges for the next auction come from the public forecast ledger, written before bids close and graded against the result. A range is not a recommendation to bid at any rate.",
    ],
    sources: [
      { name: "SASRA, Sacco Supervision Annual Report", note: `${w.year}, Appendices III–VI`, url: "https://www.sasra.go.ke" },
      ...(sector ? [{ name: "SASRA, Quarterly Statistical and Soundness Report", note: `to ${sectorDate}`, url: sector.source }] : []),
      { name: "Central Bank of Kenya", note: "Treasury bill and bond auction results", url: "https://www.centralbank.go.ke" },
      { name: "Fund managers", note: "published money market fund yields", url: `${site.url}/rates/kenya/money-market-funds` },
      { name: "Afronomics forecast ledger", url: `${site.url}/record` },
    ],
    licence: sample ? "Sample edition: free to share in full with credit to Afronomics." : "Prepared for the named SACCO’s board and management. Not for publication.",
    href: "/watch",
    pdf: sample ? "/documents/watch-pack-sample" : undefined,
    letter: true,
  };

  let n = 0;
  const parts = [
    section(
      ++n,
      meta.sections[0],
      `<p class="lead">Size and results beside the median of every ${esc(kindLabels[s.kind].replace(/^D/, "d").replace(/^N/, "n"))} in SASRA’s ${esc(tier)}.</p>
${exhibit({ title: "Size and results", body: `<table>${lineHead(colOwn, sample)}<tbody>${lineRows(w.size, sample)}</tbody></table>`, source: `SASRA Sacco Supervision Annual Report ${w.year}, Appendices III–IV`, asOf: `${w.year}-12-31` })}`,
      { aside: `As at ${asOf}` },
    ),
    section(
      ++n,
      meta.sections[1],
      `<p class="lead">Each ratio as SASRA published it, beside the level SASRA prescribes and the tier median.</p>
${exhibit({ title: "Soundness ratios", body: `<table>${lineHead(colOwn, sample, `<th class="num">SASRA’s standard</th>`).replace("<th>Measure</th>", "<th>Ratio</th>")}<tbody>${lineRows(w.soundness, sample, (l) => `<td class="num small">${esc((l as Line & { standard: string }).standard)}</td>`)}</tbody></table>`, note: "Prescribed levels as printed in SASRA’s annual report (Appendices V–VI).", source: `SASRA Sacco Supervision Annual Report ${w.year}`, asOf: `${w.year}-12-31` })}`,
      { aside: `As at ${asOf}` },
    ),
    sector
      ? section(
          ++n,
          "Deposit-taking SACCOs this quarter",
          `<p class="lead">The whole deposit-taking sector. SASRA publishes no per-SACCO figures by quarter.</p>
${exhibit({
  title: "The sector against a year before",
  body: `<table><thead><tr><th>Measure</th><th class="num">Latest quarter</th><th class="num">A year before</th><th class="num">Change</th><th class="num">SASRA’s standard</th></tr></thead><tbody>${sector.rows
    .map((r) => {
      const change = r.yearAgo == null ? "—" : r.unit === "%" ? `${(r.value - r.yearAgo >= 0 ? "+" : "−") + Math.abs(r.value - r.yearAgo).toFixed(2)} pts` : `${((r.value / r.yearAgo - 1) * 100).toFixed(1)}%`;
      return `<tr><td>${esc(r.label)}</td><td class="num"><b>${fmt(r.value, r.unit)}</b></td><td class="num">${fmt(r.yearAgo, r.unit)}</td><td class="num">${change}</td><td class="num small">${esc(r.prescribed ?? "")}</td></tr>`;
    })
    .join("")}</tbody></table>`,
  note: "Changes worked out by code from SASRA’s figures.",
  source: "SASRA Quarterly Statistical and Soundness Report",
  asOf: sector.report,
})}`,
          { aside: `To ${sectorDate}` },
        )
      : "",
    section(
      ++n,
      "Where surplus funds earn",
      `${exhibit({ title: "Options for surplus funds, after withholding tax", body: `<table><thead><tr><th>Option</th><th class="num">Rate</th><th class="num">After withholding tax</th><th>Source</th></tr></thead><tbody>${m.options.map((o) => `<tr><td>${esc(o.name)}</td><td class="num">${pct(o.gross)}</td><td class="num"><b>${pct(o.net)}</b></td><td class="small"><a href="${esc(o.source)}">Source</a></td></tr>`).join("")}</tbody></table>`, source: "Central Bank of Kenya; fund managers’ published yields", asOf: m.asOf })}
${
  m.ledger.length
    ? exhibit({
        title: `Likely ranges for the next auction, ${d.format(new Date(`${m.ledger[0].auction}T00:00:00Z`))}`,
        body: `<table><thead><tr><th>Bill</th><th class="num">Range</th><th>Published</th></tr></thead><tbody>${m.ledger
          .map((r) => `<tr><td>${r.tenor}-day</td><td class="num">${pct(r.low)} – ${pct(r.high)}</td><td class="small">${esc(r.writtenAt.replace("T", " ").slice(0, 16))} UTC, before bids ${Date.parse(r.auction) - 4 * 86400000 > Date.parse(w.generatedAt) ? "close" : "closed"}</td></tr>`)
          .join("")}</tbody></table>`,
        note: `${m.record.graded ? `${m.record.inside} of ${m.record.graded} graded ranges held the result` : "No range graded yet"}. A range, not a recommendation to bid at any rate.`,
        source: `Afronomics forecast ledger, ${site.url.replace("https://", "")}/record`,
        asOf: m.asOf,
      })
    : ""
}`,
      { aside: `As at ${d.format(new Date(`${m.asOf}T00:00:00Z`))}` },
    ),
    section(
      ++n,
      "From the casebook",
      w.cases.length
        ? w.cases.map((c) => `<h3>${esc(c.id)}: ${esc(c.title)}</h3><ul>${c.lessons.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`).join("")
        : `<p>The first cases (Kenyan bank failures and the 2016–2019 rate cap) are being checked line by line against the regulators’ documents. They appear here once signed off.</p>`,
      { aside: "Past failures and the questions they leave" },
    ),
    sample ? offerPage(++n, w.year) : "",
  ];
  return documentHtml(meta, parts.join(""));
}
