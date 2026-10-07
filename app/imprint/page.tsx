import type { Metadata } from "next";
import { ProsePage } from "@/components/data/ProsePage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Imprint",
  description: "Publisher notice for Afronomics.",
  alternates: { canonical: `${site.url}/imprint` },
};

export default function ImprintPage() {
  return (
    <ProsePage crumbs={[{ href: "/", label: "Home" }, { label: "Imprint" }]} kicker="Legal" title="Publisher notice">
      <p>
        <strong>{site.legalName}</strong> ({site.name}) is published from Nairobi, Kenya, by{" "}
        <a href={site.houseUrl} target="_blank" rel="noopener noreferrer">
          {site.houseName}
        </a>
        .
      </p>
      <p>
        Editorial and data contact: <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>
      <p>
        Third-party data is reproduced under each publisher’s licence and credited where it appears. World Bank data is used under CC BY 4.0.
        Headlines on the Wire belong to their publishers and link to the original article.
      </p>
    </ProsePage>
  );
}
