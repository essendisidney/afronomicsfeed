import type { Metadata } from "next";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { SearchPageClient } from "@/components/search/SearchPageClient";
import { buildSearchIndex } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Afronomics countries, companies, corridors and the Kenya desk file.",
};

export default function SearchPage() {
  const index = buildSearchIndex();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Search" }]}
      kicker="Search"
      title="Find a country, a corridor, a file"
      lede="⌘K from any page. Free search covers published desks and scaffolds. Advanced saved searches sit on Pro once auth is live."
    >
      <SearchPageClient index={index} />
    </LayerPage>
  );
}
