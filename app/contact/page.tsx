import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/data/ProsePage";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the Afronomics desk for data questions, corrections, subscriptions, licensing and research.",
  alternates: { canonical: `${site.url}/contact` },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ interest?: string }> }) {
  const { interest } = await searchParams;
  const mail = (subject: string) => `mailto:${site.contactEmail}?subject=${encodeURIComponent(subject)}`;
  return (
    <ProsePage crumbs={[{ href: "/", label: "Home" }, { label: "Contact" }]} kicker="Contact" title="Reach the desk" lede="One inbox, read every working day in Nairobi.">
      <div id="enquiry" className="not-prose mb-10 border border-rule bg-paper-2 p-5">
        <p className="mb-4 font-serif text-xl text-ink">Access, sponsorship, data or research</p>
        <EnquiryForm interest={interest ?? "access"} />
      </div>
      <p>
        Or write to <a href={mail("Afronomics")}>{site.contactEmail}</a> and put one of these in the subject so it reaches the right queue:
      </p>
      <ul>
        <li>
          <a href={mail("Correction")}>Correction</a> — a figure, a date or a headline that is wrong. See the <Link href="/corrections">corrections policy</Link>.
        </li>
        <li>
          <a href={mail("Data request")}>Data request</a> — a series or a country you want tracked.
        </li>
        <li>
          <a href={mail("Subscription")}>Subscription</a> — Pro and Team access, invoices and receipts.
        </li>
        <li>
          <a href={mail("Licensing")}>Licensing</a> — feeds, embeds and white-label country files.
        </li>
        <li>
          <a href={mail("Research")}>Research</a> — commissioned work. See <Link href="/advisory">research and advisory</Link>.
        </li>
        <li>
          <a href={mail("Press")}>Press</a> — interviews and permission to republish charts.
        </li>
      </ul>
      <p>
        Publishers who want their feed on <Link href="/news">the Wire</Link>, or removed from it, can write with the subject “Wire”.
      </p>
      <p>
        On LinkedIn: <a href={site.linkedinUrl}>Afronomics Feed</a>.
      </p>
    </ProsePage>
  );
}
