import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { countriesForIndustry, industries } from "@/lib/demo/industries";

export const metadata: Metadata = {
  title: "Industries",
  description: "African industry files — sector cells unpublished until a cited print or issuer exists.",
};

export default function IndustriesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Industries" }]}
      kicker="Industries"
      title="Sectors as files, not a league table"
      lede="Each industry has a country cell so a cited issuer, output print or licence can land. No invented rankings."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {industries.map((item) => {
          const tagged = countriesForIndustry(item.slug).length;
          return (
            <li key={item.slug}>
              <Link href={`/industries/${item.slug}`} className="block border border-rule px-4 py-3 hover:border-gold">
                <p className="font-serif text-xl">{item.label}</p>
                <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                  54 country files · {tagged} tagged on the graph
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </LayerPage>
  );
}
