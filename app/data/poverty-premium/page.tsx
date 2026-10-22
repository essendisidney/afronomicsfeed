import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { CiteBlock } from "@/components/ui/CiteBlock";
import { latestPremium, premiumMonths } from "@/lib/data/poverty-premium";
import type { PremiumFile, PremiumLine, Side, Source } from "@/lib/poverty-premium";
import { fitDescription, fitTitle } from "@/lib/seo";
import { site } from "@/lib/site";

export const revalidate = 3600;

const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const monthName = (ym: string) => monthFmt.format(new Date(`${ym}-01T00:00:00Z`));
/** A source date: a month ("2026-08") or a day ("2026-10-19"). */
const when = (asOf: string) => (/^\d{4}-\d{2}$/.test(asOf) ? monthName(asOf) : /^\d{4}-\d{2}-\d{2}/.test(asOf) ? dayFmt.format(new Date(`${asOf.slice(0, 10)}T00:00:00Z`)) : asOf);
const money = (currency: string, n: number) => `${currency} ${n.toLocaleString("en-GB", { minimumFractionDigits: n < 100 ? 2 : 0, maximumFractionDigits: n < 100 ? 2 : 0 })}`;
const pct = (n: number) => `${n.toLocaleString("en-GB", { maximumFractionDigits: 2 })}%`;

export function generateMetadata(): Metadata {
  const f = latestPremium();
  const title = f ? `Kenya Poverty Premium, ${monthName(f.month)}` : "Kenya Poverty Premium";
  return {
    title: fitTitle(title),
    description: fitDescription(
      "What a low-income Kenyan pays, or forgoes, for the same need: borrowing, saving and sending money, against the best option a better-off person can reach. Monthly, every figure sourced and dated.",
    ),
    alternates: { canonical: `${site.url}/data/poverty-premium` },
  };
}

type Ok = Extract<PremiumLine, { status: "ok" }>;
type Gap = Extract<PremiumLine, { status: "gap" }>;

function SourceNote({ s }: { s: Source }) {
  const external = /^https?:/.test(s.url);
  return (
    <p className="mt-2 text-[11px] leading-5 text-muted">
      Source:{" "}
      {external ? (
        <a href={s.url} target="_blank" rel="noopener noreferrer" data-track="source_click" className="underline underline-offset-2 hover:text-forest">
          {s.publisher}
        </a>
      ) : (
        <Link href={s.url} className="underline underline-offset-2 hover:text-forest">
          {s.publisher}
        </Link>
      )}
      , {when(s.asOf)} · <span className="font-mono break-all">{s.file}</span> <span className="font-mono break-all">{s.field}</span>
    </p>
  );
}

function SideBox({ side, currency, role }: { side: Side; currency: string; role: string }) {
  return (
    <div className="rounded-xl border border-rule bg-surface px-4 py-4">
      <p className="text-[12px] font-semibold text-gold">{role}</p>
      <p className="mt-1 text-[15px] font-medium text-ink">{side.label}</p>
      <p className="af-figure mt-2 font-serif text-2xl text-ink">{money(currency, side.money)}</p>
      <p className="text-[13px] text-ink-soft">{pct(side.rate)} a year</p>
      <p className="mt-2 text-[12px] leading-5 text-ink-soft">
        {side.detail}
        {side.kind === "benchmark" ? <span className="ml-1 rounded bg-paper-2 px-1.5 py-0.5 text-[11px] text-muted">an average, not a product</span> : null}
      </p>
      <SourceNote s={side.source} />
    </div>
  );
}

function LineCard({ line }: { line: Ok }) {
  const saving = line.need === "Saving";
  return (
    <article id={line.id} className="mt-6 scroll-mt-24">
      <h3 className="font-serif text-xl text-ink">{line.title}</h3>
      <p className="text-[13px] text-muted">{line.example}</p>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <SideBox side={line.low} currency={line.currency} role={saving ? "Where small savings usually sit" : "What a low-income borrower uses"} />
        <SideBox side={line.best} currency={line.currency} role={saving ? "What a saver with KES 50,000 or more can reach" : "What a better-off borrower is measured against"} />
        <div className="rounded-xl border-l-4 border-gold bg-paper-2 px-4 py-4">
          <p className="text-[12px] font-semibold text-gold">The premium</p>
          <p className="af-figure mt-2 font-serif text-3xl text-ink">{money(line.currency, line.premium)}</p>
          <p className="text-[13px] text-ink-soft">
            {saving ? "less earned" : "more paid"} · {line.premiumRatePoints.toLocaleString("en-GB", { maximumFractionDigits: 2 })} percentage points a year
          </p>
          <p className="mt-3 font-mono text-[11px] leading-5 text-muted">{line.formula}</p>
        </div>
      </div>
      {line.context?.length ? (
        <div className="mt-3 overflow-x-auto">
          <table className="data-table">
            <caption className="sr-only">Shown beside this line, not part of the premium</caption>
            <thead>
              <tr>
                <th>Also shown, not part of the premium</th>
                <th className="text-right">After tax, a year</th>
                <th className="text-right">On the example</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {line.context.map((c) => (
                <tr key={c.label}>
                  <td>
                    {c.label}
                    <span className="block text-[11px] text-muted">{c.detail}</span>
                  </td>
                  <td className="text-right">{pct(c.rate)}</td>
                  <td className="text-right">{money(line.currency, c.money)}</td>
                  <td className="text-[12px]">
                    {c.source.publisher}, {when(c.source.asOf)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {line.note ? <p className="mt-2 max-w-3xl text-[13px] leading-6 text-ink-soft">{line.note}</p> : null}
    </article>
  );
}

function GapCard({ line }: { line: Gap }) {
  return (
    <article id={line.id} className="mt-6 scroll-mt-24 rounded-xl border border-dashed border-rule px-4 py-4">
      <p className="text-[12px] font-semibold text-warn">Gap: not published</p>
      <h3 className="mt-1 font-serif text-xl text-ink">{line.title}</h3>
      <p className="mt-2 max-w-3xl text-[14px] leading-6 text-ink-soft">
        <span className="font-medium text-ink">Not held: </span>
        {line.missing}
      </p>
      <p className="mt-1 max-w-3xl text-[14px] leading-6 text-ink-soft">
        <span className="font-medium text-ink">Would need: </span>
        {line.wouldNeed}
      </p>
      <p className="mt-1 text-[12px] text-muted">We leave this line empty rather than estimate it.</p>
    </article>
  );
}

function Sending({ lines }: { lines: Ok[] }) {
  if (!lines.length) return null;
  const s = lines[0].best.source;
  return (
    <div className="mt-6">
      <h3 className="font-serif text-xl text-ink">Sending money home to Kenya</h3>
      <p className="text-[13px] text-muted">{lines[0].example}, by the country it is sent from</p>
      <div className="mt-3 overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sent from</th>
              <th className="text-right">Average service</th>
              <th className="text-right">Cheapest service</th>
              <th className="text-right">The premium</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id} id={l.id}>
                <td>{l.title.replace(/^Sending home from /, "")}</td>
                <td className="text-right">
                  {money("USD", l.low.money)} <span className="block text-[11px] text-muted">{pct(l.low.rate)}</span>
                </td>
                <td className="text-right">
                  {money("USD", l.best.money)} <span className="block text-[11px] text-muted">{pct(l.best.rate)}</span>
                </td>
                <td className="text-right font-semibold">
                  {money("USD", l.premium)} <span className="block text-[11px] font-normal text-muted">{l.premiumRatePoints.toLocaleString("en-GB", { maximumFractionDigits: 2 })} points</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 font-mono text-[11px] leading-5 text-muted">{lines[0].formula}</p>
      <p className="mt-2 max-w-3xl text-[13px] leading-6 text-ink-soft">
        Cost is the fee plus the exchange-rate margin, as a share of the amount sent. The average is across the services the World Bank surveyed in each
        corridor; the cheapest is the lowest-cost one in the same survey. Corridors with few services surveyed (Rwanda, Tanzania) move more from one
        quarter to the next.
      </p>
      <SourceNote s={s} />
    </div>
  );
}

const NEEDS: PremiumLine["need"][] = ["Borrowing", "Saving", "Sending money", "Protection"];

function Headline({ f }: { f: PremiumFile }) {
  const week = f.lines.find((l): l is Ok => l.id === "borrow-overdraft-week" && l.status === "ok");
  if (!week) return null;
  return (
    <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
      <p className="text-[13px] font-medium text-muted">{week.example}</p>
      <p className="af-figure mt-1 font-serif text-3xl text-ink">{money("KES", week.low.money)}</p>
      <p className="mt-1 text-[14px] text-ink">on the M-PESA overdraft</p>
      <p className="mt-1 text-[12px] text-muted">
        {money("KES", week.best.money)} at the bank average lending rate of {pct(week.best.rate)} ({when(week.best.source.asOf)})
      </p>
    </div>
  );
}

export default function PovertyPremiumPage() {
  const f = latestPremium();
  if (!f) notFound();
  const months = premiumMonths();
  const ok = f.lines.filter((l): l is Ok => l.status === "ok");
  const gaps = f.lines.filter((l): l is Gap => l.status === "gap");

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/data", label: "Data" }, { label: "Poverty Premium" }]}
      kicker={`Afronomics data · Kenya · ${monthName(f.month)}`}
      title="The Kenya Poverty Premium"
      lede={
        <p>
          What a low-income Kenyan pays, or forgoes, for the same financial need, against the best option a better-off person can reach: borrowing, saving
          and sending money. Every figure is computed by code from a published source, named and dated on its line. Where we do not hold the data, the line
          says so.
        </p>
      }
      aside={<Headline f={f} />}
    >
      {f.oldInputs.length ? (
        <p className="mb-6 max-w-3xl rounded-xl border-l-4 border-warn bg-paper-2 px-4 py-3 text-[13px] leading-6 text-ink-soft">
          <span className="font-semibold text-ink">Old data: </span>
          {f.oldInputs.map((o) => `${o.id.split("#")[0]} is for ${when(o.asOf)}, ${o.ageDays} days before the end of ${monthName(f.month)}`).join("; ")}. It is the
          latest we hold.
        </p>
      ) : null}

      {NEEDS.map((need) => {
        const lines = ok.filter((l) => l.need === need);
        const needGaps = gaps.filter((l) => l.need === need);
        if (!lines.length && !needGaps.length) return null;
        return (
          <section key={need} className="mt-10 first:mt-0">
            <SectionTitle kicker={`${monthName(f.month)} file`} title={need} />
            {need === "Sending money" ? <Sending lines={lines} /> : lines.map((l) => <LineCard key={l.id} line={l} />)}
            {needGaps.map((g) => (
              <GapCard key={g.id} line={g} />
            ))}
          </section>
        );
      })}

      <section id="method" className="mt-14 max-w-3xl scroll-mt-24">
        <SectionTitle kicker="Method" title="How the Premium is computed" />
        <div className="mt-4 space-y-3 text-[15px] leading-7 text-ink-soft">
          <p>
            Each line takes one need and one household example, and sets the option a low-income Kenyan typically uses beside the best option or benchmark a
            better-off person can reach. The premium is the difference in shillings (dollars for sending money) on that example, and in percentage points a
            year.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-medium text-ink">Borrowing.</span> The M-PESA overdraft costs its one-off access fee plus the published daily fee for the
              balance band. A mobile loan costs the lowest published charge among the loans we track. Both are set against the Central Bank of Kenya’s
              weighted average lending rate, charged as simple interest for the same days. That average is a benchmark: nobody can borrow KES 1,000 for a
              week at it.
            </li>
            <li>
              <span className="font-medium text-ink">Saving.</span> A year’s interest on the example in a bank savings account at the industry average, against
              the latest 364-day Treasury bill, both after {f.taxRate * 100}% withholding tax. The bill needs at least KES 50,000. Money market fund yields are
              shown beside the line and are not part of it.
            </li>
            <li>
              <span className="font-medium text-ink">Sending money.</span> The World Bank’s average cost of sending USD 200 to Kenya, across the services it
              surveyed in each corridor, against the cheapest service in the same survey.
            </li>
            <li>
              <span className="font-medium text-ink">Gaps.</span> A SACCO loan rate and deposit cover for bank and SACCO savers are not in any file we hold, so
              those lines are published empty. They are filled only from a dated primary source.
            </li>
          </ul>
          <p>
            Lines are not added together: they are different needs, in different currencies, on examples we chose. A new file is made at the start of each
            month from the data held that day; a month’s file is not changed afterwards except to correct an error, which is logged at{" "}
            <Link href="/corrections" className="text-forest underline underline-offset-2">
              /corrections
            </Link>
            . A figure is only as current as its source: the date on each line is the date of the figure, not of this file.
          </p>
          <p className="font-medium text-ink">Information, not advice.</p>
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <SectionTitle kicker="Files" title="Every month" />
        <ul className="mt-3 space-y-1 text-[14px]">
          {months.map((m) => (
            <li key={m}>
              {monthName(m)}:{" "}
              <a href={`/api/data/poverty-premium?month=${m}`} download className="text-forest underline underline-offset-2">
                CSV
              </a>{" "}
              ·{" "}
              <a href={`/api/data/poverty-premium?month=${m}&format=xlsx`} download className="text-forest underline underline-offset-2">
                Excel
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[12px] text-muted">
          {monthName(f.month)} file made {dayFmt.format(new Date(f.generatedAt))}, version {f.version}.
        </p>
      </section>

      <CiteBlock
        title={`Kenya Poverty Premium, ${monthName(f.month)}`}
        path="/data/poverty-premium"
        publisher="the Central Bank of Kenya, Safaricom, mobile lenders and the World Bank"
        csv="/api/data/poverty-premium"
      />
    </PageShell>
  );
}
