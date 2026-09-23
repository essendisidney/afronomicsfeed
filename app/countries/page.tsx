import type { Metadata } from "next";
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
      <CountryIndex />
    </LayerPage>
  );
}
