import type { Metadata } from "next";
import { CapitalExplorer } from "@/components/capital/CapitalExplorer";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { capitalTypes } from "@/lib/demo/capital";

export const metadata: Metadata = {
  title: "Africa Capital Tracker",
  description: "Who invested, how much, into what, where — VC, PE, DFI, climate, infrastructure, sovereign and M&A. Demo rows only.",
};

export default function CapitalPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Capital" }]}
      kicker="Africa Capital Tracker"
      title="Who funded what, across Africa"
      lede="Filter by country, sector, capital type and year once the book is sourced. Amounts stay blank until a cited transaction exists. These rows prove the table, not the market."
    >
      <p className="mb-6 text-sm text-ink-soft">
        Types in the schema: {capitalTypes.join(" · ")}.
      </p>
      <CapitalExplorer />
      <Provenance
        source="Demonstration tickets (EXAMPLE counterparties)"
        updated="No production capital book"
        methodology="Never silently overwrite a historical ticket"
      />
    </LayerPage>
  );
}
