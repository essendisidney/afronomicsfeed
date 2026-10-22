import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/data/ProsePage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "How we compare a SACCO with its peers",
  description: "How the Watch pack sets a SACCO beside its SASRA tier: tier medians, the middle half and the change on the year. No score, grade or rank is published.",
  alternates: { canonical: `${site.url}/method/peer-comparison` },
};

/**
 * The public method for peer comparison (docs/rebuild/upgrade-U5-plan.md; D-028 rule 5): written before any score of a
 * named institution exists. It describes what the private Watch pack works out, and states that no score, grade or
 * rank of a named SACCO is published.
 */
export default function PeerComparisonMethodPage() {
  return (
    <ProsePage
      crumbs={[{ href: "/", label: "Home" }, { href: "/method", label: "Sources & method" }, { label: "Peer comparison" }]}
      kicker="Sources & method"
      title="How we compare a SACCO with its peers"
      lede="The Watch pack sets one SACCO's figures beside those of the other SACCOs in its SASRA tier. This page says how, and what we do not do."
    >
      <h2>What is compared</h2>
      <p>
        Only figures SASRA publishes for each SACCO in its Sacco Supervision Annual Report: total assets, deposits, gross loans and total income,
        and the soundness ratios SASRA prints (core capital to assets, core capital to deposits, institutional capital to assets, external
        borrowing to assets and the non-performing loans ratio). Ratios are SASRA&rsquo;s own, not recomputed. We hold no SACCO&rsquo;s loan or
        deposit rates, so none are compared.
      </p>

      <h2>The peer group</h2>
      <p>
        A SACCO&rsquo;s peers are the SACCOs of the same kind (deposit-taking, or non-withdrawable-deposit) in the same SASRA size tier (large,
        medium or small), as SASRA lists them for the same year. A SACCO with no tier in SASRA&rsquo;s report has no peer group, and the pack says
        so. The number of peers with a figure is printed next to every median.
      </p>

      <h2>What is worked out</h2>
      <ul>
        <li>
          <strong>Tier median:</strong> the middle value of the figure across the peer group. With an even number of peers, the average of the two
          middle values.
        </li>
        <li>
          <strong>Middle half of the tier:</strong> the 25th and 75th percentiles, with linear interpolation between the two nearest values (the
          spreadsheet PERCENTILE rule). It shows how spread out the tier is. It is printed as a range, never as the SACCO&rsquo;s position in it.
        </li>
        <li>
          <strong>Change on the year:</strong> from the SACCO&rsquo;s two published figures, in per cent for amounts and in percentage points for
          ratios. For the tier, the median of each peer&rsquo;s own change.
        </li>
        <li>
          <strong>SASRA&rsquo;s prescribed levels</strong> are printed beside each ratio as SASRA&rsquo;s report states them, with no word such as
          &ldquo;meets&rdquo; or &ldquo;below&rdquo;.
        </li>
      </ul>
      <p>
        A figure SASRA did not publish is left blank and left out of the median. Where SASRA&rsquo;s report repeats total assets in the deposits
        column for a SACCO, that deposit figure is left out. Nothing is estimated.
      </p>

      <h2>Who sees it</h2>
      <p>
        The comparison is in the Watch pack, which goes privately to the SACCO&rsquo;s own board and management through a signed link. A SACCO set
        against SASRA&rsquo;s minimums is never shown in public. The public <Link href="/registry">registry</Link>, <Link href="/compare">Compare</Link>{" "}
        and the member widgets show the regulator&rsquo;s figures for each SACCO, with no grade. The{" "}
        <Link href="/for-institutions/saccos">public sample pack</Link> uses a demo SACCO whose every figure is the large-tier median, so it describes no
        institution.
      </p>

      <h2>No scores, grades or ranks</h2>
      <p>
        We publish no score, grade, rating or ranking of any named SACCO. If that ever changes, the scoring method will be published on this page
        first, and each release will be checked by our confirming agent and approved by the founder before it runs, under our{" "}
        <Link href="/editorial-standards">editorial standards</Link> for anything that names an institution.
      </p>

      <h2>Corrections</h2>
      <p>
        If a figure differs from SASRA&rsquo;s report, tell us at <a href={`mailto:${site.contactEmail}?subject=Peer%20comparison`}>{site.contactEmail}</a>.
        We fix it and log it on the <Link href="/corrections">corrections page</Link>. Information, not advice.
      </p>
    </ProsePage>
  );
}
