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
    { href: "/", title: "Today", kicker: "Section", summary: "What changed in African money today, who it touches, and our forecast record." },
    { href: "/numbers", title: "Rates & data (Numbers)", kicker: "Section", summary: "Every number we keep, by question: borrowing, savings, loans, policy rates, currencies, economies." },
    { href: "/tools", title: "Tools and calculators", kicker: "Section", summary: "Every calculator and checker in one place: T-bills, M-PESA and Fuliza, net salary, loan cost, IPOs, savings goals, inflation, fair rates, chamas, licensed lenders." },    { href: "/compare", title: "Compare", kicker: "Section", summary: "Savers, lenders and governments side by side, in the same units." },
    { href: "/stories", title: "Stories", kicker: "Section", summary: "Every brief, weekly note and explainer, filterable by type and topic." },
    { href: "/rates/kenya/mpesa-charges", title: "M-PESA and Fuliza charges calculator", kicker: "Tool", summary: "What sending, withdrawing and Fuliza cost you, by transaction or by month, from Safaricom's published charges." },
    { href: "/rates/kenya/net-salary", title: "Net salary calculator Kenya (PAYE, SHIF, Housing Levy)", kicker: "Tool", summary: "Gross pay to take-home with KRA's PAYE bands, SHIF, the Housing Levy and your NSSF; or the gross to ask for a take-home you want." },
    { href: "/rates/kenya/loan-cost", title: "Loan true-cost calculator Kenya (flat vs reducing, APR)", kicker: "Tool", summary: "Any loan quote turned into its true yearly rate, with fees, flat or reducing balance, against the banks' average lending rate." },
    { href: "/diaspora", title: "Diaspora Desk: money home for Kenyans abroad", kicker: "Tool", summary: "The cheapest way to send $200 to Kenya from where you live, what KES 100,000 earns at home after tax, how investing from abroad works, and what to check first." },
    { href: "/rates/kenya/savings-goal", title: "Savings goal planner Kenya", kicker: "Tool", summary: "How much to save each month to reach a goal by a date, in a money market fund, a bank deposit or a savings account, at today's after-tax rates." },
    { href: "/rates/kenya/inflation", title: "Kenya inflation calculator: what your shilling has lost", kicker: "Tool", summary: "What a sum from any month since 2010 is worth in today's prices, from KNBS's CPI, and whether Treasury bills or a bank deposit kept up." },
    { href: "/markets/kenya-tbills/calculator", title: "Treasury bill calculator", kicker: "Tool", summary: "What a Kenya T-bill costs, pays back and leaves you after 15% tax, at the latest auction." },
    { href: "/markets/ipo-calculator", title: "IPO calculator: Quickmart and Dangote", kicker: "Tool", summary: "How many shares your money buys in an open offer, what comes back if it is scaled back, and what they are worth if the price moves." },
    { href: "/rates/kenya/check", title: "Is my rate fair?", kicker: "Tool", summary: "Check a Kenya savings or loan rate against the bill, the best fund and the bank averages." },
    { href: "/rates/nigeria/savings-bond", title: "FGN Savings Bond: this month’s offer", kicker: "Nigeria", summary: "Rates, dates and the minimum for Nigeria’s monthly savings bond, from the DMO’s offer document." },
    { href: "/learn", title: "Learn money, from the basics", kicker: "Learn", summary: "Plain lessons on saving, loans, rates, inflation and currencies; savings and loan calculators; glossary in English and Kiswahili." },
    { href: "/rates/kenya/mobile-loans", title: "What a mobile loan really costs", kicker: "Comparison", summary: "M-Shwari, Tala and more: KES 1,000 for a month, and as a yearly rate beside a bank loan." },
    { href: "/markets/eurobonds", title: "Eurobond yields: Nigeria and Kenya", kicker: "Dataset", summary: "The yield on every Nigerian and Kenyan Eurobond, from the DMO and the Central Bank of Kenya, with the daily and four-week change." },
    { href: "/rates/policy", title: "Central-bank policy rates", kicker: "Dataset", summary: "Each central bank’s policy rate from its own site, beside the one-year bill and the gap." },
    { href: "/rates/nigeria/check", title: "Is my rate fair? Nigeria", kicker: "Tool", summary: "Check a naira savings or loan rate against Treasury bills, the FGN Savings Bond and the CBN's savings, prime and maximum lending rates." },
    { href: "/rates/ghana/check", title: "Is my rate fair? Ghana", kicker: "Tool", summary: "Check a cedi savings or loan rate against Treasury bills and the Bank of Ghana's savings, deposit and lending averages." },
    { href: "/rates/kenya/saccos", title: "SACCO dividend and interest rates", kicker: "Comparison", summary: "What Kenya's regulated SACCOs paid on shares and deposits (SASRA), beside T-bills, money market funds and bank savings." },
    { href: "/rates/what-readers-paid", title: "What readers paid", kicker: "Reader reports", summary: "What readers in six African countries paid this month for food, fuel, fares, cooking gas and rent, and the rates their banks and SACCOs pay and charge. Add yours." },
    { href: "/rates/remittances", title: "Cost of sending money home", kicker: "Comparison", summary: "What it costs to send $200 to 36 African countries from 27 sending countries, the cheapest service and banks vs mobile money. World Bank survey." },
    { href: "/rates/kenya/money-market-funds", title: "Kenya money market fund yields", kicker: "League table", summary: "Yields read from each manager, ranked after tax, with daily history; and all 59 licensed funds by size from the CMA." },
    { href: "/guides/where-your-shilling-earns-most", title: "Free guide: where your shilling earns most", kicker: "Guide", summary: "T-bills, bonds, money market funds, SACCOs and bank accounts side by side: the rate after tax and what KES 100,000 earns in a year." },
    { href: "/rates/kenya", title: "Where the shilling earns most", kicker: "Comparison", summary: "Bills, bonds, money market funds and bank rates after tax." },
    { href: "/markets/bill-index", title: "African Sovereign Bill Index (ASBI)", kicker: "Index", summary: "Weekly average one-year rate across ten markets, since 2016." },
    { href: "/markets/bill-index/release", title: "ASBI weekly release", kicker: "Index", summary: "The Monday release in a fixed format for editors." },
    { href: "/alerts", title: "Alerts", kicker: "Tool", summary: "The auction result on your phone the minute it lands." },
    { href: "/morning", title: "The Morning", kicker: "Edition", summary: "Africa's markets before 07:30, every weekday." },
    { href: "/morning/sw", title: "Asubuhi ya Afronomics (Kiswahili)", kicker: "Edition", summary: "Masoko ya Afrika kabla ya saa moja na nusu asubuhi, kwa Kiswahili." },
    { href: "/lite", title: "Low-data version", kicker: "Tool", summary: "The whole Morning and every rate in under 3 KB." },
    { href: "/reference", title: "The reference", kicker: "Method", summary: "Definitions, stable URLs, the timeliness record and corrections." },
    { href: "/for-institutions", title: "For institutions", kicker: "Product", summary: "Committee packs, API, licences and widgets for SACCOs, pension funds, treasuries, fintechs and DFIs. Free samples." },
    { href: "/pack", title: "Investment Committee Pack", kicker: "Product", summary: "The monthly pack for SACCOs, insurers and pension schemes, for ten markets." },
    { href: "/prices", title: "Price guide", kicker: "Pricing", summary: "Everything Afronomics sells, in shillings and dollars." },
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

