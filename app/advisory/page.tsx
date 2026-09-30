import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/data/ProsePage";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Research and advisory",
  description: "Commissioned research, country and sector briefings, licensed data feeds and embedded widgets from Afronomics.",
  alternates: { canonical: `${site.url}/advisory` },
};

export default function AdvisoryPage() {
  const mail = (subject: string) => `mailto:${site.contactEmail}?subject=${encodeURIComponent(subject)}`;
  return (
    <ProsePage
      crumbs={[{ href: "/", label: "Home" }, { label: "Research & advisory" }]}
      kicker="For institutions"
      title="Research, data and briefings on commission"
      lede="The same sourced data and desk that power the site, pointed at your question."
    >
      <h2>What we do</h2>
      <ul>
        <li>
          <strong>Country and sector briefings</strong> — a sourced file on a market before you enter it, lend into it or report on it.
        </li>
        <li>
          <strong>Regulatory and banking forensics</strong> — what a circular, licence regime or capital rule changes for a named institution.
        </li>
        <li>
          <strong>Data licensing</strong> — Afronomics series, the capital tracker and the Wire as a feed for your systems, with attribution.
        </li>
        <li>
          <strong>Embeds and white-label files</strong> — country and indicator widgets for your own site, portal or annual report.
        </li>
        <li>
          <strong>Datasets on request</strong> — a series we don’t yet track, built once and maintained.
        </li>
      </ul>
      <h2>Who we work with</h2>
      <p>Investors, banks and insurers, development-finance institutions, climate funds, corporates entering African markets, and the advisers who serve them.</p>
      <h2>Start a conversation</h2>
      <p>
        Email <a href={mail("Research request")}>{site.contactEmail}</a> with the market, the question and your timeline. You’ll get a scope and a
        fixed quote. For data and seats, see <Link href="/pricing">pricing</Link>; for feeds, see <Link href="/licensing">data licensing</Link>.
      </p>
      <div className="not-prose mt-6 border border-rule bg-paper-2 p-5">
        <EnquiryForm interest="research" cta="Request a scope" />
      </div>
    </ProsePage>
  );
}
