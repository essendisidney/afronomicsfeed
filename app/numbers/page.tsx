import type { Metadata } from "next";
import { PageShell } from "@/components/data/PageShell";
import { HubSections } from "@/components/hub/HubSections";
import { KeyRates } from "@/components/rates/KeyRates";
import { FollowSheet } from "@/components/rates/FollowSheet";
import { numbersSections } from "@/lib/hubs";
import { fitDescription } from "@/lib/seo";
import { site } from "@/lib/site";

const description =
  "Every number Afronomics keeps, by the question you bring: what governments pay to borrow, what savings pay after tax, what loans cost, policy rates, currencies and the economy.";

export const metadata: Metadata = {
  title: "Numbers: African rates, auctions and currencies",
  description: fitDescription(description),
  alternates: { canonical: `${site.url}/numbers` },
};

export default function NumbersPage() {
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Today" }, { label: "Numbers" }]}
      kicker="Numbers"
      title="Every number we keep, by the question you bring"
      lede="Each page shows its source and the date its figures are as of. The latest 12 months are free to download."
    >
      <KeyRates />
      <HubSections sections={numbersSections} />
      <FollowSheet />
    </PageShell>
  );
}
