import type { Metadata } from "next";
import Link from "next/link";
import { CountryIndex } from "@/components/countries/CountryIndex";
import { LayerPage } from "@/components/intelligence/LayerPage";

export const metadata: Metadata = {
  title: "Countries",
  description: "Country intelligence terminals for 54 African states. Pulse and indicators stay empty until sourced.",
};

export default function CountriesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Countries" }]}
      kicker="Africa Opportunity Map"
      title="Every country is a terminal"
      lede="Click a state. Open Pulse, economy, markets, capital, climate, technology, trade, policy, companies and energy. The map is an exploration interface — not a live GIS of invented flows."
    >
      <p className="mb-8 text-sm">
        <Link href="/compare" className="text-forest underline underline-offset-2">
          Compare featured desks
        </Link>
        {" · "}
        <Link href="/regions" className="text-forest underline underline-offset-2">
          Regions
        </Link>
        {" · "}
        <Link href="/sources" className="text-forest underline underline-offset-2">
          Source registry
        </Link>
        {" · "}
        <Link href="/graph" className="text-forest underline underline-offset-2">
          Graph
        </Link>
      </p>
      <CountryIndex />
    </LayerPage>
  );
}
