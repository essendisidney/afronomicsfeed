import type { Metadata } from "next";
import Link from "next/link";
import { DiasporaSendPicker, type SendRow } from "@/components/data/DiasporaSendPicker";
import { fxRef, remitCorridors, remitSurvey } from "@/lib/found-data";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Questions } from "@/components/seo/Questions";
import { FollowUp } from "@/components/ui/FollowUp";
import { convertAmount, loadFxQuote, type FxQuote } from "@/lib/data/fx";
import { loadKenyaRates, rateOptions } from "@/lib/data/kenya-rates";
import { latestByTenor, loadTbills } from "@/lib/data/kenya-tbills";
import { corridorsTo, countryName, loadRemittances, periodLabel } from "@/lib/data/remittances";
import { quoteBill, TBILL_MIN_FACE } from "@/lib/tbill-calc";
import { site } from "@/lib/site";
import { fitDescription, fitTitle } from "@/lib/seo";

export const revalidate = 3600;

/**
 * Diaspora Desk (preview): money home for Kenyans abroad. Every figure comes from data the site already keeps — the World
 * Bank's remittance survey (lib/data/remittances.ts), CBK auctions and bank averages and fund managers' yields
 * (lib/data/kenya-rates.ts, lib/tbill-calc.ts) and the daily FX quote (lib/data/fx.ts). The facts in "Investing from
 * abroad" and "Check first" are checked against primary sources in docs/rebuild/diaspora-source-checks.md.
 */

const AMOUNT = 100_000;
const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;
const pct = (n: number) => `${n.toFixed(2)}%`;
const link = "font-semibold text-forest underline underline-offset-2";
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
/** "2026-10-19" -> "19 Oct 2026"; "2026-08" -> "August 2026". */
const when = (iso: string) => (/^\d{4}-\d{2}$/.test(iso) ? monthFmt.format(new Date(`${iso}-01T00:00:00Z`)) : dayFmt.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`)));

export const metadata: Metadata = {
  title: fitTitle("Diaspora Desk: money home for Kenyans abroad"),
  description: fitDescription(
    "The cheapest way to send $200 home to Kenya, what KES 100,000 earns there in a year after tax, how investing from abroad works, and what to check first.",
  ),
  alternates: { canonical: `${site.url}/diaspora` },
};

type Earn = { key: string; name: string; detail: string; rate: number; earned: number; source: string; sourceLabel: string; href?: string };

/** What KES 100,000 earns in a year after 15% withholding tax, in each place, from the site's own rate data. */
function earnings(): Earn[] {
  const out: Earn[] = [];
  const bill = latestByTenor(loadTbills().rows).get(364)?.latest;
  if (bill) {
    const q = quoteBill(bill.weighted_avg_rate, 364, AMOUNT, "pay");
    out.push({
      key: "bill",
      name: "364-day Treasury bill",
      detail: `${pct(bill.weighted_avg_rate)} average at the auction value-dated ${when(bill.value_date)}; held to maturity`,
      rate: bill.weighted_avg_rate,
      earned: q.net,
      source: bill.source,
      sourceLabel: `CBK auction results, ${when(bill.value_date)}`,
      href: "/markets/kenya-tbills/calculator",
    });
  }
  const { options } = rateOptions();
  const funds = options.filter((o) => o.group === "Money market funds").sort((a, b) => b.net - a.net);
  const fund = (key: string, label: string, f: (typeof funds)[number]) =>
    out.push({
      key,
      name: `${label}: ${f.name}`,
      detail: `${pct(f.gross)} a year as published by ${f.publisher}, read ${when(f.asOf)}; moves daily, not fixed`,
      rate: f.gross,
      earned: (AMOUNT * f.net) / 100,
      source: f.source,
      sourceLabel: `${f.publisher}, ${when(f.asOf)}`,
      href: "/rates/kenya/money-market-funds",
    });
  if (funds.length) fund("fund-best", "Highest-yielding fund we track", funds[0]);
  if (funds.length > 2) fund("fund-mid", "Typical fund (the middle one)", funds[Math.floor(funds.length / 2)]);
  const bank = loadKenyaRates().bank_rates;
  const row = bank?.rows?.[0];
  if (bank && row) {
    out.push({
      key: "savings",
      name: "Bank savings account, average",
      detail: `${pct(row.savings)} a year, commercial banks' weighted average for ${when(row.month)}`,
      rate: row.savings,
      earned: AMOUNT * (row.savings / 100) * 0.85,
      source: bank.source,
      sourceLabel: `CBK weighted average rates, ${when(row.month)}`,
    });
  }
  return out;
}

const fxCodes = ["USD", "GBP", "EUR"] as const;
const fxSymbol: Record<(typeof fxCodes)[number], string> = { USD: "$", GBP: "£", EUR: "€" };

function inCurrencies(amountKes: number, fx: FxQuote | null) {
  if (!fx) return null;
  return fxCodes
    .map((code) => {
      const v = convertAmount(amountKes, "KES", code, fx.rates);
      return v == null ? null : `${fxSymbol[code]}${v.toFixed(0)}`;
    })
    .filter(Boolean)
    .join(" · ");
}

export default async function DiasporaPage() {
  const file = loadRemittances();
  const period = file ? periodLabel(file.period) : "";
  const rows: SendRow[] = corridorsTo("kenya").map((c) => ({
    src: c.src,
    name: countryName(c.src_name),
    services: c.services,
    avgPct: c.avg_cost_pct,
    cheapest: { firm: c.cheapest.firm, type: c.cheapest.type, pct: c.cheapest.cost_pct },
  }));
  const fx = await loadFxQuote();
  const fxDate = fx ? dayFmt.format(new Date(fx.updated)) : null;
  const earn = earnings();
  const kesPerUsd = fx?.rates.KES ?? null;
  const { ref: fxFound } = await fxRef();

  const items = [
    {
      q: "What is the cheapest way to send money to Kenya?",
      a: rows.length
        ? `It depends on where you send from. In the World Bank's survey of ${period}, the cheapest service for $200 cost ${rows
            .map((r) => `$${((200 * r.cheapest.pct) / 100).toFixed(2)} from ${r.name}`)
            .slice(0, 3)
            .join(", ")}. Check the service's own quote on the day you send.`
        : "The World Bank's survey data is being compiled.",
    },
    {
      q: "Can I buy Kenyan Treasury bills from abroad?",
      a: `The Central Bank of Kenya sells bills and bonds through DhowCSD, an online account opened on its portal or app. Its FAQ lists an ID or passport, a photo and a KRA PIN, and the account is linked to a commercial bank account that approves it. The minimum is KES 50,000.`,
    },
    {
      q: "How do I check that a fund manager is licensed?",
      a: "Search the Capital Markets Authority's list of licensees (licensees.cma.or.ke), which has separate lists for fund managers and approved collective investment schemes such as money market funds.",
    },
  ];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Today" }, { href: "/tools", label: "Tools" }, { label: "Diaspora Desk" }]}
      kicker="Diaspora Desk · Kenya"
      title="Money home, and what it earns there"
      lede={
        <p>
          For Kenyans abroad: the cheapest way to send $200 home from where you live, what KES 100,000 earns at home in a year after tax, how investing
          from abroad works, and what to check before you send money to any investment. Information, not advice.
        </p>
      }
      aside={
        kesPerUsd ? (
          <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
            <p className="text-[13px] font-medium text-muted">Today&rsquo;s shilling</p>
            <p data-num className="af-figure tabular mt-1 font-serif text-3xl text-ink">
              KES {kesPerUsd.toFixed(2)} <span className="text-[15px] text-ink-soft">per $1</span>
            </p>
            <p data-num className="tabular mt-1 text-[14px] text-ink">
              {fx?.rates.GBP ? `KES ${(kesPerUsd / fx.rates.GBP).toFixed(2)} per £1` : null}
              {fx?.rates.EUR ? ` · KES ${(kesPerUsd / fx.rates.EUR).toFixed(2)} per €1` : null}
            </p>
            <p className="mt-1 text-[12px] text-muted">
              Mid-market reference, {fx?.sourceName}, {fxDate}
            </p>
          </div>
        ) : null
      }
    >
      <nav aria-label="On this page" className="flex flex-wrap gap-2 text-[14px]">
        {[
          ["#send", "1. Send"],
          ["#earn", "2. Earn"],
          ["#invest", "3. Invest from abroad"],
          ["#check", "4. Check first"],
        ].map(([href, label]) => (
          <a key={href} href={href} className="inline-flex min-h-11 items-center rounded-full border border-rule bg-surface px-4 font-medium text-ink hover:border-accent">
            {label}
          </a>
        ))}
      </nav>

      {/* 1. Send */}
      <section id="send" className="mt-10 scroll-mt-24">
        <SectionTitle kicker={`1 · Send · survey of ${period}`} title="What it costs to send $200 home" href="/rates/remittances" hrefLabel="Every corridor →" />
        <div className="mt-5 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {rows.length ? (
              <DiasporaSendPicker rows={rows} period={period} corridors={remitCorridors().filter((c) => c.dst === "KEN")} survey={remitSurvey()} fx={fxFound} />
            ) : (
              <p className="text-sm text-muted">The World Bank survey data is being compiled.</p>
            )}
          </div>
          <div className="space-y-3 text-[14px] leading-6 text-ink-soft lg:col-span-2">
            <p>
              The World Bank prices the same transfer, the equivalent of $200, with every service it surveys in each corridor, and counts both the fee and
              the margin hidden in the exchange rate. Only the sending countries it surveys into Kenya are shown{rows.length ? ` (${rows.length})` : ""}.
            </p>
            <p>
              Survey prices are for one quarter, and a very low price can be a first-transfer offer. Compare the shillings that arrive on the
              service&rsquo;s own quote on the day you send.
            </p>
            <p>
              <Link href="/rates/remittances#KEN" className={link}>
                Every sending country to Kenya
              </Link>
            </p>
            <p className="text-[12px] leading-5 text-muted">
              Afronomics may earn a referral fee from some providers listed on our send-money pages, which may include services named here. It never
              changes the order, which is by cost alone.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Earn */}
      <section id="earn" className="mt-14 scroll-mt-24">
        <SectionTitle
          kicker="2 · Earn · after 15% withholding tax"
          title={`What ${kes(AMOUNT)} earns at home in a year`}
          note="Today's published rates, applied for one year. A bill's rate is fixed when you buy it; fund yields move every day; the bank average is a monthly figure."
        />
        <ul className="mt-2 divide-y divide-rule">
          {earn.map((e) => (
            <li key={e.key} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 py-4 sm:grid-cols-[1fr_8rem_11rem]">
              <div className="min-w-0">
                <p className="text-[15px] font-medium leading-6 text-ink">
                  {e.href ? (
                    <Link href={e.href} className="underline underline-offset-2 hover:text-forest">
                      {e.name}
                    </Link>
                  ) : (
                    e.name
                  )}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-5 text-ink-soft">{e.detail}</p>
                <p className="mt-0.5 text-[12px] leading-5 text-muted">
                  Source:{" "}
                  <a href={e.source} {...ext} className="underline underline-offset-2">
                    {e.sourceLabel}
                  </a>
                </p>
              </div>
              <p data-num className="tabular hidden text-right text-[14px] text-ink-soft sm:block">
                {pct(e.rate)} a year
              </p>
              <div className="text-right">
                <p data-num className="tabular whitespace-nowrap text-[1.25rem] font-semibold leading-7 text-ink">
                  {kes(e.earned)}
                </p>
                <p data-num className="tabular whitespace-nowrap text-[12px] text-muted">
                  {inCurrencies(e.earned, fx) ?? `${pct(e.rate)} a year`}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 max-w-3xl text-[12px] leading-5 text-muted">
          {fx
            ? `Dollar, pound and euro amounts use ${fx.sourceName}'s mid-market reference of ${fxDate}; what you receive when converting will differ. `
            : "Today's exchange-rate quote did not load, so amounts are shown in shillings only. "}
          The bill line is what the Treasury bill calculator shows for {kes(AMOUNT)} paid at that auction&rsquo;s average rate; the fund and bank lines
          apply the published yearly rate. All after 15% withholding tax on interest. Fund yields are each manager&rsquo;s own published figure, and
          managers differ on whether fees are already taken off. A rate earned in shillings can be worth more or less in your currency by the time you bring it back.
        </p>
      </section>

      {/* 3. Invest from abroad */}
      <section id="invest" className="mt-14 scroll-mt-24">
        <SectionTitle kicker="3 · Invest from abroad" title="How bills, bonds and funds work from outside Kenya" />
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
            <h3 className="font-serif text-xl text-ink">Treasury bills and bonds: CBK&rsquo;s DhowCSD</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] leading-6 text-ink-soft">
              <li>
                Individuals and companies can buy bills and bonds without an intermediary by opening a CSD account on{" "}
                <a href="https://dhowcsd.centralbank.go.ke/" {...ext} className={link}>
                  DhowCSD
                </a>
                , the Central Bank of Kenya&rsquo;s web portal and mobile app. They can also buy through a Kenyan commercial bank or investment bank.
              </li>
              <li>
                Documents, per CBK&rsquo;s FAQ: an ID or passport, a photo, and a KRA PIN, which it marks mandatory for residents. CBK&rsquo;s
                requirements sheet also asks for a valid email address and mobile number.
              </li>
              <li>
                You link a commercial bank account (the settlement account), in the name on your ID, and that bank approves the CSD account: within
                48 working hours, by CBK&rsquo;s FAQ.
              </li>
              <li>The minimum investment in government securities is {kes(TBILL_MIN_FACE)}.</li>
              <li>
                Bills are sold at a discount and repay their face value in 91, 182 or 364 days; most bonds pay interest every six months. Some
                infrastructure bonds are tax-exempt.
              </li>
              <li>
                Withholding tax: KRA&rsquo;s rate table lists 15% on bank interest and on interest from two-year government bonds for both residents and
                non-residents; the figures above use 15%.
              </li>
              <li>CBK lists a toll-free line for US-based investors, +1 (833) 201 0220.</li>
            </ul>
            <p className="mt-3 text-[13px] text-ink-soft">
              <Link href="/markets/kenya-tbills/calculator" className={link}>
                Treasury bill calculator
              </Link>{" "}
              ·{" "}
              <Link href="/markets/kenya-tbills" className={link}>
                Latest auction results
              </Link>
            </p>
          </div>
          <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
            <h3 className="font-serif text-xl text-ink">Money market funds</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] leading-6 text-ink-soft">
              <li>
                A money market fund is a collective investment scheme run by a fund manager. The Capital Markets Authority keeps separate lists of
                licensed fund managers and approved collective investment schemes. A fund&rsquo;s published yield describes the recent past and moves
                daily.
              </li>
              <li>
                Each manager sets its own account-opening rules. CIC Asset Management&rsquo;s application form, for example, asks for a copy of an ID or
                passport, a KRA PIN, a passport photo and proof of bank details.
              </li>
              <li>
                Check that both the manager and the fund are on the{" "}
                <a href="https://licensees.cma.or.ke/" {...ext} className={link}>
                  CMA&rsquo;s list of licensees
                </a>{" "}
                before you send money.
              </li>
            </ul>
            <p className="mt-3 text-[13px] text-ink-soft">
              <Link href="/rates/kenya/money-market-funds" className={link}>
                Money market funds ranked by yield
              </Link>{" "}
              ·{" "}
              <Link href="/rates/kenya/savings-goal" className={link}>
                Savings goal planner
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* 4. Check first */}
      <section id="check" className="mt-14 scroll-mt-24">
        <SectionTitle kicker="4 · Check first" title="Before you send money to any investment or land deal" />
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <ol className="list-decimal space-y-3 pl-5 text-[14px] leading-6 text-ink-soft">
            <li>
              <strong className="text-ink">SACCOs and banks:</strong> look the name up in the{" "}
              <Link href="/registry" className={link}>
                Afronomics registry
              </Link>{" "}
              of SACCOs licensed by SASRA and banks licensed by CBK. For a digital lender, use the{" "}
              <Link href="/rates/kenya/loan-apps" className={link}>
                loan app checker
              </Link>
              .
            </li>
            <li>
              <strong className="text-ink">Funds and investment firms:</strong> search the CMA&rsquo;s{" "}
              <a href="https://licensees.cma.or.ke/licenses/8/" {...ext} className={link}>
                licensed fund managers
              </a>{" "}
              and{" "}
              <a href="https://licensees.cma.or.ke/licenses/15/" {...ext} className={link}>
                approved collective investment schemes
              </a>
              . Regulators say a business permit is not enough: a regulated financial firm also needs a licence from a financial-sector regulator.
            </li>
            <li>
              <strong className="text-ink">Land:</strong> the State Department for Lands&rsquo; online platform is{" "}
              <a href="https://ardhisasa.lands.go.ke/" {...ext} className={link}>
                Ardhisasa
              </a>
              . Use it, and an advocate you instruct yourself rather than one the seller provides, before any money changes hands.
            </li>
          </ol>
          <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
            <h3 className="font-serif text-xl text-ink">Warning signs regulators name</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] leading-6 text-ink-soft">
              <li>Promises of huge returns.</li>
              <li>Being asked to recruit new members to earn more: CBK, CMA and the other regulators call this a characteristic of a pyramid scheme.</li>
              <li>A firm that is not on a regulator&rsquo;s list, whatever its permits, website or social-media following.</li>
            </ul>
            <p className="mt-3 text-[12px] leading-5 text-muted">
              From the joint public notice by CMA, CBK, IRA, RBA, SASRA and the Ministry of Cooperatives,{" "}
              <a
                href="https://www.centralbank.go.ke/uploads/press_releases/1843446732_Joint%20Press%20Release%20-%20Public%20Notice%20on%20Fraudulent%20and%20Unlicensed%20Financial%20Schemes.pdf"
                {...ext}
                className="underline underline-offset-2"
              >
                25 August 2020
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <FollowUp heading="Get the Morning: what money costs, every weekday" />
      <p className="mt-6 text-sm text-ink-soft">
        <em>Information, not advice.</em> Afronomics does not recommend any provider, fund or investment. Rates change; check them on the day.
      </p>
      <Questions items={items} />
    </PageShell>
  );
}
