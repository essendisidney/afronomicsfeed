import type { Metadata } from "next";
import { AskPanel } from "@/components/ask/AskPanel";
import { LayerPage } from "@/components/intelligence/LayerPage";

export const metadata: Metadata = {
  title: "Ask Afronomics",
  description: "Retrieval-only answers with citations. The index is not connected; no invented numbers.",
};

export default function AskPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Ask" }]}
      kicker="Ask Afronomics"
      title="Answers from the file, or no answer"
      lede="Questions retrieve stored documents and observations. Model text cannot write a verified GDP, FX print, or funding ticket. Citations are mandatory."
    >
      <AskPanel />
    </LayerPage>
  );
}
