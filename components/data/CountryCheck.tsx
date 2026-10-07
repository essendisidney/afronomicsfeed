import { ContributeBand } from "@/components/data/ContributeBand";
import Link from "next/link";
import { CountryFairRate } from "@/components/data/CountryFairRate";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import type { CountryBench } from "@/lib/data/west-africa-rates";

/** The Nigeria and Ghana fair-rate pages: the check, then every benchmark it uses with its source. */
export function CountryCheck({ bench, slug, intro }: { bench: CountryBench | null; slug: "nigeria" | "ghana"; intro: React.ReactNode }) {
  const country = slug === "nigeria" ? "Nigeria" : "Ghana";
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: `/markets/tbills/${slug}`, label: country }, { label: "Is my rate fair?" }]}
      kicker={`Fair-rate check · ${country}`}
      title="Is the rate you were offered fair?"
      lede={intro}
    >
      {!bench ? (
        <p className="max-w-2xl text-sm leading-6 text-ink-soft">
          The check opens when the central bank&rsquo;s current averages for what banks pay and charge are available. Its latest published figures
          are more than nine months old, too old to judge a rate offered today. Meanwhile, the government&rsquo;s own rate is on the{" "}
          <Link href={`/markets/tbills/${slug}`} className="underline underline-offset-2">
            Treasury bill page
          </Link>
          .
        </p>
      ) : (
        <>
          <CountryFairRate bench={bench} />
          <section className="mt-12 grid gap-10 lg:grid-cols-2">
            <div>
              <SectionTitle kicker="Saving" title="What your money could earn" />
              <table className="data-table mt-2">
                <tbody>
                  {bench.save.map((b) => (
                    <tr key={b.label}>
                      <td className="text-sm">
                        {b.label}
                        <span className="block text-[11px] text-muted">{b.note}</span>
                      </td>
                      <td className="text-right text-sm font-semibold">{b.rate.toFixed(2)}%</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="text-sm">
                      Bank savings deposit, average
                      <span className="block text-[11px] text-muted">
                        {bench.bankSource.publisher}, {bench.asOf}
                      </span>
                    </td>
                    <td className="text-right text-sm font-semibold">{bench.savingsAvg.toFixed(2)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <SectionTitle kicker="Borrowing" title="What banks charge" />
              <table className="data-table mt-2">
                <tbody>
                  {[bench.lendRef, bench.lendTop, bench.policy].filter((b) => b !== null).map((b) => (
                    <tr key={b.label}>
                      <td className="text-sm">
                        {b.label}
                        <span className="block text-[11px] text-muted">{b.note}</span>
                      </td>
                      <td className="text-right text-sm font-semibold">{b.rate.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="mt-12 grid gap-8 text-sm leading-6 text-ink-soft md:grid-cols-3">
            <div>
              <h3 className="font-serif text-xl text-ink">Where the figures come from</h3>
              <p className="mt-2">
                Treasury bill rates from the {country === "Nigeria" ? "Central Bank of Nigeria" : "Bank of Ghana"}&rsquo;s auction results
                {country === "Nigeria" ? "; the savings bond from the Debt Management Office's monthly offer" : ""}; bank averages from the{" "}
                <a href={bench.bankSource.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  {bench.bankSource.publisher}&rsquo;s published monthly rates
                </a>
                ; the policy rate from the{" "}
                <Link href="/rates/policy" className="underline underline-offset-2">
                  central bank&rsquo;s own site
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="font-serif text-xl text-ink">What &ldquo;fair&rdquo; means here</h3>
              <p className="mt-2">
                For savings: near or above what the government itself pays. For loans: near what banks charge.
                {bench.billIsDiscount
                  ? " Nigeria's bill rate is the CBN stop rate, a discount rate, so the return on the money you pay in is a little higher."
                  : ""}{" "}
                All rates are compared before tax. It is a yardstick, not a judgement of any institution.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-xl text-ink">Share it</h3>
              <p className="mt-2">Forward this page to anyone being quoted a rate. The figures update as each auction and monthly average is published.</p>
            </div>
          </section>
        </>
      )}
      <ContributeBand compact ask="Tell us the rate you were offered, and see what others got." />
    </PageShell>
  );
}
