import type { Metadata } from "next";
import { articleHref, categoryLabel } from "./format";
import { site } from "./site";
import type { Article } from "./types";

export function articleMetadata(article: Article): Metadata {
  const url = `${site.url}${articleHref(article.category, article.slug)}`;

  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      url,
      publishedTime: `${article.date}T06:00:00+03:00`,
      authors: article.authors,
      section: categoryLabel(article.category),
      tags: article.labels,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
    },
  };
}

export function articleJsonLd(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.date,
    description: article.summary,
    author: article.authors.map((name) => ({ "@type": "Person", name })),
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    mainEntityOfPage: `${site.url}${articleHref(article.category, article.slug)}`,
    articleSection: categoryLabel(article.category),
    keywords: article.labels.join(", "),
  };
}
