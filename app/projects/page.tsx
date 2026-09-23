import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { countries } from "@/lib/demo/countries";
import { projectDisclaimer, projectFileHref, projectLensFields } from "@/lib/demo/projects";

export const metadata: Metadata = {
  title: "Project Lens",
  description: "Afronomics Project Lens — discovery files, not a marketplace. No invented bankability.",
};

export default function ProjectsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Projects" }]}
      kicker="Project Lens"
      title="A place for a cited project, not a pitch deck"
      lede={projectDisclaimer}
    >
      <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        {projectLensFields.map((field) => (
          <li key={field} className="border border-rule px-3 py-2 text-muted">
            {field} —
          </li>
        ))}
      </ul>
      <section className="mt-12">
        <h2 className="font-serif text-2xl">Country files</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((country) => (
            <li key={country.slug}>
              <Link href={projectFileHref(country.slug)} className="block border border-rule px-3 py-3 hover:border-gold">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{country.iso}</p>
                <p className="mt-1 font-serif text-lg">{country.name}</p>
                <p className="mt-1 text-xs text-muted">No sourced project</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </LayerPage>
  );
}
