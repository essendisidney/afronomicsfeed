import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Method",
  description:
    "How Afronomics Feed labels facts, analysis, and opinion — and what this desk will not write.",
};

export default function MethodPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Method"
        title="How a piece gets onto this desk"
        lede="The product is the file discipline, not the volume. This page is the house standard for the first ninety days."
      />

      <div className="article-body mt-10">
        <h2>How to move through the file</h2>
        <p>
          Start at <Link href="/today">this morning’s file</Link>, then move by{" "}
          <Link href="/institutions">institution</Link> or <Link href="/topics">topic</Link>.
          The archive can filter series, label, and subject. None of those views is a
          live wire.
        </p>

        <h2>What we cover</h2>
        <p>
          Kenya banking, capital markets, and financial regulation: listed banks, NSE and
          fixed income, and public decisions from CBK, CMA, SASRA, and IRA. We do not
          run a youth desk, a funding blog, a pan-African firehose, or a tip community.
        </p>

        <h2>Labels</h2>
        <p>
          Every piece carries one or more of <strong>Facts</strong>, <strong>Analysis</strong>,
          and <strong>Opinion</strong>. Facts are what a primary document says. Analysis is
          how we read its structure. Opinion, if used, is a signed desk judgement — not a
          hidden adjective inside a news sentence.
        </p>

        <h2>Citations and as-of</h2>
        <p>
          A claim that needs a number needs a source with a name, a URL, and a date. Market
          figures need an as-of stamp. If we cannot point to a public document, the figure
          is labelled <strong>EXAMPLE DATA</strong> or it does not ship. We do not scrape or
          republish the NSE tape; the official window is{" "}
          <a href="https://www.nse.co.ke/" target="_blank" rel="noopener noreferrer">
            nse.co.ke
          </a>
          .
        </p>

        <h2>What we will not write</h2>
        <p>
          Buy, sell, hold, or overweight language. Price targets as advice. Guaranteed
          returns. Personalized “for your portfolio” copy. A remembered yield presented as
          this week’s print.
        </p>

        <h2>When we are wrong</h2>
        <p>
          Corrections are public. The log is at{" "}
          <Link href="/corrections">/corrections</Link>. We do not silently overwrite a
          filed brief.
        </p>

        <h2>Method registry</h2>
        <p>
          Data and label standards live in the{" "}
          <Link href="/method/registry">method registry</Link>. Draft and empty rows mean
          the file is not finished — the desk does not invent a completed methodology.
          House terms are indexed in the <Link href="/glossary">glossary</Link>.
        </p>

        <h2>What is gated</h2>
        <p>
          Free readers get the headline, three bullets, the lede, and the citations.
          Daily Brief and Weekly Intelligence <strong>desk memos</strong> — what to
          file, and what is still unknown — sit behind Individual access.
          Explainers stay open so the map of who-sets-what is usable without a seat.
        </p>
      </div>
    </div>
  );
}
