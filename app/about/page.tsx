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
    <ProsePage crumbs={[{ href: "/", label: "Home" }, { label: "About" }]} kicker="About" title="The price of money in Africa, for everyone" lede={site.promise}>
      <h2>Why Afronomics exists</h2>
      <p>
        A farmer in Kisumu, a SACCO treasurer in Nyeri, a trader in Lagos, a pension fund in Johannesburg and a bond desk in London have one
        thing in common: every one of them lives under the price of money, and almost none of them can see it. What a government pays to borrow
        sets what the SACCO charges for a loan, what the bank pays on a deposit, what a money-market fund yields, how fast the currency buys
        fertiliser, and how much of this year’s taxes go on interest. That price is public — printed every week by every central bank — and yet
        invisible to nearly everyone who lives under it.
      </p>
      <p>
        Afronomics makes it visible. We read each central bank’s published auction results the day they appear, keep the full history, publish
        every figure with its source at an address that will not change, explain what it means for a saver or a borrower in plain English and
        Kiswahili, and send it to anyone who asks — free. Institutions pay for depth, speed, the index and the workflow built on the same numbers;
        that is what keeps the public layer free. The terminal in New York costs more a month than most African analysts earn; this costs nothing
        to read.
      </p>
      <p>
        Three things a public reference changes. <strong>Fairness:</strong> a person who knows the government pays 9% on a one-year bill can judge
        the 6% their bank offers or the 18% their lender charges. <strong>Accountability:</strong> every shilling a government borrows is the
        citizen’s, and a permanent public record of what it paid belongs to the citizen too. <strong>Inclusion:</strong> the people who most need
        the number will never open a terminal, so it has to travel — by WhatsApp, by text, in their language, to a notice board.
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
