import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHeader } from "@/components/ui/PageHeader";
import { TopicChips } from "@/components/ui/TopicChips";
import { getArticlesByTopic, toIndexItem } from "@/lib/content";
import { getTopic, topics } from "@/lib/taxonomy";

export function generateStaticParams() {
  return topics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return {};
  return { title: topic.name, description: topic.summary };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const articles = getArticlesByTopic(topic.slug).map(toIndexItem);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/topics", label: "Topics" },
          { label: topic.name },
        ]}
      />
      <div className="mt-8">
        <PageHeader kicker="Topic" title={topic.name} lede={topic.summary} />
      </div>
      <div className="mt-6">
        <TopicChips institutions={topic.institutions} />
      </div>
      <div className="mt-12 space-y-12">
        {articles.map((article) => (
          <ArticleCard key={`${article.category}-${article.slug}`} article={article} />
        ))}
      </div>
    </div>
  );
}
