import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { regionHubs } from "@/lib/demo/regions";

export const metadata: Metadata = {
  title: "Regions",
  description: "Regional hubs for Afronomics country terminals and graph desks. Not a live GIS.",
};

export default function RegionsPage() {
  const hubs = regionHubs();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Regions" }]}
      kicker="Regions"
      title="Five regions, empty cells"
      lede="Each hub lists country terminals and graph desks that already have editorial edges. Observation cells stay blank until cited."
    >
      <p className="text-sm">
        <Link href="/countries" className="text-forest underline underline-offset-2">
          Countries
        </Link>
        {" · "}
        <Link href="/graph" className="text-forest underline underline-offset-2">
          Graph
        </Link>
        {" · "}
        <Link href="/compare" className="text-forest underline underline-offset-2">
          Compare
        </Link>
        {" · "}
        <Link href="/coverage" className="text-forest underline underline-offset-2">
          Coverage
        </Link>
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {hubs.map((hub) => (
          <li key={hub.slug} className="border border-rule px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {hub.countrySlugs.length} countries · {hub.deskSlugs.length} desks
            </p>
            <Link href={`/regions/${hub.slug}`} className="mt-1 block font-serif text-xl hover:text-forest">
              {hub.label}
            </Link>
            <p className="mt-2 text-sm text-ink-soft">{hub.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Country region tags" methodology="Hubs are indexes. No invented regional prints." />
    </LayerPage>
  );
}
