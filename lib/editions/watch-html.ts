import { d, esc, packCss, pct } from "@/lib/editions/pack-html";
import { kindLabels, type Figure } from "@/lib/registry";
import { sourceName } from "@/lib/registry";
import { site } from "@/lib/site";
import type { Line, Watch } from "@/lib/watch";

/**
 * The Watch pack as a print-ready A4 document (docs/rebuild/phase-5-plan.md), in the committee pack's style. Every
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

function lineRows(lines: Line[], sample: boolean, extra?: (l: Line) => string) {
  return lines
    .map((l) => {
      const own = sample ? l.median : (l.value?.value ?? null);
      const note = !sample && l.value?.note ? `<div class="small muted">${esc(l.value.note)}</div>` : "";
      return `<tr><td>${esc(l.label)}${note}</td><td class="num"><b>${fmt(own, l.unit)}</b></td>${extra ? extra(l) : ""}<td class="num">${fmt(l.median, l.unit)}<div class="small muted">${l.peers} SACCOs</div></td><td class="small">${sample ? "" : src(l.value)}</td></tr>`;
    })
    .join("");
}

export function watchHtml(w: Watch) {
  const s = w.subject;
  const sample = s.sample;
  const tier = s.tier ? `${s.tier} tier` : "no SASRA tier";
  const asOf = `31 Dec ${w.year}`;
  const colOwn = sample ? "Median SACCO" : esc(s.name);
  const sector = w.sector;
  const cover = `
  <section class="page"><div class="cover">
    <div><div class="brand">AFRONOMICS<span>WATCH PACK</span></div>
      <h1>${esc(s.name)}</h1>
      <p class="lede">${esc(kindLabels[s.kind])}, ${esc(tier)}${s.county ? `, ${esc(s.county)} County` : ""}. ${sample ? "A sample: every figure for the &ldquo;SACCO&rdquo; is the median of SASRA&rsquo;s large tier, so it describes no institution." : "Prepared for its board and management. Private: not for publication."}</p></div>
    <div><p class="lede">Figures for the SACCO are SASRA&rsquo;s, as at ${asOf}, the latest year it has published for each SACCO. Sector figures are SASRA&rsquo;s quarterly report${sector ? ` to ${d.format(new Date(`${sector.report}T00:00:00Z`))}` : ""}. Market figures are the latest auction results. Every figure names its source. Information, not advice.</p>
    <p class="small" style="color:#9aa3b5">Prepared ${d.format(new Date(w.generatedAt))} · ${esc(site.url.replace("https://", ""))}</p></div>
  </div></section>`;

  const p1 = `
  <section class="page">
    <div class="head"><h2>1. ${sample ? "The SACCO" : esc(s.name)} at a glance</h2><span class="muted">As at ${asOf}</span></div>
    <p>Size and results beside the median of every ${esc(kindLabels[s.kind].replace(/^D/, "d").replace(/^N/, "n"))} in SASRA&rsquo;s ${esc(tier)}. The median is worked out by code from SASRA&rsquo;s figures for each SACCO.</p>
    <table><thead><tr><th>Measure</th><th class="num">${colOwn}</th><th class="num">Tier median</th><th>Source</th></tr></thead>
    <tbody>${lineRows(w.size, sample)}</tbody></table>
    <p class="note">Source for the medians: SASRA Sacco Supervision Annual Report ${w.year}, Appendices III&ndash;IV. Where SASRA&rsquo;s report repeats total assets in the deposits column for a SACCO, its deposits are left out of the median.</p>
  </section>`;

  const p2 = `
  <section class="page">
    <div class="head"><h2>2. Soundness beside SASRA&rsquo;s standards</h2><span class="muted">As at ${asOf}</span></div>
    <p>Each ratio as SASRA published it, beside the level SASRA prescribes and the tier median. ${sample ? "" : "This page is for the SACCO&rsquo;s board and management only."}</p>
    <table><thead><tr><th>Ratio</th><th class="num">${colOwn}</th><th class="num">SASRA&rsquo;s standard</th><th class="num">Tier median</th><th>Source</th></tr></thead>
    <tbody>${lineRows(w.soundness, sample, (l) => `<td class="num small">${esc((l as Line & { standard: string }).standard)}</td>`)}</tbody></table>
    <p class="note">Prescribed levels as printed in SASRA&rsquo;s annual report (Appendices V&ndash;VI). Ratios are SASRA&rsquo;s, not recomputed.</p>
  </section>`;

  const p3 = sector
    ? `
  <section class="page">
    <div class="head"><h2>3. Deposit-taking SACCOs this quarter</h2><span class="muted">To ${d.format(new Date(`${sector.report}T00:00:00Z`))}</span></div>
    <p>The whole deposit-taking sector, from SASRA&rsquo;s Quarterly Statistical and Soundness Report. SASRA publishes no per-SACCO figures by quarter.</p>
    <table><thead><tr><th>Measure</th><th class="num">Latest quarter</th><th class="num">A year before</th><th class="num">Change</th><th class="num">SASRA&rsquo;s standard</th></tr></thead>
    <tbody>${sector.rows
      .map((r) => {
        const change = r.yearAgo == null ? "—" : r.unit === "%" ? `${(r.value - r.yearAgo >= 0 ? "+" : "−") + Math.abs(r.value - r.yearAgo).toFixed(2)} pts` : `${((r.value / r.yearAgo - 1) * 100).toFixed(1)}%`;
        return `<tr><td>${esc(r.label)}</td><td class="num"><b>${fmt(r.value, r.unit)}</b></td><td class="num">${fmt(r.yearAgo, r.unit)}</td><td class="num">${change}</td><td class="num small">${esc(r.prescribed ?? "")}</td></tr>`;
      })
      .join("")}</tbody></table>
    <p class="note">Source: <a href="${esc(sector.source)}">SASRA Quarterly Statistical and Soundness Report</a>. Changes worked out by code from SASRA&rsquo;s figures.</p>
  </section>`
    : "";

  const m = w.market;
  const p4 = `
  <section class="page">
    <div class="head"><h2>4. Where surplus funds earn</h2><span class="muted">As at ${d.format(new Date(`${m.asOf}T00:00:00Z`))}</span></div>
    <table><thead><tr><th>Option</th><th class="num">Rate</th><th class="num">After withholding tax</th><th>Source</th></tr></thead>
    <tbody>${m.options.map((o) => `<tr><td>${esc(o.name)}</td><td class="num">${pct(o.gross)}</td><td class="num"><b>${pct(o.net)}</b></td><td class="small"><a href="${esc(o.source)}">Source</a></td></tr>`).join("")}</tbody></table>
    ${
      m.ledger.length
        ? `<h3>Likely ranges for the next auction, ${d.format(new Date(`${m.ledger[0].auction}T00:00:00Z`))}</h3>
    <table><thead><tr><th>Bill</th><th class="num">Range</th><th>Published</th></tr></thead><tbody>${m.ledger
      .map((r) => `<tr><td>${r.tenor}-day</td><td class="num">${pct(r.low)} – ${pct(r.high)}</td><td class="small">${esc(r.writtenAt.replace("T", " ").slice(0, 16))} UTC, before bids ${Date.parse(r.auction) - 4 * 86400000 > Date.parse(w.generatedAt) ? "close" : "closed"}</td></tr>`)
      .join("")}</tbody></table>
    <p class="note">From the public forecast ledger (${esc(site.url.replace("https://", ""))}/record): ${m.record.graded ? `${m.record.inside} of ${m.record.graded} graded ranges held the result` : "no range graded yet"}. A range, not a recommendation to bid at any rate.</p>`
        : ""
    }
  </section>`;

  const p5 = `
  <section class="page">
    <div class="head"><h2>5. From the casebook</h2><span class="muted">Past failures and the questions they leave</span></div>
    ${
      w.cases.length
        ? w.cases.map((c) => `<h3>${esc(c.id)}: ${esc(c.title)}</h3><ul>${c.lessons.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`).join("")
        : `<p>The first cases (Kenyan bank failures and the 2016&ndash;2019 rate cap) are being checked line by line against the regulators&rsquo; documents. They appear here once signed off.</p>`
    }
    <div class="footer"><span>Afronomics Watch pack · ${sample ? "Sample" : "Private"}</span><span>Information, not advice. Figures as published by SASRA and CBK.</span></div>
  </section>`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Watch pack: ${esc(s.name)}</title><style>${packCss}</style></head><body>${cover}${p1}${p2}${p3}${p4}${p5}</body></html>`;
}
