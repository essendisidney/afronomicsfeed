import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { cities, cityCountryName } from "@/lib/demo/cities";

export const metadata: Metadata = {
  title: "Cities",
  description: "African city files — desks, ports and exchanges linked when a sourced row exists.",
};

export default function CitiesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Cities" }]}
      kicker="Cities"
      title="Desks on the ground"
      lede="A city file is a place on the graph. Ports and exchanges appear only when they already have a sourced row."
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => (
          <li key={city.slug}>
            <Link href={`/cities/${city.slug}`} className="block border border-rule px-4 py-3 hover:border-gold">
              <p className="font-serif text-xl">{city.name}</p>
              <p className="mt-1 text-sm text-ink-soft">{cityCountryName(city)}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{city.role}</p>
            </Link>
          </li>
        ))}
      </ul>
    </LayerPage>
  );
}
