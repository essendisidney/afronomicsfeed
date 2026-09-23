import type { Metadata } from "next";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getArticlesByCategory, toIndexItem } from "@/lib/content";

export const metadata: Metadata = {
  title: "Weekly Intelligence",
  description: "A weekly Kenya banking and capital-markets file — disclosures, not a scoreboard.",
};

export default function WeeklyIndexPage() {
  const articles = getArticlesByCategory("weekly").map(toIndexItem);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Weekly Intelligence"
        title="The week as a filing, not a race"
        lede="Listed-bank packs, auction weeks, and regulator calendars — read as documents. Full notes are gated."
      />
      <div className="mt-12 space-y-12">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
