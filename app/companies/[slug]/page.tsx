import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { companies, getCompany } from "@/lib/demo/companies";
import { industryFileHref, industryForCompanySector } from "@/lib/demo/industries";
import { site } from "@/lib/site";

const sections = [
  "Overview",
  "Sector",
  "Countries",
  "Leadership",
  "Financials",
  "Major events",
  "Funding / debt",
  "Regulatory exposure",
  "Related stories",
  "Competitors",
  "Related indicators",
];

export function generateStaticParams() {
  return companies.map((company) => ({ slug: company.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) return {};
  return {
    title: company.name,
    description: `${company.name} intelligence terminal — ${company.sector}. No invented financials.`,
    alternates: { canonical: `${site.url}/companies/${company.slug}` },
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) notFound();
  const industry = industryForCompanySector(company.sector);

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/companies", label: "Companies" },
        { label: company.name },
      ]}
      kicker={company.country}
      title={company.name}
      lede={`${company.sector}. ${company.status}.`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Revenue" />
        <EmptyMetric label="Debt" />
        <EmptyMetric label="Latest filing" />
      </div>
      <p className="mt-8 text-sm">
        <Link href={`/countries/${company.countrySlug}/companies`} className="text-forest underline underline-offset-2">
          {company.country} companies series
        </Link>
        {industry ? (
          <>
            {" · "}
            <Link href={industryFileHref(industry.slug, company.countrySlug)} className="text-forest underline underline-offset-2">
              {industry.label}
            </Link>
          </>
        ) : null}
        {company.exchangeHref ? (
          <>
            {" · "}
            <Link href={company.exchangeHref} className="text-forest underline underline-offset-2">
              Exchange file
            </Link>
          </>
        ) : null}
        {company.door ? (
          <>
            {" · "}
            <a href={company.door.href} target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-2">
              {company.door.label}
            </a>
          </>
        ) : null}
      </p>
      <ol className="mt-10 space-y-6">
        {sections.map((section) => (
          <li key={section} id={section.toLowerCase().replace(/\s+/g, "-")} className="border-t border-rule pt-4">
            <h2 className="font-serif text-xl">{section}</h2>
            <p className="mt-2 text-sm text-muted">No sourced entry in this section yet.</p>
          </li>
        ))}
      </ol>
      <Provenance
        source={company.example ? "Demonstration name" : company.door?.href ?? "Issuer scaffold"}
        methodology="Financials stay empty until a filing is stored. Claimed companies cannot silently rewrite editorial fields."
      />
    </LayerPage>
  );
}
