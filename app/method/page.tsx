import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/data/ProsePage";
import { FoundCounter } from "@/components/home/FoundCounter";
import { deskLabels, indicatorDefs } from "@/lib/data/indicators";
import { projectsSource } from "@/lib/data/projects";
import { feeds } from "@/lib/data/wire";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sources and method",
  description: "Where every Afronomics number comes from, how often it refreshes, how we rank and compare countries, and how we correct mistakes.",
  alternates: { canonical: `${site.url}/method` },
};

export default function MethodPage() {
  return (
    <ProsePage
      crumbs={[{ href: "/", label: "Home" }, { label: "Sources & method" }]}
      kicker="Sources & method"
      title="Where every number comes from"
      lede="Afronomics does not type numbers in by hand. Every figure is read from a named publisher, stamped with its year or time, and linked back to its source."
    >
      <p>
        For the Treasury bill datasets and the Sovereign Bill Index, the full citation record — definitions market by market, stable URLs, the
        timeliness log and the corrections log — is on{" "}
        <Link href="/reference">the reference page</Link>.
      </p>

      <h2>The rule</h2>
      <p>
        A number appears on Afronomics only when a publisher has printed it. If the publisher has no value for a country, the cell is blank and
        says so. We never estimate, interpolate or let a language model write a figure.
      </p>

      <h2>Sources</h2>
      <table>
        <thead>
          <tr>
            <th>Layer</th>
            <th>Publisher</th>
            <th>Refresh</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Macro, debt, trade, technology and climate series</td>
            <td>
              <a href="https://data.worldbank.org/">World Bank Open Data</a> (World Development Indicators, International Debt Statistics)
            </td>
            <td>Daily check; the publisher updates quarterly</td>
          </tr>
          <tr>
            <td>Development-finance projects</td>
            <td>
              <a href={projectsSource.url}>{projectsSource.name}</a>
            </td>
            <td>Every 6 hours</td>
          </tr>
          <tr>
            <td>Currency reference</td>
            <td>
              <a href="https://www.exchangerate-api.com/">ExchangeRate-API</a> mid-market rates
            </td>
            <td>Hourly</td>
          </tr>
          <tr>
            <td>Headlines (the Wire)</td>
            <td>{feeds.length} African publishers’ public RSS feeds</td>
            <td>Every 15 minutes</td>
          </tr>
        </tbody>
      </table>

      <h2>The {indicatorDefs.length} tracked series</h2>
      <ul>
        {indicatorDefs.map((def) => (
          <li key={def.slug}>
            <Link href={`/data/${def.slug}`}>{def.label}</Link> — {deskLabels[def.desk]} · <code>{def.code}</code>
          </li>
        ))}
      </ul>

      <h2>Rankings and comparisons</h2>
      <p>
        Rankings use each country’s latest print from the last three years, so a country is not dropped because its statistics office is a year
        behind. The year of every value is shown; an older print carries a small ’YY mark. Continental totals are summed only for the year in
        which at least 90% of the best-covered year’s countries reported, and the number of reporting countries is printed next to the total.
        “Movers” compare a country’s latest annual value with the year immediately before it.
      </p>

      <h2>Currencies</h2>
      <p>
        The live reference is a mid-market rate for comparison, not a dealing rate or a central-bank fixing. The annual figure is the official
        period average reported to the World Bank. Where a parallel market exists, it can differ materially from both.
      </p>

      <h2>Development finance</h2>
      <p>
        Commitments are IBRD and IDA amounts as the World Bank publishes them; co-financing is not included. Pipeline projects carry the Bank’s
        expected Board date, which moves. Themes are assigned from each project’s title and abstract and are a guide, not the Bank’s own
        sector coding.
      </p>

      <h2>Headlines</h2>
      <p>
        The Wire shows a publisher’s headline, a short excerpt from its feed, and a link to the original article. We tag countries and desks
        automatically from the text; tags can be wrong and are corrected on request. Publishers can ask to join or leave the Wire at{" "}
        <a href={`mailto:${site.contactEmail}?subject=Wire`}>{site.contactEmail}</a>.
      </p>

      <h2 id="poverty-premium">Kenya Poverty Premium</h2>
      <p>
        A monthly file of what the same everyday need costs a Kenyan on the options open to small amounts, against the option a better-off
        saver or borrower can reach: a short overdraft, a mobile loan, a year&rsquo;s saving and money sent home. Every figure is worked out by
        code from data files we hold, each with its publisher and date; lines with no data are shown as gaps, never filled, and the lines are
        never added into one total. The full method, the gaps and every month&rsquo;s file are on{" "}
        <Link href="/data/poverty-premium#method" className="font-semibold text-forest underline underline-offset-2">
          the Poverty Premium page
        </Link>
        .
      </p>

      <h2>Analysis</h2>
      <p>
        Briefs are labelled Facts, Analysis or Opinion, cite their primary documents with dates, and carry an as-of stamp. We do not give
        buy, sell or hold recommendations.
      </p>

      <h2 id="shillings-found">Shillings found</h2>
      <FoundCounter variant="panel" />
      <p>
        Five tools end with one line worked out by code: what the reader&rsquo;s option costs or earns, the cheapest or best-earning option we hold
        for the same use, and the difference over a year, with the source and date of both sides. Is my rate fair? (saving, in Kenya, Ghana and
        Nigeria) compares with the best money market fund or Treasury bill; mobile loans and Fuliza with the cheapest mobile loan whose charge is
        published as a fixed figure, for the same amount and days; money market funds with the best fund after 15% withholding tax; sending money
        home with the cheapest service the World Bank surveyed on the same corridor. Only options a reader can take are compared: a gap to an
        average, such as the Central Bank&rsquo;s bank lending average, is shown on the page but never counted. If we hold no comparable option,
        the tool says nothing new. If the reader&rsquo;s option is already the best we hold, it says so and nothing is counted.
      </p>
      <p>
        When a line shows a positive difference, it is added to a public total: &ldquo;shillings found&rdquo; on Kenya pages, &ldquo;money
        found&rdquo; in other currencies, and currencies are never added together. Our server works the difference out again from the
        reader&rsquo;s figures and our own data before counting it, then drops the figures; only the tool, the market, the currency and the
        amount are kept, as a daily total. The count started on the day the feature was released, with nothing added for earlier days.
      </p>
      <p>Its limits, plainly:</p>
      <ul>
        <li>A difference shown is not money moved. We do not know what any reader did next.</li>
        <li>One reader can be counted more than once (once per tool each time they open a page).</li>
        <li>Amounts are what readers typed. One result counts at most KES 500,000 a year on savings and loans (the same converted into cedis or
          naira at the day&rsquo;s reference rate, or not counted when we show none) and USD 2,000 a year on sending money home; a larger
          difference is not counted at all.</li>
        <li>The comparable is the published price on its date: a fund&rsquo;s yield can change, and a provider&rsquo;s &ldquo;from&rdquo; rate
          is never used as the cheapest option.</li>
        <li>Our own visits are not counted. Information, not advice.</li>
      </ul>

      <h2>Corrections</h2>
      <p>
        If a figure, date or tag is wrong, tell us and we fix it and log it publicly on the <Link href="/corrections">corrections page</Link>.
      </p>

      <h2>Reusing our data</h2>
      <p>
        Every series can be downloaded as CSV from its data page. Cite it as “Source: Afronomics, compiled from [publisher]”. The underlying
        World Bank data is licensed CC BY 4.0.
      </p>
    </ProsePage>
  );
}
