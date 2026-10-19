import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/data/ProsePage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use",
  alternates: { canonical: `${site.url}/legal/terms` },
  description: "The terms for using Afronomics: reuse of data with attribution, subscriptions and cancellation, no advice, and liability.",
};

export default function TermsPage() {
  return (
    <ProsePage crumbs={[{ href: "/", label: "Home" }, { label: "Terms" }]} kicker="Legal" title="Terms of use">
      <h2>Using the site</h2>
      <p>
        You may read, share and cite Afronomics freely, with the credit “Source: Afronomics” and a link. The free API and CSV downloads are for
        research, journalism, teaching and non-commercial apps; any commercial use, including internal use at a fund, bank or firm, needs a pilot
        key or a paid licence, and passing the data to others needs an Enterprise licence. The full terms are on the{" "}
        <Link href="/licensing">licensing page</Link>. Figures remain subject to the original publisher’s terms.
      </p>
      <h2>What you may not do</h2>
      <p>
        Don’t scrape the site at scale, resell our analysis, or present our compilations as your own without attribution. Don’t share paid
        access outside the seats you have bought.
      </p>
      <h2>Subscriptions</h2>
      <p>
        A payment buys the period shown at checkout. A plan renews only if checkout shows it as a renewing plan; you can stop a renewing plan at
        any time from the Paystack email or by writing to{" "}
        <a href={`mailto:${site.contactEmail}?subject=Cancel`}>{site.contactEmail}</a>, and access runs to the end of the paid period. Enterprise
        plans, and any plan bought under a signed order form, are governed by that agreement.
      </p>
      <h2>No advice</h2>
      <p>
        Content is for information only and is not investment, legal or tax advice. See the <Link href="/legal/disclaimer">disclaimer</Link>.
      </p>
      <h2>Liability</h2>
      <p>
        We work to keep data accurate and current but provide it “as is”. To the extent the law allows, we are not liable for losses from
        relying on it. These terms are governed by the laws of Kenya.
      </p>
    </ProsePage>
  );
}
