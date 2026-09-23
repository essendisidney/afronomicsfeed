import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { DemoMark } from "@/components/ui/DemoMark";
import { companies } from "@/lib/demo/companies";

export const metadata: Metadata = {
  title: "Companies",
  description: "Afronomics company intelligence terminals. Financials stay empty until a filing is stored.",
};

export default function CompaniesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Companies" }]}
      kicker="Company intelligence"
      title="Issuers and operators, not a tip sheet"
      lede="Profiles can later be claimed. Claimed companies cannot silently rewrite editorial fields. No paid alteration of the file."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {companies.map((company) => (
          <li key={company.slug} className="border border-rule p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">{company.country}</p>
              <DemoMark kind="methodology" />
            </div>
            <h2 className="mt-2 font-serif text-2xl">
              <Link href={`/companies/${company.slug}`} className="hover:text-forest">
                {company.name}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-ink-soft">{company.sector}</p>
            <p className="mt-2 text-xs text-muted">{company.status}</p>
          </li>
        ))}
      </ul>
    </LayerPage>
  );
}
