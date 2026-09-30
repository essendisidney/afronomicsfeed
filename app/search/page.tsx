import type { Metadata } from "next";
import { PageShell } from "@/components/data/PageShell";
import { SearchPageClient } from "@/components/search/SearchPageClient";
import { buildSearchIndex } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search",
  description: "Search 54 African country files, every indicator in the data hub, and Afronomics analysis.",
};

export default function SearchPage() {
  const index = buildSearchIndex();

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Search" }]}
      kicker="Search"
      title="Find a country, an indicator, a brief"
      lede={<p>Press ⌘K or Ctrl K from any page.</p>}
    >
      <SearchPageClient index={index} />
    </PageShell>
  );
}
