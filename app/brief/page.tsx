import type { Metadata } from "next";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { getAllArticles, toIndexItem } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Analysis",
  description: "Afronomics briefs, weekly analysis and field guides to African central banks, markets and regulators.",
  alternates: { canonical: `${site.url}/brief` },
};

export default function AnalysisIndexPage() {
  const articles = getAllArticles().map(toIndexItem);
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Analysis" }]}
      kicker="Analysis"
      title="Briefs and field guides"
      lede={<p>How to read the documents that move African markets — central-bank statements, auction results, supervisory circulars and issuer notices — and what each one changes.</p>}
    >
      <div className="max-w-3xl space-y-12">
        {articles.map((article) => (
          <ArticleCard key={`${article.category}-${article.slug}`} article={article} />
        ))}
      </div>
      <NewsletterBand />
    </PageShell>
  );
}
