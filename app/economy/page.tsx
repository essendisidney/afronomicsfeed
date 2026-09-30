import type { Metadata } from "next";
import { DeskView, type DeskConfig } from "@/components/data/DeskView";
import { site } from "@/lib/site";

export const revalidate = 900;

const config: DeskConfig = {
  slug: "economy",
  kicker: "Economy",
  title: "African economies: growth, prices and jobs",
  lede: "Growth, inflation, incomes and debt for 54 economies, next to the headlines moving them. Every figure is the latest print from the publisher.",
  wireDesk: "economy",
  panels: [
    { slug: "gdp-growth", title: "Fastest real growth" },
    { slug: "inflation", title: "Highest inflation" },
    { slug: "gdp-per-capita", title: "Highest income per person" },
    { slug: "external-debt", title: "Heaviest external debt" },
    { slug: "reserves", title: "Thinnest import cover", order: "asc" },
  ],
  projectThemes: ["Finance & fiscal"],
  projectTitle: "Budget support and fiscal operations in the World Bank pipeline",
};

export const metadata: Metadata = {
  title: config.title,
  description: config.lede,
  alternates: { canonical: `${site.url}/economy` },
};

export default function Page() {
  return <DeskView config={config} />;
}
