import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { LoanCell } from "@/app/api/loan-reports/route";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Questions } from "@/components/seo/Questions";
import { ShareRow } from "@/components/ui/ShareRow";
import { LOAN_APPS, lenderBySlug, lenderDomain, lenderHref, lenderSlug, loadLenders } from "@/lib/data/loan-apps";
import { site } from "@/lib/site";
import { rpc } from "@/lib/store";

export const revalidate = 3600;

type Props = { params: Promise<{ lender: string }> };

const longDate = (iso: string | null | undefined) =>
  iso ? new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";
const monthOf = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;

export function generateStaticParams() {
  const f = loadLenders();
  return [...(f?.lenders ?? []).map((l) => l.name), ...(f?.removed ?? []).map((r) => r.name)].map((name) => ({ lender: lenderSlug(name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = lenderBySlug((await params).lender);
  if (!found) return {};
  const name = found.lender?.name ?? found.removed!.name;
  const updated = longDate(found.file.updated);
  return {
    title: `Is ${name} licensed by the CBK? Licence and contacts`,
    description: found.lender
      ? `Yes: ${name} is on the Central Bank of Kenya's directory of licensed digital credit providers of ${updated}${found.lender.licensed ? `, licensed ${longDate(found.lender.licensed)}` : ""}. Its contacts as the CBK publishes them, and what borrowers report it costs.`
      : `${name} is no longer on the Central Bank of Kenya's directory of licensed digital credit providers (directory of ${updated}).`,
    alternates: { canonical: `${site.url}${lenderHref(name)}` },
  };
}

async function cellFor(name: string): Promise<LoanCell | null> {
  const r = await rpc("af_loan_report_summary", { p_secret: process.env.AF_CRON_SECRET ?? "" });
  return r.ok && Array.isArray(r.value) ? ((r.value as LoanCell[]).find((c) => c.lender === name) ?? null) : null;
}

/** One licensed digital lender: is it on the CBK's list, since when, how to reach it, and what borrowers report it costs. */
export default async function LenderPage({ params }: Props) {
  const found = lenderBySlug((await params).lender);
  if (!found) notFound();
  const { file: f, lender: l, removed } = found;
  const name = l?.name ?? removed!.name;
  const updated = longDate(f.updated);
  const domain = l ? lenderDomain(l.email) : "";
  const cell = l ? await cellFor(name) : null;
  const sameMonth = l?.licensed
    ? f.lenders.filter((x) => x.name !== name && x.licensed?.slice(0, 7) === l.licensed!.slice(0, 7)).slice(0, 8)
    : [];

  const items = [
    {
      q: `Is ${name} licensed by the Central Bank of Kenya?`,
      a: l
        ? `Yes. ${name} is on the CBK's Directory of Digital Credit Providers updated ${updated}${l.licensed ? `, licensed on ${longDate(l.licensed)}` : ""}. The licence is for the company: check that the loan app you use names ${name} as its developer or lender.`
        : `${name} was on an earlier CBK directory${removed!.last_listed ? ` (${longDate(removed!.last_listed)})` : ""} but is not on the directory of ${updated}. A digital lender not on the current list is not licensed by the CBK to lend.`,
    },
    ...(l && (l.phone || l.email)
      ? [{ q: `How do I contact ${name}?`, a: `The CBK's directory lists ${[l.phone && `phone ${l.phone}`, l.email && `email ${l.email}`, l.address && `office at ${l.address}`].filter(Boolean).join(", ")}.` }]
      : []),
    {
      q: `What can I do if ${name} contacts my friends or family?`,
      a: "Complain to the lender in writing first and keep the messages. If it is not resolved, complain to the Central Bank of Kenya, which supervises licensed digital lenders. Use of your contacts' details without consent can also be reported to the Office of the Data Protection Commissioner.",
    },
  ];

  return (
    <PageShell
      crumbs={[
        { href: "/", label: "Home" },
        { href: LOAN_APPS, label: "Is this loan app licensed?" },
        { label: name },
      ]}
      kicker="Loan app check · Kenya"
      title={`Is ${name} licensed?`}
      lede={<p>Checked against the Central Bank of Kenya’s Directory of Digital Credit Providers, updated {updated}.</p>}
    >
      {l ? (
        <div className="rounded-2xl border-l-4 border-forest bg-forest/5 px-5 py-4 text-[15px] leading-6 text-ink-soft">
          <p>
            <span className="mr-2 rounded-full bg-forest/10 px-2 py-0.5 text-[12px] font-semibold text-forest">Licensed</span>
            <strong className="text-ink">Yes, {name} is on the CBK’s list</strong>
            {l.licensed ? `, licensed on ${longDate(l.licensed)}` : ""}.
          </p>
          <p className="mt-2 text-[14px]">
            The CBK licenses companies, not apps. Before you borrow, check that the app names {name} as its lender or developer (in its terms, or under
            “developer” on the app store page).
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border-l-4 border-accent bg-accent/5 px-5 py-4 text-[15px] leading-6 text-ink-soft">
          <p>
            <strong className="text-ink">No longer on the CBK’s list.</strong> {name} was in the directory
            {removed!.last_listed ? ` of ${longDate(removed!.last_listed)}` : " we read earlier"} and is missing from the directory of {updated}.
          </p>
          <p className="mt-2 text-[14px]">A digital lender that is not on the current list is not licensed by the Central Bank to lend.</p>
        </div>
      )}

      {l ? (
        <section className="mt-10">
          <SectionTitle kicker="From the CBK’s directory" title="Licence and contacts" note="As the Central Bank publishes them." />
          <dl className="mt-4 grid gap-x-8 gap-y-3 text-[14px] sm:grid-cols-2">
            {[
              ["Licensed", longDate(l.licensed) || "Date not stated"],
              ["Phone", l.phone],
              ["Email", l.email],
              ["Email domain", domain],
              ["Office", l.address],
              ["Postal address", l.postal],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="border-b border-rule pb-2">
                  <dt className="text-[12px] text-muted">{k}</dt>
                  <dd className="break-words text-ink">{v}</dd>
                </div>
              ))}
          </dl>
          {domain ? (
            <p className="mt-2 text-[12px] text-muted">
              The email domain often matches the app’s or company’s website; an app using a different name may still be this lender, so check the developer.
            </p>
          ) : null}
        </section>
      ) : null}

      {l ? (
        <section className="mt-10">
          <SectionTitle kicker="From borrowers" title={`What borrowing from ${name} costs`} note="Cost per KES 1,000 for 30 days, every fee included, from borrowers’ anonymous reports." />
          {cell?.median != null ? (
            <p className="mt-4 text-[15px] leading-6 text-ink-soft">
              <strong className="text-ink">{kes(cell.median)}</strong> per KES 1,000 for 30 days is the middle of {cell.n} reports (half between {kes(cell.low!)}{" "}
              and {kes(cell.high!)}).
              {cell.shamed_pct != null ? ` ${cell.shamed_pct}% of those who answered say it contacted their friends or family.` : ""}
            </p>
          ) : (
            <p className="mt-4 max-w-2xl rounded-xl border border-rule bg-surface px-4 py-3 text-sm text-ink-soft">
              {cell?.n ? `${cell.n} report${cell.n === 1 ? "" : "s"} so far` : "No reports yet"}: a figure appears once five borrowers have reported {name}.
              Borrowed from it?{" "}
              <Link href={`${LOAN_APPS}#report`} className="font-semibold text-forest underline underline-offset-2">
                Add what it cost you
              </Link>
              , anonymously.
            </p>
          )}
          <p className="mt-2 text-[12px] text-muted">For comparison, a bank or SACCO loan at 15% a year costs about KES 12 per KES 1,000 for 30 days.</p>
        </section>
      ) : null}

      <div className="mt-8">
        <ShareRow text={`Is ${name} licensed by the Central Bank of Kenya? Check any loan app:`} path={lenderHref(name)} />
      </div>

      {sameMonth.length ? (
        <section className="mt-10">
          <SectionTitle kicker="Same month" title={`Also licensed in ${monthOf(l!.licensed!)}`} />
          <ul className="mt-3 grid gap-x-8 text-sm sm:grid-cols-2">
            {sameMonth.map((x) => (
              <li key={x.no} className="border-b border-rule py-2">
                <Link href={lenderHref(x.name)} className="text-ink hover:text-forest">
                  {x.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-10 text-sm text-ink-soft">
        <Link href={LOAN_APPS} className="font-semibold text-forest underline underline-offset-2">
          Search all {f.lenders.length} licensed lenders →
        </Link>
      </p>
      <p className="mt-4 text-sm text-ink-soft">
        Source: Central Bank of Kenya,{" "}
        <a href={f.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          Directory of Digital Credit Providers
        </a>
        , updated {updated}; read {longDate(f.read_at.slice(0, 10))}. <em>Information, not advice.</em>
      </p>
      <Questions items={items} />
    </PageShell>
  );
}
