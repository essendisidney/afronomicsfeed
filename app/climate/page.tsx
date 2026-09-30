import type { Metadata } from "next";
import { DeskView, type DeskConfig } from "@/components/data/DeskView";
import { site } from "@/lib/site";

export const revalidate = 900;

const config: DeskConfig = {
  slug: "climate",
  kicker: "Climate",
  title: "Climate finance and the energy transition in Africa",
  lede: "Power access, renewable share and the climate-tagged development finance heading to African Boards, with the day’s energy and climate headlines.",
  wireDesk: "climate",
  panels: [
    { slug: "electricity", title: "Lowest access to electricity", order: "asc" },
    { slug: "renewables", title: "Highest renewable share of energy" },
    { slug: "agriculture", title: "Most agriculture-dependent economies" },
  ],
  projectFilter: (project) => project.climate || project.theme === "Climate & energy",
  projectTitle: "Climate and energy projects in the World Bank book",
};

export const metadata: Metadata = {
  title: config.title,
  description: config.lede,
  alternates: { canonical: `${site.url}/climate` },
};

export default function Page() {
  return <DeskView config={config} />;
}
