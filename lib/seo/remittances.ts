import type { QA } from "@/components/seo/Questions";
import { AFRICA_ISO3, banksDearest, countryName, loadRemittances, periodLabel, SDG_TARGET } from "@/lib/data/remittances";

const p = (n: number) => `${n.toFixed(2)}%`;
const usd = (pct: number) => `$${((200 * pct) / 100).toFixed(2)}`;

/** Search title, description and quick answers for /rates/remittances, from the corridor data. */
export function remittanceAnswers() {
  const f = loadRemittances();
  const all = f?.corridors ?? [];
  const period = f ? periodLabel(f.period) : "";
  const find = (src: string, dst: string) => all.find((c) => c.src === src && c.dst === dst);
  const ukKe = find("GBR", "KEN");
  const usNg = find("USA", "NGA");
  const title = ukKe && usNg
    ? `Cost of sending money to Africa: UK to Kenya ${p(ukKe.avg_cost_pct)}, US to Nigeria ${p(usNg.avg_cost_pct)}`
    : "What it costs to send money home to Africa, corridor by corridor";
  const description = all.length
    ? `The average cost of sending $200 to ${new Set(all.map((c) => c.dst)).size} African countries from ${new Set(all.map((c) => c.src)).size} sending countries, the cheapest service surveyed and how banks, mobile money and transfer companies compare. World Bank survey, ${period}.`
    : "The cost of sending money to African countries, corridor by corridor, from the World Bank's survey.";
  const within = all.filter((c) => AFRICA_ISO3.has(c.src));
  const abroad = all.filter((c) => !AFRICA_ISO3.has(c.src));
  const avg = (l: typeof all) => l.reduce((n, c) => n + c.avg_cost_pct, 0) / l.length;
  const items: QA[] = [];
  for (const [src, dst] of [["GBR", "KEN"], ["USA", "NGA"], ["ZAF", "ZWE"], ["USA", "GHA"]] as const) {
    const c = find(src, dst);
    if (!c) continue;
    items.push({
      q: `How much does it cost to send money from ${countryName(c.src_name)} to ${countryName(c.dst_name)}?`,
      a: `In the World Bank's survey of ${period}, sending the equivalent of $200 cost ${p(c.avg_cost_pct)} on average (about ${usd(c.avg_cost_pct)}) across ${c.services} services. The cheapest surveyed was ${c.cheapest.firm} at ${p(c.cheapest.cost_pct)}. Check the provider's own quote on the day you send.`,
    });
  }
  if (within.length && abroad.length) {
    items.push({
      q: "Why is it so expensive to send money between African countries?",
      a: `In the World Bank's survey of ${period}, sending $200 between African countries cost ${p(avg(within))} on average, against ${p(avg(abroad))} from outside Africa.${banksDearest().both ? ` Where banks were surveyed beside other providers, they were the dearest in ${banksDearest().dearest} of ${banksDearest().both} corridors.` : ""}`,
    });
  }
  items.push({
    q: "What is the global target for remittance costs?",
    a: `The UN Sustainable Development Goal 10.c aims to cut the cost of sending remittances to under ${SDG_TARGET}% by 2030, and to remove corridors costing more than 5%.`,
  });
  return { title, description, items };
}
