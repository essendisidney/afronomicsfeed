import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/data/ProsePage";
import { site } from "@/lib/site";
import { fitDescription, fitTitle } from "@/lib/seo";

const title = "Editorial standards: independence, sourcing, corrections and AI use";

export const metadata: Metadata = {
  title: fitTitle(title),
  description: fitDescription(
    "How Afronomics decides what to publish: figures only from the publisher that printed them, no paid placement in data or rankings, labelled sponsorship, public corrections and how AI is and is not used.",
  ),
  alternates: { canonical: `${site.url}/editorial-standards` },
};

export default function EditorialStandardsPage() {
  const mail = (subject: string) => `mailto:${site.contactEmail}?subject=${encodeURIComponent(subject)}`;
  return (
    <ProsePage
      crumbs={[{ href: "/", label: "Home" }, { href: "/about", label: "About" }, { label: "Editorial standards" }]}
      kicker="Editorial standards"
      title="How we decide what to publish"
      lede="The rules every figure, table, ranking and article on Afronomics follows, and how to hold us to them."
    >
      <h2 id="sourcing">Sourcing: a figure needs a publisher</h2>
      <ul>
        <li>
          A number appears only when a named publisher has printed it: a central bank, treasury, debt office, statistics office, regulator, exchange or
          international institution. If the publisher has no value, the cell is blank and says so.
        </li>
        <li>We never estimate, interpolate or let a language model write a figure. Derived measures (an index, a real rate, a change) are computed from published figures by a stated method.</li>
        <li>Every auction result links to the publisher&rsquo;s own notice or document, and every data page shows the date of the figures and where they came from.</li>
        <li>
          Where publishers measure the same thing differently (a weighted average rate in one market, a stop rate in another), we show each as published and
          say which it is, rather than adjusting them to look alike.
        </li>
      </ul>
      <p>
        The full sources and refresh schedule are on <Link href="/method">sources and method</Link>, definitions on <Link href="/reference">the reference</Link>, and
        how each dataset is collected on <Link href="/trust">trust and data security</Link>.
      </p>

      <h2 id="independence">Independence: nothing in the data is for sale</h2>
      <ul>
        <li>
          No one can pay to appear in, be removed from, or move up or down any table, ranking or comparison. Rankings (for example the cheapest way to send
          money or the money market funds ranked by yield this month) are ordered by the published figures alone.
        </li>
        <li>We do not take payment for coverage. Customers, sponsors and partners do not see, edit, approve or order data, rankings or articles before publication.</li>
        <li>
          Sponsorship is labelled &ldquo;Sponsored&rdquo; or &ldquo;Presented by&rdquo; and sits beside the data, never inside it. The terms are on{" "}
          <Link href="/advertise">advertise</Link>.
        </li>
        <li>
          Some money-transfer links may earn Afronomics a referral fee. Those links are marked as sponsored in the page code, the page says so next to them,
          and the fee never changes the order. An article that names a provider we may earn from says so.
        </li>
        <li>
          &ldquo;Open an account&rdquo; links in the money market fund table go to the manager&rsquo;s own site and are counted. A manager may in future pay
          Afronomics for an account opened through such a link; if one does, the table will say so beside the link, the order will still be by yield after
          tax alone, and funds that pay nothing will be listed the same way.
        </li>
        <li>We do not give buy, sell or hold recommendations or promise returns. Everything here is information, not advice.</li>
        <li>
          Afronomics is not licensed by the Capital Markets Authority as an investment adviser. We do not answer &ldquo;what should I buy&rdquo; for any
          reader or client; we point to the licensed advisers on the CMA and CBK registers.
        </li>
      </ul>

      <h2 id="treasury-desk">The Investment Committee Pack and the treasury benchmark</h2>
      <ul>
        <li>
          The pack and the benchmark describe the market. Government securities are listed by term, and every fund, bank and SACCO is listed in
          alphabetical order, never ranked, rated or recommended.
        </li>
        <li>A benchmark compares a client&rsquo;s own holdings with the published auction results, in shillings, before tax on both sides. It never says what to hold.</li>
        <li>A client&rsquo;s name and figures are private to that client. We do not say who our clients are without their written agreement.</li>
        <li>Every figure carries its source and date; a wrong one is corrected for every client who received it, and listed on the corrections page.</li>
      </ul>

      <h2 id="declarations">Declarations and advertising</h2>
      <ul>
        <li>
          Anyone who writes or compiles for Afronomics declares to the editor any holding in a security, fund or institution they cover, and does not cover it
          where the holding is material. Declarations are kept on file.
        </li>
        <li>
          We do not carry advertising or sponsorship from anyone who needs a licence from the CMA, CBK, SASRA or RBA and does not hold one, and we refuse
          copy that promises a return or says one cannot be lost. Paid listings and sponsorship are labelled where they appear.
        </li>
      </ul>

      <h2 id="labels">Labels, dates and bylines</h2>
      <ul>
        <li>Articles are labelled Facts, Analysis or Opinion, cite their primary documents with dates, and carry an as-of date.</li>
        <li>
          Articles are published under the &ldquo;Afronomics Desk&rdquo; byline. The publisher, named in the <Link href="/imprint">publisher notice</Link>, is
          responsible for everything published under it.
        </li>
      </ul>

      <h2 id="ai">How we use AI, and where we do not</h2>
      <p>Afronomics is a small operation and uses AI models openly. This is where:</p>
      <ul>
        <li>
          <strong>Not for figures.</strong> Data is read from publishers&rsquo; documents by deterministic programs, one per publisher, with automated tests. No
          figure in any table, chart, file or API response is produced by a language model.
        </li>
        <li>
          <strong>Drafting articles.</strong> Short stories about a change in our own data are drafted with an AI model from a computed lead. Before publication an
          automated checker compares every figure in the draft with the lead; a draft that fails any check is not published. The story is labelled, dated and
          sourced like any other.
        </li>
        <li>
          <strong>Correspondence and social posts.</strong> An AI assistant helps sort the inbox and draft replies and posts. Replies to customers are drafted, not
          sent, by the assistant.
        </li>
      </ul>

      <h2 id="corrections">Corrections</h2>
      <ul>
        <li>
          If a figure, date, label or claim is wrong, write to <a href={mail("Correction")}>{site.contactEmail}</a> with the subject &ldquo;Correction&rdquo;, the page
          and what is wrong.
        </li>
        <li>
          We fix it on the page and record what was wrong and what changed: data corrections in the <Link href="/reference#corrections">data corrections log</Link>,
          article corrections on the <Link href="/corrections">corrections page</Link>. We do not change a published figure silently.
        </li>
        <li>
          When a publisher restates a result, we carry the restated figure and log the change. Late or unreadable figures are listed on the{" "}
          <Link href="/status">data status page</Link> rather than left to look current.
        </li>
      </ul>

      <h2 id="headlines">Other publishers&rsquo; headlines</h2>
      <p>
        The Wire shows a publisher&rsquo;s headline, a short excerpt from its public feed and a link to the original. Country and topic tags are assigned
        automatically and can be wrong; we correct them on request. Publishers can ask to join or leave the Wire at{" "}
        <a href={mail("Wire")}>{site.contactEmail}</a>.
      </p>

      <h2 id="contact">Holding us to this</h2>
      <p>
        Complaints about accuracy, fairness or a conflict of interest go to <a href={mail("Editorial complaint")}>{site.contactEmail}</a>. See also{" "}
        <Link href="/about">about Afronomics</Link> and the <Link href="/legal/disclaimer">disclaimer</Link>.
      </p>
    </ProsePage>
  );
}
