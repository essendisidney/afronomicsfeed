import type { Metadata } from "next";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { getAllArticles, toIndexItem } from "@/lib/content";

export const metadata: Metadata = {
  title: "Opinion",
  description: "Signed Afronomics analysis. Opinion is labelled and never mixed into Facts.",
};

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
      {pieces.length === 0 ? (
        <p className="text-sm text-muted">No labelled analysis has been filed yet.</p>
      ) : (
        <div className="space-y-10">
          {pieces.map((article) => (
            <ArticleCard key={`${article.category}-${article.slug}`} article={article} />
          ))}
        </div>
      )}
    </LayerPage>
  );
}
