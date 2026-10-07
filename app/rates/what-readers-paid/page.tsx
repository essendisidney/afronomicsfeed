import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { ReaderReportForm } from "@/components/ui/ReaderReportForm";
import { readerSummary } from "@/lib/reader-reports";
import { COUNTRIES, ITEMS, MIN_REPORTS, WINDOW_DAYS, type Country, type Item, type SummaryRow } from "@/lib/reader-reports-core";
import { site } from "@/lib/site";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "What readers paid: food, fuel, rent and rates across Africa",
  description:
    "What Afronomics readers in Kenya, Nigeria, Ghana, Uganda, Tanzania and South Africa paid this month for maize flour, sugar, cooking gas, fuel, fares and rent, and the rates their banks and SACCOs pay and charge. Add yours.",
  alternates: { canonical: `${site.url}/rates/what-readers-paid` },
};

const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

function fmt(v: number, i: Item, c: Country) {
  if (i.kind === "rate") return `${v.toFixed(v < 10 ? 1 : 0)}%`;
  return `${c.symbol}${v.toLocaleString("en-GB", { maximumFractionDigits: v < 100 ? 2 : 0 })}`;
}

const related: Record<string, { href: string; label: string }> = {
  savings_rate: { href: "/rates/kenya/check", label: "Is my rate fair?" },
  loan_rate: { href: "/rates/kenya/check", label: "Is my rate fair?" },
  mobile_loan: { href: "/rates/kenya/mobile-loans", label: "What each provider publishes" },
};

function CountryTable({ c, rows }: { c: Country; rows: SummaryRow[] }) {
  const byItem = new Map(rows.map((r) => [r.item, r]));
  const shown = ITEMS.filter((i) => byItem.has(i.id));
  return (
    <section id={c.code.toLowerCase()} className="mt-10 scroll-mt-24">
      <SectionTitle kicker={`${c.name} · last ${WINDOW_DAYS} days`} title={`What readers in ${c.name} paid`} />
      <div className="mt-3 overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>What</th>
              <th className="text-right">Middle figure</th>
              <th className="text-right">Middle half paid</th>
              <th className="text-right">Reports</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((i) => {
              const r = byItem.get(i.id)!;
              const rel = c.code === "KE" ? related[i.id] : undefined;
              return (
                <tr key={i.id}>
                  <td className="text-sm">
                    {i.label}
                    {i.unit ? <span className="text-muted">, {i.unit}</span> : null}
                    {rel ? (
                      <Link href={rel.href} className="block text-[11px] text-forest underline underline-offset-2">
                        {rel.label}
                      </Link>
                    ) : null}
                  </td>
                  {r.median != null ? (
                    <>
                      <td className="text-right text-sm font-semibold">{fmt(r.median, i, c)}</td>
                      <td className="text-right text-sm text-ink-soft">
                        {fmt(r.low!, i, c)} – {fmt(r.high!, i, c)}
                      </td>
                    </>
                  ) : (
                    <td colSpan={2} className="text-right text-[13px] text-muted">
                      needs {MIN_REPORTS - r.n} more report{MIN_REPORTS - r.n === 1 ? "" : "s"}
                    </td>
                  )}
                  <td className="text-right text-xs text-muted">
                    {r.n}
                    <span className="block">latest {dayFmt.format(new Date(r.latest))}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function WhatReadersPaidPage() {
  const rows = (await readerSummary()) ?? [];
  const countries = COUNTRIES.filter((c) => rows.some((r) => r.country === c.code));
  const published = rows.filter((r) => r.median != null).length;

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "What readers paid" }]}
      kicker="Afronomics · reader reports"
      title="What readers paid"
      lede={
        <p>
          Official figures tell you the average. This page tells you what people like you actually paid this month: for maize flour, sugar,
          cooking gas, fuel, fares and rent, and the rates their banks, SACCOs and loan apps pay and charge. Every figure is the middle of at
          least {MIN_REPORTS} reports from different readers in the last {WINDOW_DAYS} days.
        </p>
      }
    >
      <ReaderReportForm />

      {countries.length ? (
        <>
          {countries.length > 1 ? (
            <nav className="mt-8 flex flex-wrap gap-1.5">
              {countries.map((c) => (
                <a key={c.code} href={`#${c.code.toLowerCase()}`} className="rounded-full border border-rule bg-surface px-3 py-1 text-[13px] hover:border-accent">
                  {c.name}
                </a>
              ))}
            </nav>
          ) : null}
          {countries.map((c) => (
            <CountryTable key={c.code} c={c} rows={rows.filter((r) => r.country === c.code)} />
          ))}
        </>
      ) : null}
      {!published ? (
        <p className="mt-8 max-w-2xl text-sm leading-6 text-ink-soft">
          Reports have just opened. A figure appears here once {MIN_REPORTS} readers in the same country have reported it. Add yours above and
          share this page with someone in your area.
        </p>
      ) : null}

      <section className="mt-14 grid gap-8 md:grid-cols-3">
        {[
          ["The middle, not the average", `We show the median — the figure in the middle — and the range the middle half of readers paid, so one very high or very low report cannot move it. Figures more than three times away from the middle are left out.`],
          ["Reported by readers, not checked receipts", "These are what readers tell us, not official statistics. We keep one figure per reader per item each day, and the desk removes any that are plainly wrong."],
          ["Never one person’s figure", "We never publish a single report, a reader’s town, or any contact details. Please don’t name a shop, bank or person in a report."],
        ].map(([t, d]) => (
          <div key={t}>
            <h3 className="font-serif text-xl text-ink">{t}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-soft">{d}</p>
          </div>
        ))}
      </section>

      <p className="mt-10 max-w-3xl text-xs leading-5 text-muted">
        Reader reports, compiled by Afronomics; information, not advice. For the official figures, see{" "}
        <Link href="/data/inflation" className="underline underline-offset-2">
          inflation by country
        </Link>
        ,{" "}
        <Link href="/rates/kenya" className="underline underline-offset-2">
          where the shilling earns most
        </Link>{" "}
        and{" "}
        <Link href="/rates/policy" className="underline underline-offset-2">
          central-bank rates
        </Link>
        .
      </p>
      <NewsletterBand />
    </PageShell>
  );
}
