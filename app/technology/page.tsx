import type { Metadata } from "next";
import { DeskView, type DeskConfig } from "@/components/data/DeskView";
import { site } from "@/lib/site";

export const revalidate = 900;

const config: DeskConfig = {
  slug: "technology",
  kicker: "Technology",
  title: "African technology, fintech and connectivity",
  lede: "Startup funding, fintech and telecoms headlines from Africa’s technology press, with the connectivity data that sizes each market.",
  wireDesk: "technology",
  panels: [
    { slug: "internet", title: "Highest internet use" },
    { slug: "mobile", title: "Most mobile subscriptions per 100 people" },
    { slug: "private-credit", title: "Deepest private credit markets" },
  ],
  projectThemes: ["Digital"],
  projectTitle: "Digital infrastructure in the World Bank pipeline",
};

export const metadata: Metadata = {
  title: config.title,
  description: config.lede,
  alternates: { canonical: `${site.url}/technology` },
};

export default function Page() {
  return <DeskView config={config} />;
}
