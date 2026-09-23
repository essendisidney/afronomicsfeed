import Link from "next/link";
import { DemoMark } from "@/components/ui/DemoMark";
import { SectionHead } from "@/components/ui/SectionHead";
import { fiveThings } from "@/lib/demo/brief";
import { capitalRows } from "@/lib/demo/capital";
import { climateGap } from "@/lib/demo/climate";
import { countries } from "@/lib/demo/countries";
import { marketBoards } from "@/lib/demo/markets";
import { countryPulses, pulseComponents } from "@/lib/demo/pulse";
import { signals } from "@/lib/demo/signals";
import { articleHref, categoryLabel, formatDate } from "@/lib/format";
import { getDeskLead } from "@/lib/relations";
import { site } from "@/lib/site";

export default function HomePage() {
  const { lead, supporting } = getDeskLead();
  const extras = supporting.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-3">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">{site.tagline}</p>
          <p className="mt-1 text-sm text-ink-soft">{site.promise}</p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {lead ? `Kenya file as of ${formatDate(lead.date)}` : "Africa desk"}
        </p>
      </div>

      <section className="grid gap-8 border-b border-rule py-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {lead ? (
            <article>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
                Lead · {categoryLabel(lead.category)}
              </p>
              <h1 className="mt-2 font-serif text-3xl leading-[1.15] text-ink sm:text-5xl">
                <Link href={articleHref(lead.category, lead.slug)} className="hover:text-forest">
                  {lead.title}
                </Link>
              </h1>
              <p className="mt-4 text-[15px] leading-7 text-ink-soft">{lead.summary}</p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-ink-soft">
                {lead.teaser.slice(0, 3).map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
        </div>
        <div className="space-y-5 border-rule lg:col-span-5 lg:border-l lg:pl-8">
          {(extras.length ? extras : supporting).slice(0, 4).map((article) => (
            <article key={`${article.category}-${article.slug}`} className="border-b border-rule pb-4 last:border-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                {categoryLabel(article.category)}
              </p>
              <h2 className="mt-1 font-serif text-xl">
                <Link href={articleHref(article.category, article.slug)} className="hover:text-forest">
                  {article.title}
                </Link>
              </h2>
            </article>
          ))}
        </div>
      </section>

      <section className="py-8">
        <SectionHead kicker="Pulse" title="Afronomics Pulse" href="/data" methodology />
        <p className="mt-3 text-sm text-ink-soft">
          Africa Pulse and country scores are not in production. Cells stay blank until verified pipelines exist.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-px bg-rule sm:grid-cols-5">
          {pulseComponents.map((item) => (
            <div key={item.key} className="bg-paper px-3 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{item.label}</p>
              <p className="mt-1 font-serif text-2xl text-ink">{item.reading}</p>
              <p className="mt-1 text-[11px] leading-4 text-muted">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 border-t border-rule py-8 lg:grid-cols-2">
        <div>
          <SectionHead kicker="Markets" title="Currencies & exchanges" href="/markets" />
          <div className="mt-4 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Print</th>
                  <th>Demo value</th>
                  <th>Official door</th>
                </tr>
              </thead>
              <tbody>
                {marketBoards[0].items.slice(0, 6).map((row) => (
                  <tr key={row.label}>
                    <td className="font-mono text-xs">{row.label}</td>
                    <td>{row.value}</td>
                    <td>
                      <a href={row.href} className="text-forest underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                        Source
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <SectionHead kicker="Capital" title="Capital moving Africa" href="/capital" />
          <ul className="mt-4 space-y-3 text-sm">
            {capitalRows.map((row) => (
              <li key={row.id} className="border-b border-rule pb-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                  {row.type} · {row.country}
                </p>
                <p className="mt-1 text-ink">
                  {row.investor} → {row.target}
                </p>
                <p className="text-muted">{row.amount} {row.currency} · {row.stage}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-8 border-t border-rule py-8 lg:grid-cols-2">
        <div>
          <SectionHead kicker="Climate" title="Climate capital" href="/climate" methodology />
          <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="border border-rule p-3">
              <dt className="font-mono text-[10px] uppercase text-muted">Committed</dt>
              <dd className="mt-1 font-serif text-2xl">{climateGap.committed}</dd>
            </div>
            <div className="border border-rule p-3">
              <dt className="font-mono text-[10px] uppercase text-muted">Deployed</dt>
              <dd className="mt-1 font-serif text-2xl">{climateGap.deployed}</dd>
            </div>
            <div className="border border-rule p-3">
              <dt className="font-mono text-[10px] uppercase text-muted">Requirement</dt>
              <dd className="mt-1 font-serif text-2xl">{climateGap.requirement}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted">{climateGap.note}</p>
        </div>
        <div>
          <SectionHead kicker="Technology" title="Tech & innovation" href="/technology" />
          <p className="mt-4 text-sm leading-6 text-ink-soft">
            Funding, regulation, failures and acquisitions — not startup PR. The startup
            database is a schema plus this door. No invented rounds.
          </p>
          <Link href="/companies" className="mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-forest">
            Company intelligence →
          </Link>
        </div>
      </section>

      <section className="border-t border-rule py-8">
        <SectionHead kicker="Countries" title="Country watch" href="/countries" />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {countryPulses.map((c) => {
            const country = countries.find((x) => x.slug === c.slug);
            return (
              <Link key={c.slug} href={`/countries/${c.slug}`} className="border border-rule px-3 py-3 hover:border-gold">
                <p className="font-mono text-[10px] uppercase text-gold">{country?.iso}</p>
                <p className="mt-1 font-serif text-lg">{c.name}</p>
                <p className="text-[11px] text-muted">Pulse —</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-8 border-t border-rule py-8 lg:grid-cols-2">
        <div>
          <SectionHead kicker="Signals" title="Africa signals" href="/signals" methodology />
          <ul className="mt-4 space-y-4">
            {signals.map((s) => (
              <li key={s.title} className="border-b border-rule pb-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                  {s.category} · {s.country}
                </p>
                <p className="mt-1 font-serif text-lg">{s.title}</p>
                <p className="mt-1 text-xs text-muted">
                  Fact / interpretation separated · {s.confidence}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionHead kicker="Data" title="Data of the day" href="/data" methodology />
          <div className="mt-4 border border-rule p-4">
            <DemoMark kind="methodology" />
            <p className="mt-3 font-serif text-2xl">No verified observation selected</p>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              Chart of the Day and Number of the Day publish only when a sourced series exists.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-rule py-8">
        <SectionHead kicker="Brief" title="The 5 things moving Africa today" href="/brief" demo={false} />
        <ol className="mt-6 space-y-5">
          {fiveThings.map((item, index) => (
            <li key={item.href} className="grid gap-1 border-b border-rule pb-4 sm:grid-cols-12">
              <p className="font-mono text-xs text-gold sm:col-span-1">{index + 1}</p>
              <div className="sm:col-span-11">
                <p className="text-sm leading-6">
                  <span className="font-semibold">What happened. </span>
                  {item.happened}
                </p>
                <p className="text-sm leading-6 text-ink-soft">
                  <span className="font-semibold text-ink">Why it matters. </span>
                  {item.why}
                </p>
                <Link href={item.href} className="mt-1 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-forest">
                  Open file →
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
