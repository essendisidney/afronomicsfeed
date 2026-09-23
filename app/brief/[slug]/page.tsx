import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePage } from "@/components/article/ArticlePage";
import { getArticle, getArticlesByCategory } from "@/lib/content";
import { articleMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getArticlesByCategory("brief").map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle("brief", slug);
  if (!article) return {};
  return articleMetadata(article);
}

export default async function BriefArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle("brief", slug);
  if (!article) notFound();
  return <ArticlePage article={article} />;
}
