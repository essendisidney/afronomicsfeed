import Link from "next/link";
import { SourcedPrints } from "@/components/desk/SourcedPrints";
import { SectionHead } from "@/components/ui/SectionHead";
import { fiveThings } from "@/lib/demo/brief";
import { countries } from "@/lib/demo/countries";
import { countryPulses } from "@/lib/demo/pulse";
import { signals } from "@/lib/demo/signals";
import { articleHref, categoryLabel, formatDate } from "@/lib/format";
import { getDeskLead } from "@/lib/relations";
import { site } from "@/lib/site";

const desks = [
  { href: "/markets", kicker: "Markets", title: "Currencies and exchanges", lede: "Convert with the daily reference. Dealing prices stay blank until a licensed feed exists." },
  { href: "/capital", kicker: "Capital", title: "Money moving", lede: "Investors and targets. Amounts stay empty until a filing is cited." },
  { href: "/climate", kicker: "Climate", title: "Climate capital", lede: "Committed, deployed, required. A cell appears only with a source." },
  { href: "/technology", kicker: "Technology", title: "Tech and innovation", lede: "Funding, regulation, failures. No invented rounds." },
  { href: "/trade", kicker: "Trade", title: "Corridors", lede: "Ports, roads and rail. Volumes stay unpublished." },
  { href: "/countries", kicker: "Countries", title: "Fifty-four desks", lede: "Kenya first. Every country has a file." },
  { href: "/data", kicker: "Data", title: "The file", lede: "Series, observations and the method behind a number." },
  { href: "/signals", kicker: "Signals", title: "What changed", lede: "Fact and interpretation kept apart." },
] as const;

export const revalidate = 3600;

export default function HomePage() {
  const { lead, supporting } = getDeskLead();
  const extras = supporting.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">{site.tagline}</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">{site.promise}</p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {lead ? `Kenya file as of ${formatDate(lead.date)}` : "Africa desk"}
        </p>
      </div>

      <section className="mt-8 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {lead ? (
            <article>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
                Lead · {categoryLabel(lead.category)}
              </p>
              <h1 className="mt-3 font-serif text-4xl leading-[1.08] tracking-[-0.03em] text-ink sm:text-6xl">
                <Link href={articleHref(lead.category, lead.slug)} className="hover:text-forest">
                  {lead.title}
                </Link>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-ink-soft">{lead.summary}</p>
              <ul className="mt-5 space-y-2 text-sm leading-6 text-ink-soft">
                {lead.teaser.slice(0, 3).map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
        </div>
        <div className="space-y-6 lg:col-span-5 lg:border-l lg:border-rule lg:pl-10">
          {(extras.length ? extras : supporting).slice(0, 4).map((article) => (
            <article key={`${article.category}-${article.slug}`}>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                {categoryLabel(article.category)}
              </p>
              <h2 className="mt-1 font-serif text-2xl leading-snug tracking-[-0.02em]">
                <Link href={articleHref(article.category, article.slug)} className="hover:text-forest">
                  {article.title}
                </Link>
              </h2>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <SourcedPrints compact />
      </section>

      <section className="mt-16">
        <SectionHead kicker="Desks" title="Open a file" href="/terminal" demo={false} />
        <div className="mt-6 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-4">
          {desks.map((desk) => (
            <Link key={desk.href} href={desk.href} className="bg-paper px-5 py-6 hover:bg-paper-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">{desk.kicker}</p>
              <p className="mt-2 font-serif text-2xl tracking-[-0.02em]">{desk.title}</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{desk.lede}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionHead kicker="Countries" title="Featured desks" href="/countries" demo={false} />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {countryPulses.map((item) => {
            const country = countries.find((entry) => entry.slug === item.slug);
            return (
              <Link key={item.slug} href={`/countries/${item.slug}`} className="bg-paper-2 px-4 py-5 hover:bg-paper-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">{country?.iso}</p>
                <p className="mt-2 font-serif text-xl tracking-[-0.02em]">{item.name}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-16 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionHead kicker="Brief" title="Five things moving Africa" href="/brief" demo={false} />
          <ol className="mt-6 space-y-6">
            {fiveThings.map((item, index) => (
              <li key={item.href} className="grid grid-cols-[2rem_1fr] gap-3">
                <p className="font-serif text-2xl text-gold">{index + 1}</p>
                <div>
                  <p className="text-sm leading-6">{item.happened}</p>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">{item.why}</p>
                  <Link href={item.href} className="mt-2 inline-block text-sm text-forest">
                    Open file
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="lg:col-span-5">
          <SectionHead kicker="Signals" title="What to watch" href="/signals" demo={false} />
          <ul className="mt-6 space-y-5">
            {signals.map((signal) => (
              <li key={signal.slug}>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  {signal.category} · {signal.country}
                </p>
                <p className="mt-1 font-serif text-xl leading-snug">
                  <Link href={`/signals/${signal.slug}`} className="hover:text-forest">
                    {signal.title}
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
