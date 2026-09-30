import type { Metadata } from "next";
import { DeskView, type DeskConfig } from "@/components/data/DeskView";
import { site } from "@/lib/site";

export const revalidate = 900;

const config: DeskConfig = {
  slug: "trade",
  kicker: "Trade",
  title: "African trade, corridors and external balances",
  lede: "Export dependence, current-account positions and debt service, alongside ports, logistics and AfCFTA headlines.",
  wireDesk: "trade",
  panels: [
    { slug: "exports", title: "Most export-oriented economies" },
    { slug: "current-account", title: "Largest current-account deficits", order: "asc" },
    { slug: "debt-service", title: "Heaviest debt service on exports" },
  ],
  projectThemes: ["Transport & urban"],
  projectTitle: "Transport, ports and corridors in the World Bank pipeline",
};

export const metadata: Metadata = {
  title: config.title,
  description: config.lede,
  alternates: { canonical: `${site.url}/trade` },
};

export default function Page() {
  return <DeskView config={config} />;
}
