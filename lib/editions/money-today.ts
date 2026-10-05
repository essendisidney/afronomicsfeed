import { billIndexLatest, indexShort } from "@/lib/data/bill-index";
import { fairBench } from "@/lib/data/kenya-rates";
import { policyBoard } from "@/lib/data/policy-rates";
import { overnightFx } from "@/lib/editions/morning";
import { swCountry, swCurrency } from "@/lib/editions/morning-sw";

/**
 * "What do you need today?": four doors, one for each kind of visitor, each with the live figures that person
 * checks and the tool that answers their next question. Built once and rendered on the homepage and the
 * low-data page, in English or Kiswahili. Every figure comes from the site's own datasets; a door whose
 * figures are missing comes back with no lines and the page says so.
 */

export type Lang = "en" | "sw";
export type Door = { id: string; who: string; question: string; lines: { k: string; v: string }[]; links: { href: string; label: string }[] };

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-GB")}`;
const pct = (n: number) => `${n.toFixed(2)}%`;
const signed = (n: number, digits = 2) => `${n > 0 ? "+" : n < 0 ? "−" : "±"}${Math.abs(n).toFixed(digits)}`;

const copy = {
  en: {
    title: "What do you need today?",
    note: "Saving and borrowing figures are for Kenya; more countries are being added.",
    missing: "Today’s figures did not load; the tools below still work.",
    saving: ["Saving", "Where does my money earn most?"],
    bestAfterTax: (name: string) => `Best after tax: ${name}`,
    billAfterTax: "One-year Treasury bill, after tax",
    savingsAfterTax: "Bank savings account, average, after tax",
    tenThousand: "KES 10,000 for a year, after tax: best option vs savings account",
    vs: "vs",
    fundsRanked: "Money market funds ranked",
    savingsFair: "Is my savings rate fair?",
    borrowing: ["Borrowing", "Is the loan I was offered fair?"],
    lendingAvg: "Bank lending rate, average",
    cbr: "Central Bank Rate",
    fiftyThousand: "Simple interest on KES 50,000 for a year at the bank average",
    loanCheck: "Check a loan offer in shillings",
    mobile: "What a mobile loan really costs",
    banks: "What banks pay and charge",
    business: ["Business & trade", "What did my currency do overnight?"],
    kesMove: "Shillings per US dollar (overnight change; + means the shilling gained)",
    biggest: (name: string) => `Biggest overnight move against the dollar: ${name}`,
    converter: "Every African currency, converter",
    policy: "Central-bank rates",
    institutions: ["Institutions", "Where are African rates heading?"],
    asbi: `${indexShort}: ten-market one-year bill index`,
    week: "bp on the week",
    highLow: "Highest / lowest one-year bill",
    policyVsBill: "Policy rate vs bill, eight markets",
    api: "Data API and CSV downloads",
    pack: "Committee pack",
  },
  sw: {
    title: "Unahitaji nini leo?",
    note: "Takwimu za akiba na mikopo ni za Kenya; nchi nyingine zinaongezwa.",
    missing: "Takwimu za leo hazikupatikana; zana zilizo hapa chini bado zinafanya kazi.",
    saving: ["Kuweka akiba", "Pesa yangu itapata faida zaidi wapi?"],
    bestAfterTax: (name: string) => `Bora zaidi baada ya kodi: ${name}`,
    billAfterTax: "Hati ya hazina ya mwaka mmoja, baada ya kodi",
    savingsAfterTax: "Akaunti ya akiba benki, wastani, baada ya kodi",
    tenThousand: "KES 10,000 kwa mwaka, baada ya kodi: chaguo bora dhidi ya akaunti ya akiba",
    vs: "dhidi ya",
    fundsRanked: "Mifuko ya soko la fedha kwa mpangilio",
    savingsFair: "Je, riba ya akiba yangu ni ya haki?",
    borrowing: ["Kukopa", "Je, mkopo niliopewa ni wa haki?"],
    lendingAvg: "Riba ya mikopo ya benki, wastani",
    cbr: "Riba ya Benki Kuu (CBR)",
    fiftyThousand: "Riba ya kawaida kwa KES 50,000 kwa mwaka, kwa wastani wa benki",
    loanCheck: "Pima mkopo uliopewa kwa shilingi",
    mobile: "Gharama halisi ya mkopo wa simu",
    banks: "Benki zinalipa na kutoza kiasi gani",
    business: ["Biashara", "Sarafu yangu ilifanya nini usiku?"],
    kesMove: "Shilingi kwa dola moja (mabadiliko ya usiku; + ni shilingi kuimarika)",
    biggest: (name: string) => `Mabadiliko makubwa zaidi dhidi ya dola: ${name}`,
    converter: "Sarafu zote za Afrika, kibadilishaji",
    policy: "Riba za benki kuu",
    institutions: ["Taasisi", "Riba za Afrika zinaelekea wapi?"],
    asbi: `${indexShort}: kipimo cha hati za mwaka mmoja, masoko kumi`,
    week: "bp kwa wiki",
    highLow: "Hati ya mwaka mmoja: juu kabisa / chini kabisa",
    policyVsBill: "Riba ya benki kuu dhidi ya hati, masoko manane",
    api: "API ya takwimu na CSV",
    pack: "Kifurushi cha kamati",
  },
} as const;

export async function buildMoneyDoors(lang: Lang = "en") {
  const t = copy[lang];
  const country = (name: string) => (lang === "sw" ? swCountry(name) : name);
  const bench = fairBench();
  const kenyaPolicy = policyBoard().rows.find((r) => r.market === "kenya");
  const index = billIndexLatest();
  const fx = await overnightFx();
  const kesMove = fx.moves.find((m) => m.code === "KES");
  const biggest = fx.moves.find((m) => m.code !== "KES");
  const high = index?.contributions[0];
  const low = index?.contributions.at(-1);

  const doors: Door[] = [
    {
      id: "saving",
      who: t.saving[0],
      question: t.saving[1],
      lines: bench
        ? [
            { k: t.bestAfterTax(bench.bestFundName), v: pct(bench.bestFundNet) },
            { k: t.billAfterTax, v: pct(bench.bill364Net) },
            { k: t.savingsAfterTax, v: pct(bench.savingsAvg * 0.85) },
            { k: t.tenThousand, v: `${kes((10000 * bench.bestFundNet) / 100)} ${t.vs} ${kes((10000 * bench.savingsAvg * 0.85) / 100)}` },
          ]
        : [],
      links: [
        { href: "/rates/kenya/money-market-funds", label: t.fundsRanked },
        { href: "/rates/kenya/check", label: t.savingsFair },
      ],
    },
    {
      id: "borrowing",
      who: t.borrowing[0],
      question: t.borrowing[1],
      lines: bench
        ? [
            { k: t.lendingAvg, v: pct(bench.lendingAvg) },
            ...(kenyaPolicy ? [{ k: t.cbr, v: pct(kenyaPolicy.rate) }] : []),
            { k: t.fiftyThousand, v: kes((50000 * bench.lendingAvg) / 100) },
          ]
        : [],
      links: [
        { href: "/rates/kenya/check", label: t.loanCheck },
        { href: "/rates/kenya/mobile-loans", label: t.mobile },
        { href: "/rates/kenya", label: t.banks },
      ],
    },
    {
      id: "business",
      who: t.business[0],
      question: t.business[1],
      lines: [
        ...(kesMove ? [{ k: t.kesMove, v: `${kesMove.now.toFixed(2)} (${signed(kesMove.changePct)}%)` }] : []),
        ...(biggest
          ? [{ k: t.biggest(lang === "sw" ? swCurrency(biggest.code, biggest.name) : biggest.name), v: `${signed(biggest.changePct)}%` }]
          : []),
      ],
      links: [
        { href: "/markets", label: t.converter },
        { href: "/rates/policy", label: t.policy },
      ],
    },
    {
      id: "institutions",
      who: t.institutions[0],
      question: t.institutions[1],
      lines: [
        ...(index ? [{ k: t.asbi, v: `${index.latest.value.toFixed(2)}%${index.bpsWeek != null ? ` (${signed(index.bpsWeek, 0)} ${t.week})` : ""}` }] : []),
        ...(high && low ? [{ k: t.highLow, v: `${country(high.market.country)} ${pct(high.rate)} / ${country(low.market.country)} ${pct(low.rate)}` }] : []),
      ],
      links: [
        { href: "/rates/policy", label: t.policyVsBill },
        { href: "/developers", label: t.api },
        { href: "/pack", label: t.pack },
      ],
    },
  ];
  return { title: t.title, note: t.note, missing: t.missing, doors };
}
