import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { companies, getCompany } from "@/lib/demo/companies";

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
      <ol className="mt-10 space-y-6">
        {sections.map((section) => (
          <li key={section} id={section.toLowerCase().replace(/\s+/g, "-")} className="border-t border-rule pt-4">
            <h2 className="font-serif text-xl">{section}</h2>
            <p className="mt-2 text-sm text-muted">No sourced entry in this section yet.</p>
          </li>
        ))}
      </ol>
    </LayerPage>
  );
}
