import type { Metadata } from "next";
import { DraftBanner } from "@/components/ui/DraftBanner";
import { PageHeader } from "@/components/ui/PageHeader";
import { disclaimer } from "@/lib/site";

export const metadata: Metadata = {
  title: "Disclaimer",
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Legal"
        title="Disclaimer"
        lede="General intelligence. Not personalized financial advice. Never a buy, sell, or hold instruction."
      />
      <div className="mt-8">
        <DraftBanner>counsel has not signed off this disclaimer.</DraftBanner>
      </div>
      <div className="article-body mt-8">
        <p>{disclaimer}</p>
        <p>
          Figures on the homepage market strip and in tracker tables are static
          placeholders. Unless a piece cites a dated public document, treat
          numbers as EXAMPLE DATA. Afronomics Feed does not redistribute live
          NSE quotes.
        </p>
        <p>
          Labels (Facts, Analysis, Opinion) describe the editorial register of
          a piece. They are not a warranty of completeness. Readers remain
          responsible for checking the linked primary source.
        </p>
        <p>
          Nothing here is an invitation to deal in securities, deposits, or
          insurance products, and nothing is tailored to a reader’s
          circumstances, objectives, or portfolio.
        </p>
      </div>
    </div>
  );
}
