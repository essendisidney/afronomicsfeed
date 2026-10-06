import type { QA } from "@/components/seo/Questions";
import { loadCmaFunds } from "@/lib/data/cma-mmf";
import { bondLabel, eurobondTable, loadEurobonds } from "@/lib/data/eurobonds";
import { fairBench, fundLeague } from "@/lib/data/kenya-rates";
import { latestByTenor, loadTbills } from "@/lib/data/kenya-tbills";
import { mobileLoanBoard } from "@/lib/data/mobile-loans";
import { loadSavingsBond } from "@/lib/data/nigeria-savings-bond";
import { policyBoard } from "@/lib/data/policy-rates";

/**
 * Search titles, descriptions and quick answers built from the same data the pages show, so what Google prints
 * is today's figure with its date. Every function returns null-safe text: a missing figure drops its answer.
 */

const WHT = 0.15; // Kenya withholding tax on interest, as in lib/data/kenya-rates.ts
const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const when = (iso: string) => day.format(new Date(iso));
const p = (n: number, d = 2) => `${n.toFixed(d)}%`;
const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-GB")}`;
const naira = (n: number) => `₦${n.toLocaleString("en-GB")}`;
const has = <T,>(x: T | null | undefined | false): x is T => Boolean(x);

export function tbillAnswers() {
  const latest = latestByTenor(loadTbills().rows);
  const b91 = latest.get(91)?.latest;
  const b182 = latest.get(182)?.latest;
  const b364 = latest.get(364)?.latest;
  const date = b364?.value_date ?? b91?.value_date;
  const title = b91 && b364 && date
    ? `Kenya T-bill rates this week: 91-day ${p(b91.weighted_avg_rate, 3)}, 364-day ${p(b364.weighted_avg_rate, 3)} (${when(date)})`
    : "Kenya Treasury bill rates this week";
  const description = b91 && b364 && date
    ? `Kenya Treasury bill rates at the CBK auction of ${when(date)}: 91-day ${p(b91.weighted_avg_rate, 3)}${b182 ? `, 182-day ${p(b182.weighted_avg_rate, 3)}` : ""}, 364-day ${p(b364.weighted_avg_rate, 3)}. Every auction since 2011, what KES 100,000 earns after tax, and a free CSV.`
    : "Every Central Bank of Kenya Treasury bill auction: rates, amounts offered, bids and subscription, with a free CSV.";
  const items: QA[] = [
    b91 && b364 && date
      ? {
          q: "What is the Treasury bill rate in Kenya this week?",
          a: `At the Central Bank of Kenya auction of ${when(date)}, the weighted average rates were: 91-day ${p(b91.weighted_avg_rate, 3)}${b182 ? `, 182-day ${p(b182.weighted_avg_rate, 3)}` : ""} and 364-day ${p(b364.weighted_avg_rate, 3)}. These are before the 15% withholding tax on interest.`,
        }
      : null,
    b364
      ? {
          q: "How much does KES 100,000 earn in a one-year Treasury bill?",
          a: `At the latest 364-day rate of ${p(b364.weighted_avg_rate, 3)}, KES 100,000 earns about ${kes(1000 * b364.weighted_avg_rate)} in a year before tax, or ${kes(1000 * b364.weighted_avg_rate * (1 - WHT))} after the 15% withholding tax.`,
        }
      : null,
    {
      q: "What is the minimum amount to buy a Treasury bill in Kenya?",
      a: "KES 50,000 at face value, bought through the Central Bank of Kenya's DhowCSD platform, a bank or a broker.",
    },
    {
      q: "How often are Kenya Treasury bills auctioned?",
      a: "Every week. Afronomics adds each result as soon as the Central Bank of Kenya publishes it, and keeps every auction since 2011 in one table.",
    },
  ].filter(has);
  return { title, description, items };
}

export function mobileLoanAnswers() {
  const loans = mobileLoanBoard();
  const bench = fairBench();
  const find = (name: string) => loans.find((l) => l.product.toLowerCase().includes(name));
  const fuliza = find("fuliza");
  const mshwari = find("m-shwari");
  const tala = find("tala");
  const cheapest = loans[0];
  const line = (l: (typeof loans)[number]) =>
    `${l.from ? "at least " : ""}${kes(l.costPer1000)} to borrow KES 1,000 for ${l.days} days, about ${Math.round(l.yearlySimple)}% a year${l.from ? " or more" : ""}`;
  const title = fuliza && mshwari
    ? `How much does Fuliza cost? Fuliza, M-Shwari and Tala compared on KES 1,000`
    : "What a mobile loan really costs in Kenya";
  const description = fuliza && mshwari
    ? `Borrowing KES 1,000 for 30 days costs ${kes(fuliza.costPer1000)} on Fuliza and ${kes(mshwari.costPer1000)} on M-Shwari, at the charges each provider publishes${bench ? `; the bank lending average is ${p(bench.lendingAvg)} a year` : ""}. Information, not advice.`
    : "The charge on KES 1,000 for a month on Kenya's mobile loans, quoted from each provider's own page, beside the bank average.";
  const items: QA[] = [
    fuliza
      ? {
          q: "How much does Fuliza cost?",
          a: `Fuliza charges a one-off 1% access fee plus a daily fee by balance. At the charges Safaricom publishes, that is ${line(fuliza)}.`,
        }
      : null,
    mshwari ? { q: "How much does an M-Shwari loan cost?", a: `M-Shwari charges 9% for a one-month loan (7.5% fee plus 1.5% excise duty): ${line(mshwari)}.` } : null,
    tala ? { q: "How much does a Tala loan cost?", a: `Tala publishes interest starting at 0.3% a day: ${line(tala)}. The actual charge depends on the loan offered.` } : null,
    cheapest && bench
      ? {
          q: "Is a mobile loan cheaper than a bank loan?",
          a: `No. The lowest published charge here is ${cheapest.product}: ${line(cheapest)}. The average bank lending rate is ${p(bench.lendingAvg)} a year (Central Bank of Kenya), about ${kes((1000 * bench.lendingAvg * 30) / 365 / 100)} on KES 1,000 for a month.`,
        }
      : null,
  ].filter(has);
  return { title, description, items };
}

export function fundAnswers() {
  const funds = fundLeague();
  const bench = fairBench();
  const best = funds[0];
  const cma = loadCmaFunds();
  const bnKes = (n: number) => `KES ${(n / 1e9).toFixed(1)} billion`;
  const title = best
    ? `Kenya money market fund rates today: top yield ${p(best.gross)} (${when(best.readOn)})`
    : "Kenya money market fund yields today";
  const description = best
    ? `${funds.length} Kenyan money market funds ranked by the yield each manager publishes, after the 15% withholding tax. Highest read on ${when(best.readOn)}: ${best.name}, ${p(best.gross)} a year. Daily history and CSV. Information, not advice.`
    : "Kenyan money market fund yields as each manager publishes them, ranked after tax, with daily history.";
  const items: QA[] = [
    best
      ? {
          q: "Which money market fund pays the most in Kenya?",
          a: `Of the ${funds.length} funds Afronomics reads daily, ${best.name} published the highest yield on ${when(best.readOn)}: ${p(best.gross)} a year, about ${p(best.net)} after the 15% withholding tax. Yields change daily and past yields are not a promise; this table covers only the funds listed.`,
        }
      : null,
    cma && cma.rows.length >= 2
      ? {
          q: "How many money market funds are there in Kenya?",
          a: `${cma.rows.length}, holding ${bnKes(cma.total_aum_kes)} at ${when(cma.as_of)}, according to the Capital Markets Authority's quarterly report (${cma.rows.filter((r) => r.currency === "USD").length} of them invest in dollars).`,
        }
      : null,
    cma && cma.rows.length >= 2
      ? {
          q: "What is the biggest money market fund in Kenya?",
          a: `${cma.rows[0].fund}, with ${bnKes(cma.rows[0].aum_kes)} (${cma.rows[0].share_pct.toFixed(1)}% of all money market fund assets) at ${when(cma.as_of)}, followed by ${cma.rows[1].fund} at ${bnKes(cma.rows[1].aum_kes)}, per the Capital Markets Authority. Size is not the same as return.`,
        }
      : null,
    {
      q: "How is money market fund interest taxed in Kenya?",
      a: "Interest from a money market fund is taxed at 15% withholding tax, deducted by the fund manager. A fund quoting 10% a year leaves about 8.5% after tax, before any fees.",
    },
    bench && best
      ? {
          q: "Money market fund or Treasury bill?",
          a: `After tax, the 364-day Treasury bill pays about ${p(bench.bill364Net)} and the highest fund read here about ${p(best.net)}. A fund lets you withdraw within days; a bill is held to maturity and needs at least KES 50,000.`,
        }
      : null,
  ].filter(has);
  return { title, description, items };
}

export function savingsBondAnswers() {
  const o = loadSavingsBond()?.latest;
  const b2 = o?.bonds.find((b) => b.years === 2);
  const b3 = o?.bonds.find((b) => b.years === 3);
  const title = o && b2 && b3
    ? `FGN Savings Bond ${o.offer}: ${p(b2.rate, 3)} for 2 years, ${p(b3.rate, 3)} for 3 years`
    : "FGN Savings Bond: this month's rates, dates and minimum";
  const description = o && b2 && b3
    ? `Nigeria's ${o.offer} FGN Savings Bond: 2-year ${p(b2.rate, 3)}, 3-year ${p(b3.rate, 3)}${o.closing ? `, open until ${when(o.closing)}` : ""}${o.minimum_naira ? `, from ${naira(o.minimum_naira)}` : ""}. Read from the DMO's offer document.`
    : "Nigeria's FGN Savings Bond: the latest offer's rates, dates and minimum, read from the DMO's own offer document.";
  const items: QA[] = [
    o && b2 && b3
      ? { q: "What is the FGN Savings Bond rate this month?", a: `For the ${o.offer} offer, the Debt Management Office set ${p(b2.rate, 3)} a year on the 2-year bond and ${p(b3.rate, 3)} on the 3-year bond, with interest paid every quarter.` }
      : null,
    o?.minimum_naira
      ? { q: "What is the minimum to buy the FGN Savings Bond?", a: `${naira(o.minimum_naira)}${o.unit_naira ? `, in units of ${naira(o.unit_naira)}` : ""}${o.maximum_naira ? `, up to ${naira(o.maximum_naira)}` : ""}.` }
      : null,
    o?.opening && o.closing
      ? { q: "When does this month's savings bond offer close?", a: `The ${o.offer} offer opens ${when(o.opening)} and closes ${when(o.closing)}${o.settlement ? `; settlement is ${when(o.settlement)}` : ""}.` }
      : null,
    o?.minimum_naira && b2
      ? { q: "How much interest does ₦5,000 earn in the savings bond?", a: `At ${p(b2.rate, 3)}, ${naira(o.minimum_naira)} earns about ${naira(Math.round((o.minimum_naira * b2.rate) / 400))} every quarter on the 2-year bond${b3 ? ` and about ${naira(Math.round((o.minimum_naira * b3.rate) / 400))} on the 3-year bond` : ""}.` }
      : null,
  ].filter(has);
  return { title, description, items };
}

export function policyAnswers() {
  const { rows } = policyBoard();
  const kenya = rows.find((r) => r.market === "kenya");
  const top = rows[0];
  const low = rows.at(-1);
  const list = rows.slice(0, 4).map((r) => `${r.market_name} ${p(r.rate)}`).join(", ");
  const title = rows.length ? `Central bank rates in Africa today: ${list}` : "African central-bank policy rates today";
  const description = rows.length
    ? `The policy rate of ${rows.length} African central banks as each bank publishes it: ${rows.map((r) => `${r.market_name} ${p(r.rate)}`).join(", ")}. Beside each, the latest one-year Treasury bill.`
    : "The policy rate of each African central bank as the bank itself publishes it, beside the latest one-year Treasury bill.";
  const items: QA[] = [
    kenya ? { q: "What is the Central Bank Rate in Kenya?", a: `${p(kenya.rate)}${kenya.date_as_printed ? `, as the Central Bank of Kenya prints it (dated ${kenya.date_as_printed})` : ""}.` } : null,
    top && low
      ? { q: "Which African central bank has the highest policy rate?", a: `Of the ${rows.length} central banks Afronomics reads, ${top.market_name} has the highest at ${p(top.rate)} and ${low.market_name} the lowest at ${p(low.rate)}.` }
      : null,
    { q: "What does a central bank's policy rate do?", a: "It is the rate the central bank sets for lending to banks. Banks' loan and deposit rates, and Treasury bill yields, tend to follow it." },
  ].filter(has);
  return { title, description, items };
}

export function eurobondAnswers() {
  const countries = Object.values(loadEurobonds()?.countries ?? {});
  const tables = countries.map((c) => ({ c, rows: eurobondTable(c) })).filter((t) => t.rows.length);
  const span = (rows: ReturnType<typeof eurobondTable>) => {
    const ys = rows.map((r) => r.yield);
    return `${p(Math.min(...ys))} to ${p(Math.max(...ys))}`;
  };
  const title = tables.length
    ? `Eurobond yields today: ${tables.map(({ c, rows }) => `${c.country} ${span(rows)}`).join(", ")}`
    : "African Eurobond yields today";
  const description = tables.length
    ? `The yield on every ${tables.map(({ c }) => c.country).join(" and ")} Eurobond, read from ${tables.map(({ c }) => `the ${c.publisher}`).join(" and ")}: ${tables
        .map(({ c, rows }) => `${c.country} ${span(rows)} (${when(c.latest.date)})`)
        .join("; ")}. With the change on the day and over four weeks.`
    : "What African governments pay to borrow in dollars: the yield on each Eurobond, from the government's own report.";
  const items: QA[] = [
    ...tables.map(({ c, rows }) => {
      const short = rows[0];
      const long = rows.at(-1)!;
      return {
        q: `What are ${c.country}'s Eurobond yields today?`,
        a: `On ${when(c.latest.date)}, the ${c.publisher} put ${c.country}'s ${rows.length} Eurobonds at ${span(rows)}: ${p(short.yield, 3)} on the ${bondLabel(short)} and ${p(long.yield, 3)} on the ${bondLabel(long)}.`,
      };
    }),
    { q: "What is a Eurobond?", a: "A bond a government sells to foreign investors in a foreign currency, usually US dollars. The government pays a fixed coupon and repays the dollars at the end." },
    { q: "Why does a Eurobond yield matter?", a: "It is what lenders charge that government for dollars today. A higher yield means a new Eurobond would cost the government more, and banks and companies borrowing dollars in the same country are often priced off it." },
  ].filter(has);
  return { title, description, items };
}
