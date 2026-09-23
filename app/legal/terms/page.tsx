import type { Metadata } from "next";
import { DraftBanner } from "@/components/ui/DraftBanner";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <PageHeader kicker="Legal" title="Terms of use" lede="A holding text until counsel reviews subscriber terms." />
      <div className="mt-8">
        <DraftBanner>these terms are not an offer and are not in force.</DraftBanner>
      </div>
      <div className="article-body mt-8">
        <p>
          Afronomics Feed publishes general journalism and market intelligence.
          Access to gated copy, if and when billing is live, will be licensed
          for internal desk use unless an enterprise agreement says otherwise.
        </p>
        <p>
          You may not scrape this site for a competing tape, redistribute paid
          copy, or treat teasers as a complete file. Pricing on the public
          pricing page is illustrative until checkout exists.
        </p>
        <p>
          Governing law, limitation of liability, and acceptable-use language
          will be written by counsel. This page is a scaffold.
        </p>
      </div>
    </div>
  );
}
