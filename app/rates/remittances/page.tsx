import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Questions } from "@/components/seo/Questions";
import { AFRICA_ISO3, banksDearest, byDestination, countryName, loadRemittances, periodLabel, SDG_TARGET, type Corridor } from "@/lib/data/remittances";
import { remittanceAnswers } from "@/lib/seo/remittances";
import { site } from "@/lib/site";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const { title, description } = remittanceAnswers();
  return { title, description, alternates: { canonical: `${site.url}/rates/remittances` } };
}

const usd = (pct: number) => `$${((200 * pct) / 100).toFixed(2)}`;
const pct = (n: number) => `${n.toFixed(2)}%`;

function change(c: Corridor) {
  if (c.prev_avg_cost_pct == null) return <span className="text-muted">—</span>;
  const d = c.avg_cost_pct - c.prev_avg_cost_pct;
  if (Math.abs(d) < 0.05) return <span className="text-muted">same</span>;
  return <span className={d < 0 ? "text-up" : "text-down"}>{`${d > 0 ? "+" : "−"}${Math.abs(d).toFixed(2)} pts`}</span>;
}

function typeLine(c: Corridor) {
  const short: Record<string, string> = {
    Bank: "banks",
    "Money Transfer Operator": "transfer companies",
    "Mobile Operator": "mobile money",
    "Post Office": "post office",
  };
  return Object.entries(c.by_type)
    .sort((a, b) => a[1] - b[1])
    .map(([t, v]) => `${short[t] ?? t.toLowerCase()} ${pct(v)}`)
    .join(" · ");
}

export default function RemittancesPage() {
  const file = loadRemittances();
  const dests = byDestination();
  const all = file?.corridors ?? [];
  const within = all.filter((c) => AFRICA_ISO3.has(c.src));
  const fromAbroad = all.filter((c) => !AFRICA_ISO3.has(c.src));
  const avg = (list: Corridor[]) => (list.length ? list.reduce((n, c) => n + c.avg_cost_pct, 0) / list.length : null);
  const avgAll = avg(all);
  const avgWithin = avg(within);
  const avgAbroad = avg(fromAbroad);
  const sorted = [...all].sort((a, b) => a.avg_cost_pct - b.avg_cost_pct);
  const underTarget = all.filter((c) => c.avg_cost_pct <= SDG_TARGET).length;
  const period = file ? periodLabel(file.period) : "";
  const banks = banksDearest();

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Sending money home" }]}
      kicker="Afronomics comparison · Africa"
      title="What it costs to send money home"
      lede={
        <p>
          For every sending country the World Bank surveys into Africa: what a family loses in fees and exchange-rate margin when someone sends the
          equivalent of $200, the cheapest service surveyed, and how each kind of provider compares. The world&rsquo;s target (UN Sustainable
          Development Goal 10.c) is {SDG_TARGET}%.
        </p>
      }
      aside={
        avgAll != null ? (
          <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
            <p className="text-[13px] font-medium text-muted">Sending $200 into Africa costs, on average</p>
            <p className="mt-1 font-serif text-3xl text-ink">{usd(avgAll)}</p>
            <p className="mt-1 text-[14px] text-ink">{pct(avgAll)} of the money, against a {SDG_TARGET}% target</p>
            <p className="mt-1 text-[12px] text-muted">
              {all.length} corridors, surveyed {period}
            </p>
          </div>
        ) : null
      }
    >
      {!file || !all.length ? (
        <p className="text-sm text-muted">The corridor data is being compiled.</p>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-rule bg-rule lg:grid-cols-4">
            {[
              { v: avgAbroad != null ? pct(avgAbroad) : "—", k: `from outside Africa (${fromAbroad.length} corridors)` },
              { v: avgWithin != null ? pct(avgWithin) : "—", k: `between African countries (${within.length} corridors)` },
              { v: `${underTarget} of ${all.length}`, k: `corridors at or under the ${SDG_TARGET}% target` },
              { v: String(dests.length), k: "African countries receiving" },
            ].map((s) => (
              <div key={s.k} className="bg-surface px-4 py-4">
                <p className="font-serif text-3xl text-ink">{s.v}</p>
                <p className="mt-1 text-[12px] text-muted">{s.k}</p>
              </div>
            ))}
          </section>

          {avgWithin != null && avgAbroad != null && avgWithin > avgAbroad ? (
            <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-soft">
              Sending money between African countries costs about {(avgWithin / avgAbroad).toFixed(1)} times as much as sending it from outside
              Africa. The dearest corridors are within the continent.
              {banks.both ? ` Where banks were surveyed beside other providers, they were the dearest in ${banks.dearest} of ${banks.both} corridors.` : ""}
            </p>
          ) : null}

          <section className="mt-12 grid gap-10 lg:grid-cols-2">
            {[
              { title: "Cheapest corridors", list: sorted.slice(0, 6) },
              { title: "Dearest corridors", list: sorted.slice(-6).reverse() },
            ].map((block) => (
              <div key={block.title}>
                <SectionTitle kicker={period} title={block.title} />
                <table className="data-table mt-2">
                  <tbody>
                    {block.list.map((c) => (
                      <tr key={`${c.src}-${c.dst}`}>
                        <td className="text-sm">
                          {countryName(c.src_name)} → <a href={`#${c.dst}`} className="hover:text-forest">{countryName(c.dst_name)}</a>
                        </td>
                        <td className="text-right text-sm font-semibold">{pct(c.avg_cost_pct)}</td>
                        <td className="text-right text-xs text-muted">{usd(c.avg_cost_pct)} on $200</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </section>

          <section className="mt-14">
            <SectionTitle kicker="By country" title="Find your corridor" note="Average total cost across the services surveyed; the cheapest single service; the change on the quarter before." />
            <nav className="mt-3 flex flex-wrap gap-1.5">
              {dests.map((d) => (
                <a key={d.dst} href={`#${d.dst}`} className="rounded-full border border-rule bg-surface px-3 py-1 text-[13px] hover:border-accent">
                  {countryName(d.name)}
                </a>
              ))}
            </nav>
            <div className="mt-6 space-y-8">
              {dests.map((d) => (
                <div key={d.dst} id={d.dst} className="scroll-mt-24">
                  <h3 className="font-serif text-2xl text-ink">Sending money to {countryName(d.name)}</h3>
                  <div className="mt-2 overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>From</th>
                          <th className="text-right">Average cost</th>
                          <th className="text-right">On $200</th>
                          <th>Cheapest surveyed</th>
                          <th className="text-right">vs quarter before</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.corridors.map((c) => (
                          <tr key={c.src}>
                            <td className="text-sm">
                              {countryName(c.src_name)}
                              <span className="block text-[11px] text-muted">
                                {c.services} services · {typeLine(c)}
                              </span>
                            </td>
                            <td className={`text-right text-sm font-semibold ${c.avg_cost_pct > SDG_TARGET * 3 ? "text-down" : ""}`}>{pct(c.avg_cost_pct)}</td>
                            <td className="text-right text-sm">{usd(c.avg_cost_pct)}</td>
                            <td className="text-sm">
                              {c.cheapest.firm} <span className="text-muted">{pct(c.cheapest.cost_pct)}</span>
                              <span className="block text-[11px] text-muted">{c.cheapest.type}</span>
                            </td>
                            <td className="text-right text-xs">{change(c)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              ["Look at what arrives, not the fee", "The cost is the fee plus the margin hidden in the exchange rate. A “free” transfer can cost more than one with a fee. Compare the amount your family receives in their own currency."],
              ["Banks are usually dearest", `Where both were surveyed, banks were the dearest kind of provider in ${banks.dearest} of ${banks.both} corridors, often several times what mobile money or transfer companies charge.`],
              ["Prices change, and so do offers", "These are the World Bank’s survey prices for one quarter. A very low price can be a first-transfer offer. Check the service’s own quote on the day you send."],
            ].map(([t, d]) => (
              <div key={t}>
                <h3 className="font-serif text-xl text-ink">{t}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-soft">{d}</p>
              </div>
            ))}
          </section>

          <p className="mt-10 max-w-3xl text-xs leading-5 text-muted">
            Source:{" "}
            <a href={file.source_page} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              World Bank, Remittance Prices Worldwide
            </a>
            , survey of {period}, the latest the World Bank has published as a download. Cost of sending the equivalent of USD 200, including fees and
            exchange-rate margin, as a percentage of the amount sent; averages are simple averages of the services surveyed in each corridor, which
            Afronomics computes. Corridors with fewer than two services surveyed are left out. Information, not advice: Afronomics does not
            recommend any provider. See also{" "}
            <Link href="/data/remittances" className="underline underline-offset-2">
              how much each country receives
            </Link>
            .
          </p>
          <Questions items={remittanceAnswers().items} />
        </>
      )}
      <NewsletterBand />
    </PageShell>
  );
}
