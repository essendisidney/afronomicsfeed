import type { Metadata } from "next";
import { PageShell } from "@/components/data/PageShell";
import { HubSections } from "@/components/hub/HubSections";
import { compareSections } from "@/lib/hubs";
import { fitDescription } from "@/lib/seo";
import { site } from "@/lib/site";

const description =
  "Peer tables in the same units: money market funds, SACCOs, banks, mobile lenders, government borrowing costs and the cost of sending money home.";

export const metadata: Metadata = {
  title: "Compare savers, lenders and governments",
  description: fitDescription(description),
  alternates: { canonical: `${site.url}/compare` },
};

export default function ComparePage() {
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Today" }, { label: "Compare" }]}
      kicker="Compare"
      title="Side by side, in the same units"
      lede="Peer tables built from what each provider or government publishes. A registry of every SACCO, bank and microfinance bank, compared on liquidity, bad loans and capital, is being built from the regulators' returns."
    >
      <HubSections sections={compareSections} />
    </PageShell>
  );
}
