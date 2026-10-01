import { morningLines, morningLongDate, morningShortDate, morningSigned, morningTitle, type MorningNote } from "@/lib/editions/morning";
import { site } from "@/lib/site";

/**
 * The Morning as an HTML email. Table layout and inline styles only, so it renders the same in Gmail,
 * Outlook and the phone clients most readers use. Colours follow the site: night header, jacaranda accent.
 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const utm = "utm_source=email&utm_medium=morning&utm_campaign=morning";
const link = (path: string) => `${site.url}${path}${path.includes("?") ? "&" : "?"}${utm}`;

const base = "font-family:Archivo,Helvetica,Arial,sans-serif;color:#121826;";
const muted = "color:#636b7d;font-size:12px;line-height:18px;";
const row = "padding:8px 0;border-bottom:1px solid #e0e3df;font-size:14px;line-height:20px;";

export function morningEmailHtml(note: MorningNote, unsubscribeUrl = `${site.url}/subscribe?unsubscribe=1`) {
  const lines = morningLines(note);
  const fx = note.fx.moves.slice(0, 6);
  const head = `
    <tr><td style="background:#0e1524;padding:22px 28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
        <td style="${base}color:#f5f6f4;font-size:18px;font-weight:700;letter-spacing:1px;">AFRONOMICS <span style="color:#a08cff;font-size:11px;letter-spacing:3px;">MORNING</span></td>
        <td align="right" style="${base}color:#8b93a7;font-size:12px;">${esc(morningLongDate.format(new Date(note.day)))}</td>
      </tr></table>
    </td></tr>`;
  const standfirst = lines.length
    ? `<tr><td style="padding:24px 28px 8px;${base}font-size:18px;line-height:27px;font-weight:600;">${lines.map(esc).join("<br>")}</td></tr>`
    : "";
  const fxRows = fx
    .map(
      (m) => `<tr>
        <td style="${row}${base}"><a href="${link(`/markets/currencies/usd-${m.code.toLowerCase()}`)}" style="color:#121826;text-decoration:none;">${esc(m.name)}</a></td>
        <td align="right" style="${row}${base}font-variant-numeric:tabular-nums;">${m.now.toFixed(m.now >= 100 ? 1 : 3)}</td>
        <td align="right" style="${row}${base}font-weight:600;color:${m.changePct > 0.005 ? "#0f7f57" : m.changePct < -0.005 ? "#c2352b" : "#636b7d"};">${morningSigned(m.changePct)}%</td>
      </tr>`,
    )
    .join("");
  const auctionRows = note.auctions
    .map(
      (a) => `<tr>
        <td style="${row}${base}"><a href="${link(a.market.href)}" style="color:#121826;text-decoration:none;font-weight:600;">${esc(a.market.country)}</a> ${a.tenor}-day</td>
        <td align="right" style="${row}${base}font-variant-numeric:tabular-nums;">${a.rate.toFixed(2)}%</td>
        <td align="right" style="${row}${base}color:${a.bps == null || a.bps === 0 ? "#636b7d" : a.bps > 0 ? "#c2352b" : "#0f7f57"};">${a.bps == null ? "" : `${morningSigned(a.bps, 0)} bps`}</td>
      </tr>`,
    )
    .join("");
  const due = note.due.length ? `<p style="${base}${muted}margin:10px 0 0;">Due: ${note.due.map((d) => `${esc(d.market.country)} (${d.expected === note.day ? "today" : "tomorrow"})`).join(", ")}.</p>` : "";
  const stories = note.stories
    .slice(0, 5)
    .map(
      (s) => `<tr><td style="${row}${base}">
        <a href="${s.url}" style="color:#121826;text-decoration:none;font-weight:600;">${esc(s.title)}</a>
        <div style="${muted}">${esc(s.publisher)}${s.countries[0] ? ` · ${esc(s.countries[0].name)}` : ""}</div>
      </td></tr>`,
    )
    .join("");
  const board = note.board
    .slice(0, 10)
    .map((b) => `<td style="padding:6px 8px 6px 0;${base}font-size:12px;white-space:nowrap;"><span style="color:#636b7d;">${esc(b.market.iso)}</span> <strong>${b.rate.toFixed(2)}%</strong></td>`)
    .join("");

  const section = (title: string, body: string, href?: string, label?: string) =>
    body
      ? `<tr><td style="padding:18px 28px 6px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
            <td style="${base}font-size:13px;font-weight:700;color:#5b3fd6;">${esc(title)}</td>
            ${href ? `<td align="right"><a href="${link(href)}" style="${base}font-size:12px;color:#636b7d;">${esc(label ?? "More")}</a></td>` : ""}
          </tr></table>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${body}</table>
        </td></tr>`
      : "";

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(morningTitle(note))}</title></head>
<body style="margin:0;background:#f5f6f4;">
<span style="display:none;max-height:0;overflow:hidden;">${esc(lines.join(" ").slice(0, 140))}</span>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f6f4;padding:16px 0;"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">
  ${head}
  ${standfirst}
  ${section("Overnight, against the dollar", fxRows, "/markets", "All rates")}
  ${note.auctions.length ? section("Auction results in", auctionRows + (due ? `<tr><td colspan="3">${due}</td></tr>` : ""), "/markets/tbills", "T-bill monitor") : due ? `<tr><td style="padding:12px 28px 0;">${due}</td></tr>` : ""}
  ${section("Headlines", stories, "/news", "The Wire")}
  <tr><td style="padding:18px 28px 6px;">
    <div style="${base}font-size:13px;font-weight:700;color:#5b3fd6;">364-day bills, latest</div>
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>${board}</tr></table>
  </td></tr>
  <tr><td style="padding:22px 28px 26px;">
    <a href="${link("/morning")}" style="display:inline-block;background:#121826;${base}color:#f5f6f4;font-size:14px;font-weight:600;padding:10px 18px;border-radius:999px;text-decoration:none;">Open the full Morning</a>
  </td></tr>
  <tr><td style="background:#ebedea;padding:16px 28px;${base}${muted}">
    Every figure links to its source. Compiled by Afronomics from central-bank results, the daily FX reference and publisher feeds, at ${esc(morningShortDate.format(new Date(note.generatedAt)))} ${new Date(note.generatedAt).toISOString().slice(11, 16)} UTC.
    Information, not advice. <a href="${unsubscribeUrl}" style="color:#636b7d;">Unsubscribe</a> · <a href="${link("/")}" style="color:#636b7d;">afronomicsfeed.com</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}
