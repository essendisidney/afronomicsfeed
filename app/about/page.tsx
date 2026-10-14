import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/data/ProsePage";
import { fitDescription } from "@/lib/seo";
import { billMarkets, loadBillMarket } from "@/lib/data/sovereign-bills";
import { bondCoverageText, bondResultCount } from "@/lib/data/sovereign-bonds";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: fitDescription(
    "Who publishes Afronomics, what its data covers, how it is funded and the standards it keeps: African rates, auctions and economies, sourced and free to read.",
  ),
  alternates: { canonical: `${site.url}/about` },
};

export default function AboutPage() {
  const billResults = billMarkets.reduce((n, m) => n + loadBillMarket(m.slug).rows.length, 0);
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
          <Link href="/data">The data hub</Link> — every series ranked across the continent, with free CSV downloads.
        </li>
        <li>
          <Link href="/brief">Analysis</Link> — field guides to the documents that move African markets.
        </li>
      </ul>

      <h2>What the data covers today</h2>
      <p>
        Treasury bill auctions in {billMarkets.length} markets and government bond auctions in {bondCoverageText()}:{" "}
        {(billResults + bondResultCount()).toLocaleString("en-US")} auction results, each linked to the publisher&rsquo;s own notice. Counted from the data
        files when this page was built. Market by market, with the official source of each, on{" "}
        <Link href="/trust#datasets">trust and data security</Link>.
      </p>

      <h2 id="publisher">Who publishes Afronomics</h2>
      <table>
        <tbody>
          <tr>
            <th scope="row">Publisher</th>
            <td>
              <a href={site.houseUrl} target="_blank" rel="noopener noreferrer">
                {site.houseName}
              </a>
            </td>
          </tr>
          <tr>
            <th scope="row">Published from</th>
            <td>Nairobi, Kenya</td>
          </tr>
          <tr>
            <th scope="row">Website</th>
            <td>{site.url.replace("https://", "")}</td>
          </tr>
          <tr>
            <th scope="row">Contact</th>
            <td>
              <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> · <Link href="/contact">contact page</Link>
            </td>
          </tr>
          <tr>
            <th scope="row">Terms governed by</th>
            <td>The laws of Kenya</td>
          </tr>
          <tr>
            <th scope="row">Personal data</th>
            <td>
              Kenya&rsquo;s Data Protection Act, 2019 (<Link href="/legal/privacy">privacy notice</Link>)
            </td>
          </tr>
          <tr>
            <th scope="row">Elsewhere</th>
            <td>
              <a href={site.linkedinUrl} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>{" "}
              ·{" "}
              <a href={site.telegramUrl} target="_blank" rel="noopener noreferrer">
                Telegram
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      <h2 id="funding">How we are funded</h2>
      <p>
        Reading, citing and the open API are free. Revenue comes from the sources below, and each is disclosed where it appears:
      </p>
      <ul>
        <li>
          Institutional data plans and licences (Analyst, Team and API, Enterprise) and the Investment Committee Pack: see <Link href="/pricing">pricing</Link> and{" "}
          <Link href="/buying">buying for an institution</Link>.
        </li>
        <li>Reader plans (Pro and Team) for the full analysis, the Morning note and alerts.</li>
        <li>
          Sponsorship, always labelled &ldquo;Sponsored&rdquo; or &ldquo;Presented by&rdquo; and never inside the data (<Link href="/advertise">advertise</Link>), and paid
          job listings.
        </li>
        <li>Referral fees that some money-transfer links may earn (and, in future, money market fund links), disclosed beside those links and never affecting the order.</li>
        <li>
          Commissioned research (<Link href="/advisory">research and advisory</Link>).
        </li>
      </ul>
      <p>We do not take payment for coverage, and no customer, sponsor or partner sees or changes data, rankings or articles before they are published.</p>

      <h2 id="trust">How we earn trust</h2>
      <p>
        Every number links to the publisher that printed it and carries its date. Blank means the publisher has no value. We correct mistakes in public and
        list late figures openly. The rules are written down:
      </p>
      <ul>
        <li>
          <Link href="/editorial-standards">Editorial standards</Link>: independence, sourcing, corrections and how we use AI.
        </li>
        <li>
          <Link href="/method">Sources and method</Link> and <Link href="/reference">the reference</Link>: where each number comes from and how it is defined.
        </li>
        <li>
          <Link href="/trust">Trust and data security</Link>: how each dataset is collected and how the site and API are secured.
        </li>
        <li>
          <Link href="/status">Data status</Link>: what is late or missing right now, and the measured delay after each publisher.
        </li>
        <li>
          <Link href="/corrections">Corrections</Link>: the public log.
        </li>
      </ul>
    </ProsePage>
  );
}
