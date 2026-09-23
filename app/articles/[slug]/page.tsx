import { notFound, redirect } from "next/navigation";
import { getAllArticles } from "@/lib/content";
import { articleHref } from "@/lib/format";

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export default async function ArticleAliasPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getAllArticles().find((item) => item.slug === slug);
  if (!article) notFound();
  redirect(articleHref(article.category, article.slug));
}
