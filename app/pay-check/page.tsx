import type { Metadata } from "next";
import { FairCheckPage } from "@/components/data/FairCheckPage";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Is my salary fair? Pay by job and town in Africa",
  description: "Check your monthly salary anonymously against what people in the same job in your town report. Medians of at least five reports, never one person's figure.",
  alternates: { canonical: `${site.url}/pay-check` },
};

export default function PayCheckPage() {
  return <FairCheckPage kind="pay" />;
}
