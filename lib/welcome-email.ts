import { fairBench } from "@/lib/data/kenya-rates";
import { site } from "@/lib/site";

/**
 * The one email a new subscriber gets straight away: the free guide, today's two headline figures and what to
 * expect. Plain HTML that reads well in any mail app, and a text version.
 */
export function welcomeEmail(unsubscribeUrl: string) {
  const guide = `${site.url}/guides/where-your-shilling-earns-most?utm_source=email&utm_medium=email&utm_campaign=welcome`;
  const check = `${site.url}/rates/kenya/check?utm_source=email&utm_medium=email&utm_campaign=welcome`;
  const b = fairBench();
  const facts = b
    ? [
        `The one-year Treasury bill pays ${b.bill364Gross.toFixed(2)}% a year, about ${b.bill364Net.toFixed(2)}% after tax.`,
        `The highest money market fund we read pays about ${b.bestFundNet.toFixed(2)}% after tax (${b.bestFundName}).`,
        `Banks pay ${b.savingsAvg.toFixed(2)}% on savings accounts on average (Central Bank of Kenya).`,
      ]
    : [];
  const subject = "Your guide: where your shilling earns most";
  const text = [
    "Welcome to Afronomics.",
    "",
    `Your free guide — every savings option side by side, after tax, and what KES 100,000 earns in a year:`,
    guide,
    "",
    ...(facts.length ? ["Today, from the source:", ...facts.map((f) => `- ${f}`), ""] : []),
    "What to expect:",
    "- The Morning, every weekday at 7:00 (East Africa time): rates, currencies and auction results in two minutes.",
    "- The Weekly, every Monday: the week in Africa's money.",
    "",
    `Been offered a rate? Check it in seconds: ${check}`,
    "",
    "Every figure links to its source. Information, not advice.",
    `Reply to this email any time — it reaches the desk.`,
    "",
    `Stop these emails: ${unsubscribeUrl}`,
  ].join("\n");
  const p = 'style="margin:0 0 14px;font:16px/1.55 Georgia,serif;color:#1a1a1a"';
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f5f2">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e2da;border-radius:14px;padding:28px">
<p style="margin:0 0 4px;font:600 12px/1.4 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#6d4bd8">Afronomics</p>
<h1 style="margin:0 0 16px;font:700 26px/1.2 Georgia,serif;color:#111">Welcome. Here is your guide.</h1>
<p ${p}>Every place a Kenyan can put savings — money market funds, bank accounts, Treasury bills and bonds, SACCOs — side by side, after tax, with what KES 100,000 earns in a year.</p>
<p style="margin:0 0 22px"><a href="${guide}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font:600 15px Arial,sans-serif;padding:12px 20px;border-radius:999px">Open the guide</a></p>
${facts.length ? `<p style="margin:0 0 8px;font:600 14px Arial,sans-serif;color:#111">Today, from the source</p><ul style="margin:0 0 18px;padding-left:20px;font:15px/1.55 Georgia,serif;color:#1a1a1a">${facts.map((f) => `<li>${f}</li>`).join("")}</ul>` : ""}
<p style="margin:0 0 8px;font:600 14px Arial,sans-serif;color:#111">What to expect</p>
<ul style="margin:0 0 18px;padding-left:20px;font:15px/1.55 Georgia,serif;color:#1a1a1a"><li><b>The Morning</b>, every weekday at 7:00 East Africa time: rates, currencies and auction results in two minutes.</li><li><b>The Weekly</b>, every Monday: the week in Africa&rsquo;s money.</li></ul>
<p ${p}>Been offered a rate by a bank or SACCO? <a href="${check}" style="color:#6d4bd8">Check it in seconds</a>.</p>
<p style="margin:18px 0 0;font:13px/1.5 Arial,sans-serif;color:#6b6b6b">Every figure links to its source. Information, not advice. Reply to this email any time — it reaches the desk.<br>${site.houseCredit}. <a href="${unsubscribeUrl}" style="color:#6b6b6b">Stop these emails</a>.</p>
</div></body></html>`;
  return { subject, html, text };
}
