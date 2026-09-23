import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Afronomics is the economic intelligence graph for Africa — news connected to data, signals and decisions.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <PageHeader kicker="About" title="Africa’s economic intelligence layer" lede={site.promise} />

      <div className="article-body mt-10">
        <h2>Mission</h2>
        <p>
          Africa generates enormous economic activity, policy change, climate risk and
          investment data. The information is fragmented, delayed, hard to compare across
          countries, and rarely converted into decisions. Afronomics turns that
          fragmentation into structured intelligence.
        </p>

        <h2>The thesis</h2>
        <p>
          NEWS → DATA → CONTEXT → SIGNALS → DECISIONS. Most publications stop at news.
          Every important story should connect to the graph: country, currency, regulator,
          sector, capital, climate and the companies exposed.
        </p>

        <h2>The first populated file</h2>
        <p>
          Kenya banking, capital markets and financial regulation remains the first deep
          desk — CBK, CMA, NSE, SASRA, IRA — because trust systems have to be proven
          somewhere. The brand is continental. The wedge is still Nairobi.
        </p>

        <h2>What we are not</h2>
        <p>
          We are not “Bloomberg for Africa.” We are not a generic news site. We are not
          personalized financial advice. Nothing here is a recommendation to buy, sell, or
          hold. Demonstration figures are labelled. Model output never becomes a verified
          fact.
        </p>

        <h2>Trust</h2>
        <p>
          Facts / Analysis / Opinion labels, citations, as-of stamps, and a public{" "}
          <Link href="/corrections">corrections log</Link>. The house standard is on{" "}
          <Link href="/method">method</Link>. The Kenya file is in the{" "}
          <Link href="/archive">archive</Link>.
        </p>

        <h2>House</h2>
        <p>
          Afronomics Feed is{" "}
          <a href={site.houseUrl} target="_blank" rel="noopener noreferrer">
            a product of Pesara
          </a>
          .
        </p>
      </div>
    </div>
  );
}
