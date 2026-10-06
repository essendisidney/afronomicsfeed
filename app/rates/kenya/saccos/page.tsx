import type { Metadata } from "next";
import Link from "next/link";
import { PaystackCheckout } from "@/components/billing/PaystackCheckout";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Questions, type QA } from "@/components/seo/Questions";
import { fairBench, fundLeague } from "@/lib/data/kenya-rates";
import { loadSaccos, saccoLatest } from "@/lib/data/saccos";
import { paystackConfigured } from "@/lib/billing/paystack";
import { chargeLabel } from "@/lib/billing/plans";
import { site } from "@/lib/site";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const s = saccoLatest();
  return {
    title: s
      ? `SACCO dividend and interest rates in Kenya: ${s.dividend_pct.toFixed(2)}% on shares, ${s.deposit_interest_pct.toFixed(2)}% on deposits (${s.year})`
      : "SACCO dividend and interest rates in Kenya",
    description: s
      ? `Kenya's regulated SACCOs paid an average ${s.dividend_pct.toFixed(2)}% dividend on share capital and ${s.deposit_interest_pct.toFixed(2)}% interest on deposits for ${s.year} (SASRA), beside Treasury bills, money market funds and bank savings, with each SACCO's declared rates from its own notice.`
      : "Kenya SACCO returns from the regulator, beside Treasury bills, money market funds and bank savings.",
    alternates: { canonical: `${site.url}/rates/kenya/saccos` },
  };
}

const pct = (n: number) => `${n.toFixed(2)}%`;

export default function SaccosPage() {
  const file = loadSaccos();
  const latest = saccoLatest();
  const bench = fairBench();
  const fund = fundLeague()[0];
  const declared = [...(file?.saccos ?? [])].sort((a, b) => (b.deposit_interest_pct ?? -1) - (a.deposit_interest_pct ?? -1));
  const ind = file?.industry;

  const items: QA[] = latest
    ? [
        {
          q: "What dividend do SACCOs in Kenya pay?",
          a: `Regulated SACCOs paid an average dividend of ${pct(latest.dividend_pct)} on members' share capital for ${latest.year}, down from ${pct(file!.industry.years.at(-2)!.dividend_pct)} the year before, according to the SACCO Societies Regulatory Authority.`,
        },
        {
          q: "What interest do SACCOs pay on deposits?",
          a: `An average of ${pct(latest.deposit_interest_pct)} on members' deposits for ${latest.year} across ${ind!.regulated_saccos} regulated SACCOs (SASRA). Each SACCO declares its own rate after its annual general meeting.`,
        },
        ...(bench
          ? [
              {
                q: "SACCO or bank savings account?",
                a: `For ${latest.year}, SACCOs paid ${pct(latest.deposit_interest_pct)} on deposits on average; banks paid ${pct(bench.savingsAvg)} on savings accounts on average (Central Bank of Kenya, ${bench.asOf}). SACCO returns are declared once a year and are not guaranteed, and SACCO deposits usually cannot be withdrawn while you remain a member.`,
              },
            ]
          : []),
        {
          q: "How do I know a SACCO is regulated?",
          a: "Deposit-taking SACCOs must be licensed by the SACCO Societies Regulatory Authority (SASRA), which publishes the list of licensed and authorised SACCOs on its website. Check the list before joining.",
        },
      ]
    : [];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/rates/kenya", label: "Kenya rates" }, { label: "SACCO rates" }]}
      kicker="Afronomics comparison · Kenya"
      title="What SACCOs pay their members"
      lede={
        <p>
          Millions of Kenyans save through a SACCO. Unlike a bank, a SACCO pays once a year: a dividend on your shares and interest (a rebate) on your
          deposits, declared after its annual general meeting. Here is what the regulator says SACCOs paid on average, set beside what the same money earns
          elsewhere, and what individual SACCOs declared, from their own notices.
        </p>
      }
      aside={
        latest ? (
          <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
            <p className="text-[13px] font-medium text-muted">Average paid by regulated SACCOs, {latest.year}</p>
            <p className="mt-1 font-serif text-3xl text-ink">{pct(latest.deposit_interest_pct)}</p>
            <p className="text-[14px] text-ink">on deposits · {pct(latest.dividend_pct)} dividend on shares</p>
            <p className="mt-1 text-[12px] text-muted">SASRA, {ind!.report}</p>
          </div>
        ) : null
      }
    >
      {!file || !latest || !ind ? (
        <p className="text-sm text-muted">The regulator&rsquo;s figures are being compiled.</p>
      ) : (
        <>
          <section>
            <SectionTitle
              kicker="Compared"
              title="SACCO returns beside the alternatives"
              note="All before tax. SACCO figures are what was paid for the whole of the year; the others are today's rates."
            />
            <div className="mt-4 overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Where the money is</th>
                    <th className="text-right">Rate a year</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { k: "SACCO dividend on share capital, average", v: latest.dividend_pct, s: `SASRA, ${latest.year}`, b: true },
                    { k: "SACCO interest on deposits, average", v: latest.deposit_interest_pct, s: `SASRA, ${latest.year}`, b: true },
                    ...(bench ? [{ k: "364-day Treasury bill", v: bench.bill364Gross, s: "Central Bank of Kenya, latest auction", b: false }] : []),
                    ...(fund ? [{ k: `Best published fund yield: ${fund.name}`, v: fund.gross, s: `${fund.manager}, read ${fund.readOn}`, b: false }] : []),
                    ...(bench ? [{ k: "Bank savings account, average", v: bench.savingsAvg, s: `Central Bank of Kenya, ${bench.asOf}`, b: false }] : []),
                  ].map((r) => (
                    <tr key={r.k} className={r.b ? "bg-paper-2" : ""}>
                      <td className="text-sm">{r.k}</td>
                      <td className="text-right text-sm font-semibold">{pct(r.v)}</td>
                      <td className="text-xs text-muted">{r.s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 max-w-3xl text-xs leading-5 text-muted">
              See every option after tax on the{" "}
              <Link href="/rates/kenya" className="underline underline-offset-2">
                Kenya rates comparison
              </Link>{" "}
              and check a rate you were offered with{" "}
              <Link href="/rates/kenya/check" className="underline underline-offset-2">
                Is my rate fair?
              </Link>
            </p>
          </section>

          <section className="mt-12 grid gap-10 lg:grid-cols-2">
            <div>
              <SectionTitle kicker="Trend" title="Payouts have fallen three years running" />
              <table className="data-table mt-2">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th className="text-right">Dividend on shares</th>
                    <th className="text-right">Interest on deposits</th>
                  </tr>
                </thead>
                <tbody>
                  {ind.years.map((y) => (
                    <tr key={y.year}>
                      <td className="text-sm">{y.year}</td>
                      <td className="text-right text-sm">{pct(y.dividend_pct)}</td>
                      <td className="text-right text-sm">{pct(y.deposit_interest_pct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs leading-5 text-muted">
                The regulator says SACCOs are keeping more of their surpluses to build capital, partly under its own restrictions on payouts.
              </p>
            </div>
            <div>
              <SectionTitle kicker={`${ind.report}`} title="The sector at a glance" />
              <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-rule bg-rule">
                {[
                  { v: String(ind.regulated_saccos), k: `regulated SACCOs (${ind.dt_saccos} deposit-taking)` },
                  { v: `${ind.members_million.toFixed(2)}m`, k: "members" },
                  { v: `KES ${(ind.total_deposits_kes_bn / 1000).toFixed(2)}trn`, k: "members' deposits" },
                  { v: `KES ${(ind.total_assets_kes_bn / 1000).toFixed(2)}trn`, k: "total assets" },
                ].map((s) => (
                  <div key={s.k} className="bg-surface px-4 py-4">
                    <dd className="font-serif text-2xl text-ink">{s.v}</dd>
                    <dt className="mt-1 text-[12px] text-muted">{s.k}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="mt-12">
            <SectionTitle
              kicker={`Declared for ${file.declared_year}`}
              title="What individual SACCOs declared"
              note="Each rate is quoted from the SACCO's own notice or website, linked. A SACCO appears only when its own document states the rate."
            />
            {declared.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>SACCO</th>
                      <th className="text-right">Dividend on shares</th>
                      <th className="text-right">Interest on deposits</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {declared.map((s) => (
                      <tr key={s.name}>
                        <td className="text-sm font-medium">
                          {s.name}
                          {s.year_note ? <span className="block text-[11px] font-normal text-muted">{s.year_note}</span> : null}
                        </td>
                        <td className="text-right text-sm">{s.dividend_pct != null ? pct(s.dividend_pct) : "—"}</td>
                        <td className="text-right text-sm">{s.deposit_interest_pct != null ? pct(s.deposit_interest_pct) : "—"}</td>
                        <td className="text-xs">
                          <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                            SACCO&rsquo;s own notice
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">Being compiled from SACCOs&rsquo; own notices.</p>
            )}
            <p className="mt-3 max-w-3xl text-xs leading-5 text-muted">
              Few SACCOs publish their declared rates as text on their own website; most announce them at the AGM, by SMS or through the press, which
              Afronomics does not use as a source. A SACCO&rsquo;s past payout does not promise the next one. SACCOs: publish your declared rates on your
              website, or{" "}
              <Link href="/contact?interest=other#enquiry" className="underline underline-offset-2">
                send the link to your notice
              </Link>
              , to be included.
            </p>
            <div className="mt-6 grid gap-4 rounded-2xl border border-accent/40 bg-surface px-5 py-5 md:grid-cols-[1fr_18rem] md:items-center">
              <div>
                <p className="text-[12px] font-semibold text-accent">For SACCOs</p>
                <p className="mt-1 font-serif text-2xl text-ink">Verified SACCO listing, {chargeLabel("sacco_listing")} a month</p>
                <p className="mt-1 text-sm leading-6 text-ink-soft">
                  Your declared dividend and deposit rates on this page, checked against your own notice, with your logo and a &ldquo;join&rdquo; link we count
                  for you. Regulated SACCOs only; the rates shown are always the ones you declared, never adjusted.
                </p>
              </div>
              {paystackConfigured() ? (
                <PaystackCheckout plan="sacco_listing" label={`List your SACCO · ${chargeLabel("sacco_listing")}/mo`} variant="primary" />
              ) : (
                <Link href="/contact?interest=other#enquiry" className="block rounded-full bg-ink px-4 py-3 text-center text-[14px] font-semibold text-paper hover:bg-forest">
                  List your SACCO
                </Link>
              )}
            </div>
          </section>

          <section className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              ["Shares and deposits are different", "Shares are your ownership; they earn the dividend and usually cannot be withdrawn, only sold to another member. Deposits earn the interest (rebate) and back your borrowing; in most SACCOs they are returned only when you leave."],
              ["Paid once a year, not promised", "The rates are decided after the year ends, from the surplus the SACCO actually made. A bank or fund rate is known in advance; a SACCO's is not."],
              ["Check the licence", "Deposit-taking SACCOs must be licensed by SASRA, which lists every licensed and authorised SACCO on its website. Your deposits are safer in a regulated SACCO."],
            ].map(([t, d]) => (
              <div key={t}>
                <h3 className="font-serif text-xl text-ink">{t}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-soft">{d}</p>
              </div>
            ))}
          </section>

          <p className="mt-10 max-w-3xl text-xs leading-5 text-muted">
            Source for the averages and sector figures:{" "}
            <a href={ind.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              {ind.publisher}, {ind.report}
            </a>
            , pages {ind.pages} and 18&ndash;19. Information, not advice: Afronomics does not recommend any SACCO.
          </p>
          <Questions items={items} />
        </>
      )}
      <NewsletterBand />
    </PageShell>
  );
}
