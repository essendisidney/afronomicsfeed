import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { ReferenceTerms } from "@/components/data/ReferenceTerms";
import { SectionTitle } from "@/components/data/parts";
import { MarkdownBody } from "@/components/ui/MarkdownBody";
import { KCCI_NAME, KCCI_SHORT } from "@/lib/cost-of-credit";
import { kcciLatest } from "@/lib/data/cost-of-credit";
import { loadMethod } from "@/lib/methods";
import { citeLines } from "@/lib/reference-rates";
import { fitDescription, fitTitle } from "@/lib/seo";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: fitTitle(`${KCCI_SHORT} method and governance`),
  description: fitDescription(
    "How the Afronomics Kenya Cost of Credit Index is built: inputs and sources, the yardstick, windows and minimums, gaps, revisions, governance and conflicts, and how to cite and license it.",
  ),
  alternates: { canonical: `${site.url}/rates/kenya/cost-of-credit/method` },
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default function CostOfCreditMethodPage() {
  const method = loadMethod("kcci");
  const governance = loadMethod("governance");
  const { reading } = kcciLatest();
  const cite = citeLines({ name: KCCI_NAME, shortName: KCCI_SHORT, version: reading.version, readingDate: reading.asOf, url: `${site.url}/rates/kenya/cost-of-credit` });

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/rates/kenya", label: "Kenya rates" }, { href: "/rates/kenya/cost-of-credit", label: "Cost of credit" }, { label: "Method" }]}
      kicker={`${KCCI_NAME} · method version ${method.version}`}
      title={`How the ${KCCI_SHORT} is built, revised and governed`}
      lede={
        <p>
          The published method of the{" "}
          <Link href="/rates/kenya/cost-of-credit" className="underline underline-offset-2">
            {KCCI_NAME}
          </Link>
          , version 0: what goes in, what is left out and why, and the rules for gaps, revisions and conflicts.
        </p>
      }
      aside={
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
          <p className="text-[13px] font-medium text-muted">{method.status}</p>
          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px]">
            <dt className="text-muted">Method</dt>
            <dd className="font-semibold text-ink">Version {method.version}</dd>
            <dt className="text-muted">In force since</dt>
            <dd className="text-ink">{method.inForceSince ? dayFmt.format(new Date(method.inForceSince)) : "—"}</dd>
            <dt className="text-muted">Next review</dt>
            <dd className="text-ink">{method.nextReview ? dayFmt.format(new Date(method.nextReview)) : "—"}</dd>
            <dt className="text-muted">Coverage</dt>
            <dd className="text-ink">
              {reading.included} of {reading.categories} categories
            </dd>
          </dl>
        </div>
      }
    >
      <section className="max-w-3xl">
        <MarkdownBody content={method.body} />
        <p className="mt-6 text-sm font-medium text-ink">Information, not advice.</p>
      </section>

      <section id="governance" className="mt-14 max-w-3xl scroll-mt-24">
        <SectionTitle kicker="Governance" title={governance.title} note={governance.documented ? `Updated ${dateFmt.format(new Date(governance.documented))}.` : undefined} />
        <div className="mt-4">
          <MarkdownBody content={governance.body} />
        </div>
      </section>

      <ReferenceTerms shortName={KCCI_SHORT} cite={cite} />
    </PageShell>
  );
}
