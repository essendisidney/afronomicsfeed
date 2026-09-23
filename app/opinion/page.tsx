import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Provenance } from "@/components/ui/Provenance";
import { getAllArticles, toIndexItem } from "@/lib/content";

export const metadata: Metadata = {
  title: "Opinion",
  description: "Signed Afronomics analysis. Opinion is labelled and never mixed into Facts.",
};

const rubrics = [
  {
    title: "What changed",
    body: "Name the print or filing. If there is none, the piece stays analysis of process — not a pretended observation.",
  },
  {
    title: "Who is exposed",
    body: "Link the graph: country, agency, issuer, corridor. Empty cells stay empty.",
  },
  {
    title: "What to watch",
    body: "Point at a watch template or alert kind. Do not invent a deadline the issuer did not publish.",
  },
];

export default function OpinionPage() {
  const pieces = getAllArticles()
    .filter((article) => article.labels.includes("Opinion") || article.labels.includes("Analysis"))
    .map(toIndexItem);

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Opinion" }]}
      kicker="Opinion"
      title="Signed interpretation, labelled as such"
      lede="Facts, Analysis and Opinion stay visually separate. Sponsored copy, when it exists, will not sit in this river."
    >
      <section>
        <h2 className="font-serif text-2xl">Decision rubrics</h2>
        <p className="mt-2 text-sm text-ink-soft">
          How this desk turns a file into a brief without mixing labels. See also{" "}
          <Link href="/method" className="text-forest underline underline-offset-2">
            method
          </Link>
          .
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {rubrics.map((item) => (
            <li key={item.title} className="border border-rule px-4 py-3">
              <p className="font-serif text-xl">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{item.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm">
          <Link href="/graph/kenya" className="text-forest underline underline-offset-2">
            Kenya graph
          </Link>
          {" · "}
          <Link href="/watchlists" className="text-forest underline underline-offset-2">
            Watchlists
          </Link>
          {" · "}
          <Link href="/alerts" className="text-forest underline underline-offset-2">
            Alerts
          </Link>
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Filed pieces</h2>
        {pieces.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No labelled analysis has been filed yet.</p>
        ) : (
          <div className="mt-6 space-y-10">
            {pieces.map((article) => (
              <ArticleCard key={`${article.category}-${article.slug}`} article={article} />
            ))}
          </div>
        )}
      </section>

      <Provenance source="Editorial labels" methodology="Opinion never rewrites a Facts block. No sponsored inventory in this river." />
    </LayerPage>
  );
}
