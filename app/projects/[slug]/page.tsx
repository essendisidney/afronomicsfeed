import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { getCountry } from "@/lib/demo/countries";
import { projectCountryParams, projectDisclaimer, projectLensFields } from "@/lib/demo/projects";
import { corridorsForCountry, portsForCountry } from "@/lib/demo/trade";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return projectCountryParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountry(slug);
  if (!country) return {};
  return {
    title: `${country.name} Project Lens`,
    description: `Project discovery file for ${country.name}. ${projectDisclaimer}`,
    alternates: { canonical: `${site.url}/projects/${country.slug}` },
  };
}

export default async function ProjectCountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = getCountry(slug);
  if (!country) notFound();
  const corridors = corridorsForCountry(country.slug);
  const ports = portsForCountry(country.slug);

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/projects", label: "Projects" },
        { label: country.name },
      ]}
      kicker={`Project Lens · ${country.iso}`}
      title={`${country.name} Project Lens`}
      lede={`${projectDisclaimer} This country file is empty until a cited project exists.`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Projects on file" />
        <EmptyMetric label="Capital requirement" />
        <EmptyMetric label="Funding status" />
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        {projectLensFields.map((field) => (
          <li key={field} className="border border-rule px-3 py-2 text-muted">
            {field} —
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm">
        <Link href={`/climate/${country.slug}`} className="text-forest underline underline-offset-2">
          Climate capital
        </Link>
        {" · "}
        <Link href={`/capital/infrastructure/${country.slug}`} className="text-forest underline underline-offset-2">
          Infrastructure book
        </Link>
        {" · "}
        <Link href={`/capital/project-finance/${country.slug}`} className="text-forest underline underline-offset-2">
          Project finance
        </Link>
        {" · "}
        <Link href={`/countries/${country.slug}/energy`} className="text-forest underline underline-offset-2">
          Energy series
        </Link>
      </p>
      {corridors.length > 0 || ports.length > 0 ? (
        <ul className="mt-6 flex flex-wrap gap-3 text-sm">
          {corridors.map((corridor) => (
            <li key={corridor.slug}>
              <Link href={`/trade/${corridor.slug}/${country.slug}`} className="text-forest underline underline-offset-2">
                {corridor.name}
              </Link>
            </li>
          ))}
          {ports.map((port) => (
            <li key={port.slug}>
              <Link href={`/trade/ports/${port.slug}`} className="text-forest underline underline-offset-2">
                {port.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <Provenance source="No sourced project" methodology={projectDisclaimer} />
    </LayerPage>
  );
}
