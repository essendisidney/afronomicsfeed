import type { Metadata } from "next";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { PageShare } from "@/components/share/PageShare";
import { PageHeader } from "@/components/ui/PageHeader";
import { getArticlesByCategory, toIndexItem } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Explainers",
  alternates: { canonical: `${site.url}/explainers` },
  description: "Open intelligence on who sets what in Kenya’s banking and capital-markets system.",
};

export default function ExplainersIndexPage() {
  const articles = getArticlesByCategory("explainer").map(toIndexItem);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Explainers"
        title="The map, without the noise"
        lede="Open-access primers on mandates and perimeters. Use them to cite the right primary — not to time a market."
      />
      <PageShare title="Afronomics explainers: the map, without the noise" campaign="page" className="mt-6" />
      <div className="mt-12 space-y-12">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
