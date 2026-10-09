import { eurobondAnswers, fundAnswers, mobileLoanAnswers, policyAnswers, savingsBondAnswers, tbillAnswers } from "@/lib/seo/answers";
import { remittanceAnswers } from "@/lib/seo/remittances";
import { site } from "@/lib/site";

export const revalidate = 3600;

/**
 * /llms.txt — the guide AI assistants and answer engines read: what Afronomics is, how to cite it, the pages that
 * answer the common questions, and today's key figures with their dates and publishers. Built from the same answer
 * text the pages print (lib/seo), so it never says something the site does not.
 */
export function GET() {
  const u = (path: string) => `${site.url}${path}`;
  const sections: { path: string; name: string; a: { title: string; description: string; items: { q: string; a: string }[] } }[] = [
    { path: "/markets/kenya-tbills", name: "Kenya Treasury bill rates", a: tbillAnswers() },
    { path: "/rates/policy", name: "African central-bank policy rates", a: policyAnswers() },
    { path: "/rates/kenya/money-market-funds", name: "Kenya money market fund yields", a: fundAnswers() },
    { path: "/rates/kenya/mobile-loans", name: "What a mobile loan costs in Kenya (M-Shwari, Tala, Fuliza)", a: mobileLoanAnswers() },
    { path: "/rates/nigeria/savings-bond", name: "Nigeria FGN Savings Bond", a: savingsBondAnswers() },
    { path: "/markets/eurobonds", name: "Nigeria and Kenya Eurobond yields", a: eurobondAnswers() },
    { path: "/rates/remittances", name: "Cost of sending money to African countries", a: remittanceAnswers() },
  ];

  const lines: string[] = [
    `# ${site.name}`,
    "",
    `> ${site.promise}`,
    "",
    `${site.name} (${site.url}) reads each figure from the publisher's own document — central banks, debt management offices, regulators, the World Bank, each provider's own price page — automatically, the day it is published, and links that source on every page. It is free to read. ${site.houseCredit}.`,
    "",
    "## How to use and cite",
    "",
    `- Cite as: "${site.name}, <page title>, <date>" with the page URL. Each page names the original publisher; cite both where you can.`,
    "- Figures are as published, before tax unless a page says otherwise. Pages show the date each figure was published; prefer the newest.",
    "- Information, not advice: Afronomics does not recommend any investment, lender or provider.",
    `- Free machine-readable data: ${u("/developers")} (JSON API at ${u("/api/v1/tbills")}, CSV downloads on each data page).`,
    "",
    "## Key figures today",
    "",
  ];
  for (const s of sections) {
    lines.push(`### [${s.name}](${u(s.path)})`, "", s.a.description, "");
    for (const qa of s.a.items) lines.push(`- **${qa.q}** ${qa.a}`);
    lines.push("");
  }
  lines.push(
    "## Tools for readers",
    "",
    `- [Is my rate fair? Kenya](${u("/rates/kenya/check")}): a savings or loan rate against the T-bill, money market funds and the bank averages.`,
    `- [Is my rate fair? Nigeria](${u("/rates/nigeria/check")}) and [Ghana](${u("/rates/ghana/check")}).`,
    `- [Where the shilling earns most](${u("/rates/kenya")}): bills, bonds, funds and bank rates after tax.`,
    `- [SACCO dividend and interest rates](${u("/rates/kenya/saccos")}).`,
    `- [What readers paid](${u("/rates/what-readers-paid")}): medians of reader-reported prices; labelled as reader reports, not official statistics.`,
    `- [Learn money, from the basics](${u("/learn")}): plain lessons in English, Kiswahili, French, Portuguese and Arabic.`,
    "",
    "## Data and markets",
    "",
    `- [T-bill monitor, ten African markets](${u("/markets/tbills")}) and the [African Sovereign Bill Index](${u("/markets/bill-index")}).`,
    `- [Kenya Treasury bonds](${u("/markets/kenya-bonds")}), [borrowing costs](${u("/markets/borrowing-costs")}), [currencies](${u("/markets")}).`,
    `- [Inflation by country](${u("/data/inflation")}), [54 country files](${u("/countries")}), [data hub](${u("/data")}).`,
    `- [Analysis](${u("/brief")}): data stories, each with its sources and arithmetic.`,
    "",
    "## About",
    "",
    `- [Sources and method](${u("/method")}) · [About](${u("/about")}) · [Corrections](${u("/corrections")}) · Contact: ${site.contactEmail}`,
    "",
  );
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
