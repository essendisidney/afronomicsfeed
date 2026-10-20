import type { ScoreNote } from "@/lib/call-it-core";
import { tenorLabel } from "@/lib/data/kenya-tbills";
import { esc, para, shell } from "@/lib/rate-alerts";
import { site } from "@/lib/site";

/** The Call it score email laid out (lib/call-it-core.ts scoreNote writes the words), as text and HTML. */
export function scoreEmail(note: ScoreNote) {
  const link = `${site.url}/markets/kenya-tbills/call-it?utm_source=email&utm_medium=score&utm_campaign=call-it`;
  const footer = "A game, not advice. You get this because you entered Call it for this auction: one email for each round you enter.";
  const text = [
    ...note.lead,
    "",
    ...note.rows.map((r) => `${tenorLabel[r.tenor]}: you called ${r.call}, result ${r.result}, miss ${r.miss} (our range ${r.ours})`),
    "",
    ...note.after,
    "",
    `Call the next round: ${link}`,
    "",
    footer,
  ].join("\n");
  const cell = "padding:6px 8px;border-bottom:1px solid #e4dbd3;text-align:right;white-space:nowrap;";
  const head = `${cell}font-size:12px;color:#6c5e55;font-weight:600;`;
  const table = `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:4px 0 16px;font-size:14px;">
<tr><td style="${head}text-align:left;">Bill</td><td style="${head}">You</td><td style="${head}">Result</td><td style="${head}">Miss</td><td style="${head}">Our range</td></tr>
${note.rows
  .map(
    (r) =>
      `<tr><td style="${cell}text-align:left;">${esc(tenorLabel[r.tenor])}</td><td style="${cell}">${esc(r.call)}</td><td style="${cell}font-weight:600;">${esc(r.result)}</td><td style="${cell}">${esc(r.miss)}</td><td style="${cell}color:#6c5e55;">${esc(r.ours)}</td></tr>`,
  )
  .join("\n")}
</table>`;
  const html = shell(
    "CALL IT",
    `${para(note.lead)}${table}${para(note.after.flatMap((l) => [l, ""]))}
<p style="margin:16px 0 18px;"><a href="${esc(link)}" style="display:inline-block;background:#1d1512;color:#ffffff;text-decoration:none;font-weight:600;padding:11px 20px;border-radius:999px;">Call the next round</a></p>`,
    `${esc(footer)}<br>Afronomics · <a href="${site.url}" style="color:#6c5e55;">afronomicsfeed.com</a>`,
  );
  return { subject: note.subject, text, html };
}
