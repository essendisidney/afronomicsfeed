import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { CiteBlock } from "@/components/ui/CiteBlock";
import { renderTime } from "@/lib/data/fetcher";
import { loadSavingsBond } from "@/lib/data/nigeria-savings-bond";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "FGN Savings Bond: this month’s rates, dates and minimum",
  description:
    "Nigeria’s FGN Savings Bond offer, read from the Debt Management Office’s own monthly document: the rate for each tenor, when the offer opens and closes, the minimum and what it pays each quarter. Updated automatically.",
  alternates: { canonical: `${site.url}/rates/nigeria/savings-bond` },
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const when = (s: string | null) => (s ? dateFmt.format(new Date(s)) : "not shown");
const naira = (n: number) => `₦${n.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: n % 1 ? 2 : 0 })}`;

export default function NigeriaSavingsBondPage() {
  const file = loadSavingsBond();
  const o = file?.latest;
  const today = new Date(renderTime()).toISOString().slice(0, 10);
  const status = !o?.opening || !o.closing ? null : today < o.opening ? "opens soon" : today <= o.closing ? "open now" : "closed";

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/learn", label: "Learn" }, { label: "Nigeria savings bond" }]}
      kicker="Afronomics dataset · Nigeria"
      title="FGN Savings Bond: this month’s offer"
      lede={
        <p>
          Nigeria’s Debt Management Office sells savings bonds to individuals every month, in small amounts, with interest paid every quarter. These are
          the terms of the latest offer, read from the DMO’s own offer document and updated automatically when a new one is published.
        </p>
      }
      aside={
        o && status ? (
          <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
            <p className="text-[13px] font-medium text-muted">{o.offer} offer</p>
            <p className="mt-1 font-serif text-3xl text-ink">{status === "open now" ? "Open now" : status === "opens soon" ? "Opens soon" : "Closed"}</p>
            <p className="mt-1 text-[13px] text-ink-soft">
              {when(o.opening)} to {when(o.closing)}
            </p>
            {status === "closed" ? <p className="mt-1 text-[12px] text-muted">The next offer is usually published early next month.</p> : null}
          </div>
        ) : null
      }
    >
      {!o ? (
        <p className="text-sm text-muted">The first offer has not been read yet.</p>
      ) : (
        <>
          <section>
            <SectionTitle kicker={`${o.offer} offer`} title="Rates and terms" note="As printed in the Debt Management Office’s offer document." />
            <div className="mt-4 overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bond</th>
                    <th className="text-right">Rate a year</th>
                    <th>Matures</th>
                    {o.minimum_naira ? <th className="text-right">Interest each quarter on {naira(o.minimum_naira)}</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {o.bonds.map((b) => (
                    <tr key={b.years}>
                      <td className="font-medium">{b.years}-year FGN Savings Bond</td>
                      <td className="text-right font-semibold">{b.rate.toFixed(3)}%</td>
                      <td>{when(b.due)}</td>
                      {o.minimum_naira ? <td className="text-right">{naira((o.minimum_naira * b.rate) / 400)}</td> : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-3">
              {[
                { k: "Minimum", v: o.minimum_naira ? naira(o.minimum_naira) : "see the offer" },
                { k: "Then in multiples of", v: o.unit_naira ? naira(o.unit_naira) : "see the offer" },
                { k: "Maximum", v: o.maximum_naira ? naira(o.maximum_naira) : "see the offer" },
                { k: "Offer opens", v: when(o.opening) },
                { k: "Offer closes", v: when(o.closing) },
                { k: "Settlement", v: when(o.settlement) },
              ].map((x) => (
                <div key={x.k} className="bg-surface px-4 py-3">
                  <dt className="text-[12px] text-muted">{x.k}</dt>
                  <dd className="mt-0.5 text-[16px] font-semibold text-ink">{x.v}</dd>
                </div>
              ))}
            </dl>
            {o.coupon_dates ? <p className="mt-3 text-sm text-ink-soft">Interest is paid every quarter, on {o.coupon_dates}.</p> : null}
            <p className="mt-3 max-w-3xl text-xs leading-5 text-muted">
              Read from the{" "}
              <a href={o.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                DMO’s {o.offer} offer document
              </a>{" "}
              on {dateFmt.format(new Date(o.read_at))}. How and where to apply is set out in that document and on the{" "}
              <a href={file!.source_page} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                DMO’s Savings Bond page
              </a>
              ; read it before you buy. Interest is shown simply as rate × amount ÷ 4. Information, not advice.
            </p>
          </section>

          {file?.history && file.history.length > 1 ? (
            <section className="mt-12">
              <SectionTitle kicker="History" title="Earlier offers" note="Each month’s rates, from the offers read since Afronomics began tracking them." />
              <div className="mt-4 overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Offer</th>
                      <th className="text-right">2-year</th>
                      <th className="text-right">3-year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {file.history.map((h) => (
                      <tr key={h.offer}>
                        <td>
                          <a href={h.source} target="_blank" rel="noopener noreferrer" className="hover:text-forest">
                            {h.offer}
                          </a>
                        </td>
                        {[2, 3].map((y) => {
                          const b = h.bonds.find((x) => x.years === y);
                          return (
                            <td key={y} className="text-right">
                              {b ? `${b.rate.toFixed(3)}%` : "—"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      )}

      <p className="mt-10 text-sm text-ink-soft">
        Buying government bills and bonds in other countries:{" "}
        <Link href="/explainers/learn-buy-government-securities" className="font-medium text-forest underline underline-offset-2">
          Kenya, Nigeria, South Africa and Tanzania
        </Link>
        . Nigeria’s Treasury bill auctions: <Link href="/markets/tbills/nigeria" className="font-medium text-forest underline underline-offset-2">Nigeria T-bills</Link>.
      </p>
      <CiteBlock title="FGN Savings Bond offers" path="/rates/nigeria/savings-bond" publisher="the Debt Management Office’s monthly offer documents" />
      <NewsletterBand />
    </PageShell>
  );
}
