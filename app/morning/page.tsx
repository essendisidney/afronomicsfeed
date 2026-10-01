import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { WireList } from "@/components/data/WireList";
import { SectionTitle, SourceLine } from "@/components/data/parts";
import { renderTime } from "@/lib/data/fetcher";
import { pairHref } from "@/lib/data/fx";
import { buildMorningNote, morningLines, morningLongDate, morningShortDate, morningSigned } from "@/lib/editions/morning";
import { site } from "@/lib/site";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "The Afronomics Morning — Africa’s markets before 7am",
  description:
    "Every weekday at 7am Nairobi: the currencies that moved overnight, the Treasury bill results that landed, what is due today and the headlines that matter, across Africa’s markets.",
  alternates: { canonical: `${site.url}/morning` },
};

export default async function MorningPage() {
  const now = renderTime();
  const note = await buildMorningNote(now);
  const lines = morningLines(note);

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Morning" }]}
      kicker={`The Afronomics Morning · ${morningLongDate.format(new Date(note.day))}`}
      title="Africa’s markets before 7am"
      lede={
        lines.length ? (
          <ul className="space-y-2">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p>The overnight currency moves, the auction results that landed, what is due today and the headlines that matter.</p>
        )
      }
      aside={
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5 text-sm text-ink-soft">
          <p className="text-[14px] font-semibold text-ink">In your inbox at 7:00</p>
          <p className="mt-1 leading-6">This note, every weekday morning, East Africa time. Free, and every figure linked to its source.</p>
          <Link href="/subscribe?list=morning" className="mt-4 inline-block rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-paper hover:bg-forest">
            Get the Morning
          </Link>
        </div>
      }
    >
      <div className="grid gap-12 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <SectionTitle kicker="Overnight" title="Against the dollar" href="/markets" hrefLabel="All rates" />
          {note.fx.moves.length ? (
            <>
              <table className="data-table mt-2">
                <tbody>
                  {note.fx.moves.slice(0, 8).map((m) => (
                    <tr key={m.code}>
                      <td>
                        <Link href={pairHref(m.code)} className="hover:text-forest">
                          {m.name}
                        </Link>
                      </td>
                      <td className="text-right text-sm">{m.now.toFixed(m.now >= 100 ? 1 : 3)}</td>
                      <td className={`text-right text-sm font-medium ${m.changePct > 0.005 ? "text-up" : m.changePct < -0.005 ? "text-down" : "text-muted"}`}>{morningSigned(m.changePct)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-muted">
                Change in each currency’s value against the dollar from {morningShortDate.format(new Date(note.fx.moves[0].prevDay))} to{" "}
                {note.fx.asOf ? morningShortDate.format(new Date(note.fx.asOf)) : "today"}. Positive means the currency strengthened.
              </p>
              <SourceLine name="ExchangeRate-API" href="https://www.exchangerate-api.com/" detail="daily mid-market reference, archived by Afronomics" />
            </>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">Overnight moves appear once two days are in the archive.</p>
          )}
        </section>

        <section className="lg:col-span-7">
          <SectionTitle kicker="Auctions" title={note.auctions.length ? "Results in since the last note" : "No new results since the last note"} href="/markets/tbills" hrefLabel="T-bill monitor" />
          {note.auctions.length ? (
            <table className="data-table mt-2">
              <thead>
                <tr>
                  <th>Market</th>
                  <th>Tenor</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Change</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {note.auctions.map((a) => (
                  <tr key={`${a.market.slug}-${a.tenor}`}>
                    <td>
                      <Link href={a.market.href} className="font-medium hover:text-forest">
                        {a.market.country}
                      </Link>
                    </td>
                    <td>{a.tenor}-day</td>
                    <td className="text-right text-sm">{a.rate.toFixed(2)}%</td>
                    <td className={`text-right text-sm ${a.bps == null || a.bps === 0 ? "text-muted" : a.bps > 0 ? "text-down" : "text-up"}`}>{a.bps == null ? "—" : `${morningSigned(a.bps, 0)} bps`}</td>
                    <td className="text-xs">
                      <a href={a.source} target="_blank" rel="noopener noreferrer" className="hover:text-forest">
                        {morningShortDate.format(new Date(a.date))}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          {note.due.length ? (
            <p className="mt-4 text-sm text-ink-soft">
              Due: {note.due.map((d) => `${d.market.country} (${d.expected === note.day ? "today" : "tomorrow"})`).join(", ")}.{" "}
              <Link href="/markets/borrowing-costs" className="underline underline-offset-2">
                Calendar
              </Link>
            </p>
          ) : null}
          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-5">
            {note.board.map((b) => (
              <Link key={b.market.slug} href={b.market.href} className="bg-surface px-3 py-3 hover:bg-paper-2">
                <span className="block text-[12px] text-muted">{b.market.country} 364d</span>
                <span className="block font-serif text-xl text-ink">{b.rate.toFixed(2)}%</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-14">
        <SectionTitle kicker="Headlines" title="What matters this morning" href="/news" hrefLabel="The Wire" />
        <WireList items={note.stories} now={now} />
      </section>

      <NewsletterBand title="The Afronomics Morning" lede="The same note in your inbox at 7:00 every weekday, East Africa time. Free." />
    </PageShell>
  );
}
