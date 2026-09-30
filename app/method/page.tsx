import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/data/ProsePage";
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

      <h2>Analysis</h2>
      <p>
        Briefs are labelled Facts, Analysis or Opinion, cite their primary documents with dates, and carry an as-of stamp. We do not give
        buy, sell or hold recommendations.
      </p>

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
