import type { Metadata } from "next";
import { FairCheckPage } from "@/components/data/FairCheckPage";
import { site } from "@/lib/site";
import { fitDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Is my rent fair? Rents by home and town in Africa",
  description: fitDescription("Check your monthly rent anonymously against what people renting the same kind of home in your town report. Medians of at least five reports, never one person's figure."),
  alternates: { canonical: `${site.url}/rent-check` },
};

export default function RentCheckPage() {
  return <FairCheckPage kind="rent" />;
}
