import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { ReferenceTerms } from "@/components/data/ReferenceTerms";
import { SectionTitle } from "@/components/data/parts";
import { TableScroll } from "@/components/ui/DataTable";
import { KCCI_NAME, KCCI_SHORT, kcciQuote, type ComponentStatus } from "@/lib/cost-of-credit";
import { kcciLatest } from "@/lib/data/cost-of-credit";
import { loadMethod } from "@/lib/methods";
import { citeLines } from "@/lib/reference-rates";
import { fitDescription, fitTitle } from "@/lib/seo";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: fitTitle(`${KCCI_NAME} (${KCCI_SHORT}): what borrowing costs in Kenya`),
  description: fitDescription(
    "What it costs to borrow KES 1,000 for 30 days in Kenya, by kind of lender: the CBK bank lending average and published mobile-loan charges, on one yardstick, with sources, dates and the gaps. Indicative, version 0.",
  ),
  alternates: { canonical: `${site.url}/rates/kenya/cost-of-credit` },
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const kes = (n: number) => `KES ${n.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const when = (s: string | null) => (s == null ? "—" : /^\d{4}-\d{2}$/.test(s) ? monthFmt.format(new Date(`${s}-01T00:00:00Z`)) : dayFmt.format(new Date(s)));

const statusLabel: Record<ComponentStatus, string> = { included: "Included", insufficient: "No reading", gap: "Gap: not held", excluded: "Excluded for now" };

export default function CostOfCreditPage() {
  const { reading, bankSource } = kcciLatest();
  const method = loadMethod("kcci");
  const bank = reading.components.find((c) => c.key === "bank")!;
  const mobile = reading.components.find((c) => c.key === "mobile")!;
  const multiple = bank.yearly && mobile.yearly ? mobile.yearly / bank.yearly : null;
  const quote = kcciQuote(reading, (iso) => dateFmt.format(new Date(iso)));
  const cite = citeLines({ name: KCCI_NAME, shortName: KCCI_SHORT, version: reading.version, readingDate: reading.asOf, url: `${site.url}/rates/kenya/cost-of-credit` });

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/rates/kenya", label: "Kenya rates" }, { label: "Cost of credit" }]}
      kicker={`${KCCI_NAME} · version ${reading.version} · indicative`}
      title="What borrowing costs in Kenya, by kind of lender"
      lede={
        <p>
          The same KES 1,000 for 30 days, priced from what we hold with a source and a date: the Central Bank of Kenya’s bank lending average and the
          charges mobile-loan providers publish. SACCO loans are a gap we have not filled yet. Categories of lender, not a ranking of lenders.
        </p>
      }
      aside={
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
          <p className="text-[13px] font-medium text-muted">Borrow KES 1,000 for 30 days</p>
          <dl className="mt-2 space-y-2">
            {[bank, mobile].map((c) => (
              <div key={c.key} className="flex items-baseline justify-between gap-3">
                <dt className="text-[14px] text-ink">{c.label}</dt>
                <dd className="af-figure font-serif text-2xl text-ink">{c.per1000 == null ? "—" : kes(c.per1000)}</dd>
              </div>
            ))}
          </dl>
          {multiple ? <p className="mt-3 text-[13px] text-ink-soft">A mobile loan costs about {multiple.toFixed(0)} times the bank average, as a yearly rate.</p> : null}
          <p className="mt-3 text-[11px] text-muted">
            {reading.included} of {reading.categories} categories covered · reading of {dayFmt.format(new Date(reading.asOf))}
          </p>
        </div>
      }
    >
      <section>
        <SectionTitle kicker="Latest reading" title="The components" note="Yearly rates are simple: the charge for the term × 365 ÷ days, without compounding, so a mobile loan can be set beside a bank rate." />
        <TableScroll label="Kenya Cost of Credit Index components" className="mt-2">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Status</th>
                <th className="text-right">Yearly rate</th>
                <th className="text-right">KES 1,000 for 30 days</th>
                <th>Input as of</th>
                <th>Basis</th>
              </tr>
            </thead>
            <tbody>
              {reading.components.map((c) => (
                <tr key={c.key}>
                  <td className="font-medium">{c.label}</td>
                  <td className="text-xs">{statusLabel[c.status]}</td>
                  <td className="text-right font-semibold">{c.yearly == null ? "—" : `${c.key === "mobile" ? c.yearly.toFixed(0) : c.yearly.toFixed(2)}%`}</td>
                  <td className="text-right">{c.per1000 == null ? "—" : kes(c.per1000)}</td>
                  <td className="text-xs">{when(c.asOf)}</td>
                  <td className="max-w-sm text-xs text-ink-soft">
                    {c.basis}. {c.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
        {quote ? <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-soft">Quote it as: “{quote}”</p> : null}
      </section>

      <section className="mt-14">
        <SectionTitle
          kicker="Sources"
          title="Every input, with its source and date"
          href="/rates/kenya/mobile-loans"
          hrefLabel="Mobile loan costs"
          note="Published prices as each source states them, in alphabetical order. A product is an input to the mobile reading, not rated or ranked."
        />
        <TableScroll label="Kenya Cost of Credit Index inputs" className="mt-2">
          <table className="data-table">
            <thead>
              <tr>
                <th>Input</th>
                <th className="text-right">Yearly rate</th>
                <th>Read or dated</th>
                <th>Counted?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {bankSource ? (
                    <a href={bankSource} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-forest">
                      CBK weighted average lending rate
                    </a>
                  ) : (
                    "CBK weighted average lending rate"
                  )}
                  <span className="block text-[11px] text-muted">Central Bank of Kenya, commercial banks</span>
                </td>
                <td className="text-right">{bank.yearly == null ? "—" : `${bank.yearly.toFixed(2)}%`}</td>
                <td className="text-xs">{when(bank.asOf)}</td>
                <td className="text-xs">{bank.status === "included" ? "Yes" : "No"}</td>
              </tr>
              {reading.mobileProducts.map((p) => (
                <tr key={p.product}>
                  <td>
                    <a href={p.source} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-forest">
                      {p.product}
                    </a>
                    <span className="block text-[11px] text-muted">{p.provider}, published terms</span>
                  </td>
                  <td className="text-right">
                    {p.from ? "from " : ""}
                    {p.yearlySimple.toFixed(0)}%
                  </td>
                  <td className="text-xs">{when(p.readOn)}</td>
                  <td className="max-w-xs text-xs">{p.counted ? "Yes" : `No. ${p.reason}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      </section>

      <section className="mt-14 max-w-3xl">
        <SectionTitle kicker="Gaps" title="What the index does not cover yet" />
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-ink-soft">
          {reading.components
            .filter((c) => c.status !== "included")
            .map((c) => (
              <li key={c.key}>
                <strong className="text-ink">{c.label}.</strong> {c.note}
              </li>
            ))}
          <li>
            <strong className="text-ink">Fees on bank loans.</strong> The CBK average is an interest rate only; arrangement fees, insurance and other charges
            are not in it, so the full cost of a bank loan is higher than shown.
          </li>
          <li>
            <strong className="text-ink">No single blended number.</strong> We hold no lending volumes by category to weight one, so version 0 shows each
            category on its own.
          </li>
        </ul>
        <p className="mt-6 text-sm leading-6 text-ink-soft">
          How it is computed, the windows and minimums, revisions and governance:{" "}
          <Link href="/rates/kenya/cost-of-credit/method" className="font-medium text-forest underline underline-offset-2">
            {KCCI_SHORT} method, version {method.version}
          </Link>
          .
        </p>
        <p className="mt-4 text-sm font-medium text-ink">Information, not advice.</p>
      </section>

      <ReferenceTerms shortName={KCCI_SHORT} cite={cite} />
    </PageShell>
  );
}
