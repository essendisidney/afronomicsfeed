import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/data/ProsePage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Afronomics is a single source for African markets, economies and capital flows — live, sourced and free to read.",
  alternates: { canonical: `${site.url}/about` },
};

export default function AboutPage() {
  return (
    <ProsePage crumbs={[{ href: "/", label: "Home" }, { label: "About" }]} kicker="About" title="One desk for a continent" lede={site.promise}>
      <h2>Why Afronomics exists</h2>
      <p>
        Africa’s economic information is scattered across 54 statistics offices, dozens of central banks and exchanges, multilateral databases
        and hundreds of newsrooms. Anyone who needs a clear view — an investor, a bank treasury, a development-finance officer, a founder — has
        to stitch it together by hand. Afronomics does that stitching once, in the open, for everyone.
      </p>

      <h2>What you get</h2>
      <ul>
        <li>
          <Link href="/news">The Wire</Link> — headlines from African business, markets, technology and energy publishers, refreshed every 15 minutes.
        </li>
        <li>
          <Link href="/countries">54 country files</Link> — growth, prices, debt, capital flows, connectivity and energy, each with history.
        </li>
        <li>
          <Link href="/capital">The capital tracker</Link> — development finance heading to African Boards, by country and theme.
        </li>
        <li>
          <Link href="/data">The data hub</Link> — every series ranked across the continent, with free CSV downloads.
        </li>
        <li>
          <Link href="/brief">Analysis</Link> — field guides to the documents that move African markets.
        </li>
      </ul>

      <h2>How we earn trust</h2>
      <p>
        Every number links to the publisher that printed it and carries its year. Blank means the publisher has no value. We correct mistakes in
        public. The full standard is on <Link href="/method">sources and method</Link>.
      </p>

      <h2>How we are funded</h2>
      <p>
        Reading and citing Afronomics is free. Institutions pay for depth — full analysis, alerts, bulk data, licensed feeds and commissioned
        research. See <Link href="/pricing">pricing</Link> and <Link href="/advisory">research and advisory</Link>. We do not take payment for
        coverage.
      </p>

      <h2>Who we are</h2>
      <p>
        Afronomics is published from Nairobi by{" "}
        <a href={site.houseUrl} target="_blank" rel="noopener noreferrer">
          Pesara
        </a>
        . Write to <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> or follow us on{" "}
        <a href={site.linkedinUrl} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        .
      </p>
    </ProsePage>
  );
}
