import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { climateGap, climateSlots } from "@/lib/demo/climate";
import { featuredCountrySlugs, getCountry } from "@/lib/demo/countries";
import { projectDisclaimer, projectLensFields } from "@/lib/demo/projects";

export const metadata: Metadata = {
  title: "Climate Capital",
  description: "Afronomics Climate Capital — committed vs deployed vs requirement, country profiles and Project Lens. No fabricated climate numbers.",
};

export default function ClimatePage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Climate" }]}
      kicker="Afronomics Climate Capital"
      title="Climate money, projects and the financing gap"
      lede="Committed, deployed and estimated requirement stay empty until each figure carries a source, URL, publication date and observation date."
    >
      <section>
        <h2 className="font-serif text-2xl">Climate finance gap</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <EmptyMetric label="Committed" note={climateGap.committed === "—" ? climateGap.note : undefined} />
          <EmptyMetric label="Deployed" />
          <EmptyMetric label="Estimated requirement" />
        </div>
        <Provenance source="Not stored" methodology={climateGap.note} />
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Country climate profiles</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCountrySlugs.map((slug) => {
            const country = getCountry(slug);
            if (!country) return null;
            return (
              <li key={slug} className="border border-rule p-4">
                <Link href={`/countries/${slug}#climate`} className="font-serif text-xl hover:text-forest">
                  {country.name} climate capital
                </Link>
                <p className="mt-2 text-sm text-muted">All {climateSlots.length} slots empty until sourced.</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12" id="project-lens">
        <h2 className="font-serif text-2xl">Project Lens</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">{projectDisclaimer}</p>
        <ul className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          {projectLensFields.map((field) => (
            <li key={field} className="border border-rule px-3 py-2 text-muted">
              {field} —
            </li>
          ))}
        </ul>
      </section>
    </LayerPage>
  );
}
