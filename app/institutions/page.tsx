import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { getArticlesByInstitution } from "@/lib/content";
import { institutions } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "Institutions",
  description: "The primaries this desk cites: CBK, CMA, NSE, Treasury, SASRA, and IRA.",
};

export default function InstitutionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Institutions"
        title="Cite the right primary"
        lede="A map of who publishes what. Mandates are role descriptions, not this week’s prints. Official sites remain the source of record."
      />
      <ul className="mt-12 space-y-4">
        {institutions.map((institution) => {
          const count = getArticlesByInstitution(institution.slug).length;
          return (
            <li key={institution.slug}>
              <Link
                href={`/institutions/${institution.slug}`}
                className="block border border-rule px-5 py-5 hover:border-gold"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-2xl text-ink">{institution.short}</h2>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                    {count} {count === 1 ? "piece" : "pieces"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-forest">{institution.name}</p>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{institution.mandate}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
