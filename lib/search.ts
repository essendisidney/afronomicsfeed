import { billMarkets, loadBillMarket } from "@/lib/data/sovereign-bills";
import { getAllArticles, toIndexItem } from "./content";
import { countries } from "./data/countries";
import { deskLabels, indicatorDefs } from "./data/indicators";
import { articleHref, categoryLabel } from "./format";
import { footerNav } from "./site";

import type { SearchHit } from "./search-core";

export type { SearchHit };

export function buildSearchIndex(): SearchHit[] {
  const countryHits = countries.map((country) => ({
    href: `/countries/${country.slug}`,
    title: country.name,
    kicker: `Country file · ${country.region}`,
    summary: `${country.iso} · ${country.currency} · data, DFI projects and headlines`,
  }));

  const indicatorHits = indicatorDefs.map((def) => ({
    href: `/data/${def.slug}`,
    title: def.label,
    kicker: `Data · ${deskLabels[def.desk]}`,
    summary: `All 54 countries ranked, with history and CSV. ${def.about}`,
  }));

  const articleHits = getAllArticles()
    .map(toIndexItem)
    .map((article) => ({
      href: articleHref(article.category, article.slug),
      title: article.title,
      kicker: categoryLabel(article.category),
      summary: article.summary,
    }));

  // Markets on the monitor: the T-bill page, the latest auction, and the pack, so "Zambia T-bill" lands on the data.
  const marketHits = billMarkets.flatMap((m) => {
    const rows = loadBillMarket(m.slug).rows;
    const latest = rows[0];
    const y = rows.find((r) => r.tenor === 364);
    return [
      {
        href: m.href,
        title: `${m.country} Treasury bills`,
        kicker: `T-bill monitor · ${m.publisher}`,
        summary: `${y ? `364-day ${y.rate.toFixed(2)}% (${y.date}). ` : ""}Every auction since ${rows.at(-1)?.date.slice(0, 4) ?? ""}, CSV, alerts, pack. ${m.currency} ${m.iso}`,
      },
      ...(latest
        ? [
            {
              href: m.slug === "kenya" ? `/markets/kenya-tbills/${latest.date}` : `/markets/tbills/${m.slug}/${latest.date}`,
              title: `${m.country} T-bill auction, ${latest.date}`,
              kicker: "Latest auction",
              summary: `${latest.tenor}-day ${latest.rate.toFixed(2)}% · what it means for ${m.currency} savers · source document`,
            },
          ]
        : []),
    ];
  });

  const toolHits = [
    { href: "/ask", title: "Ask the data", kicker: "Tool", summary: "A question about African rates, answered from the source." },
    { href: "/rates/kenya/check", title: "Is my rate fair?", kicker: "Tool", summary: "Check a Kenya savings or loan rate against the bill, the best fund and the bank averages." },
    { href: "/rates/nigeria/savings-bond", title: "FGN Savings Bond: this month’s offer", kicker: "Nigeria", summary: "Rates, dates and the minimum for Nigeria’s monthly savings bond, from the DMO’s offer document." },
    { href: "/learn", title: "Learn money, from the basics", kicker: "Learn", summary: "Plain lessons on saving, loans, rates, inflation and currencies; savings and loan calculators; glossary in English and Kiswahili." },
    { href: "/rates/kenya/mobile-loans", title: "What a mobile loan really costs", kicker: "Comparison", summary: "M-Shwari, Tala and more: KES 1,000 for a month, and as a yearly rate beside a bank loan." },
    { href: "/rates/policy", title: "Central-bank policy rates", kicker: "Dataset", summary: "Each central bank’s policy rate from its own site, beside the one-year bill and the gap." },
    { href: "/rates/nigeria/check", title: "Is my rate fair? Nigeria", kicker: "Tool", summary: "Check a naira savings or loan rate against Treasury bills, the FGN Savings Bond and the CBN's savings, prime and maximum lending rates." },
    { href: "/rates/ghana/check", title: "Is my rate fair? Ghana", kicker: "Tool", summary: "Check a cedi savings or loan rate against Treasury bills and the Bank of Ghana's savings, deposit and lending averages." },
    { href: "/rates/kenya/saccos", title: "SACCO dividend and interest rates", kicker: "Comparison", summary: "What Kenya's regulated SACCOs paid on shares and deposits (SASRA), beside T-bills, money market funds and bank savings." },
    { href: "/rates/remittances", title: "Cost of sending money home", kicker: "Comparison", summary: "What it costs to send $200 to 36 African countries from 27 sending countries, the cheapest service and banks vs mobile money. World Bank survey." },
    { href: "/rates/kenya/money-market-funds", title: "Kenya money market fund yields", kicker: "League table", summary: "Yields read from each manager, ranked after tax, with daily history; and all 59 licensed funds by size from the CMA." },
    { href: "/rates/kenya", title: "Where the shilling earns most", kicker: "Comparison", summary: "Bills, bonds, money market funds and bank rates after tax." },
    { href: "/markets/bill-index", title: "African Sovereign Bill Index (ASBI)", kicker: "Index", summary: "Weekly average one-year rate across ten markets, since 2016." },
    { href: "/markets/bill-index/release", title: "ASBI weekly release", kicker: "Index", summary: "The Monday release in a fixed format for editors." },
    { href: "/alerts", title: "Alerts", kicker: "Tool", summary: "The auction result on your phone the minute it lands." },
    { href: "/morning", title: "The Morning", kicker: "Edition", summary: "Africa's markets before 7am, every weekday." },
    { href: "/morning/sw", title: "Asubuhi ya Afronomics (Kiswahili)", kicker: "Edition", summary: "Masoko ya Afrika kabla ya saa moja, kwa Kiswahili." },
    { href: "/radio", title: "Radio bulletin", kicker: "Edition", summary: "Sixty seconds on the price of money, English and Kiswahili, free for any station." },
    { href: "/lite", title: "Low-data version", kicker: "Tool", summary: "The whole Morning and every rate in under 3 KB." },
    { href: "/reference", title: "The reference", kicker: "Method", summary: "Definitions, stable URLs, the timeliness record and corrections." },
    { href: "/for-institutions", title: "For institutions", kicker: "Product", summary: "Committee packs, API, licences and widgets for SACCOs, pension funds, treasuries, fintechs and DFIs. Free samples." },
    { href: "/pack", title: "Investment Committee Pack", kicker: "Product", summary: "The monthly pack for SACCOs, insurers and pension schemes, for ten markets." },
    { href: "/prices", title: "Price guide", kicker: "Pricing", summary: "Everything Afronomics sells, in shillings and dollars." },
    { href: "/jobs", title: "Jobs", kicker: "Jobs", summary: "Treasury, risk, research and analyst roles across African finance." },
    { href: "/developers", title: "Data API", kicker: "Developers", summary: "African auction results as JSON, no key." },
  ];

  const pageHits = footerNav.map((item) => ({
    href: item.href,
    title: item.label,
    kicker: "Section",
    summary: "",
  }));

  return [...toolHits, ...marketHits, ...countryHits, ...indicatorHits, ...articleHits, ...pageHits];
}

