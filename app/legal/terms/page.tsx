import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/data/ProsePage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <ProsePage crumbs={[{ href: "/", label: "Home" }, { label: "Terms" }]} kicker="Legal" title="Terms of use">
      <h2>Using the site</h2>
      <p>
        You may read, share and cite Afronomics freely. You may download our CSV files and reuse the data with attribution — “Source: Afronomics,
        compiled from [publisher]” — subject to the original publisher’s licence.
      </p>
      <h2>What you may not do</h2>
      <p>
        Don’t scrape the site at scale, resell our analysis, or present our compilations as your own without attribution. Don’t share paid
        access outside the seats you have bought.
      </p>
      <h2>Subscriptions</h2>
      <p>
        Paid plans renew monthly until cancelled. Cancel any time by writing to{" "}
        <a href={`mailto:${site.contactEmail}?subject=Cancel`}>{site.contactEmail}</a>; access runs to the end of the paid period. Team and
        Enterprise plans are governed by their own agreement.
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
