import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHeader } from "@/components/ui/PageHeader";
import { TopicChips } from "@/components/ui/TopicChips";
import { getArticlesByInstitution, toIndexItem } from "@/lib/content";
import { getInstitution, institutions } from "@/lib/taxonomy";

export function generateStaticParams() {
  return institutions.map((institution) => ({ slug: institution.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const institution = getInstitution(slug);
  if (!institution) return {};
  return { title: institution.short, description: institution.mandate };
}

export default async function InstitutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const institution = getInstitution(slug);
  if (!institution) notFound();

  const articles = getArticlesByInstitution(institution.slug).map(toIndexItem);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/institutions", label: "Institutions" },
          { label: institution.short },
        ]}
      />
      <div className="mt-8">
        <PageHeader kicker={institution.short} title={institution.name} lede={institution.mandate} />
      </div>
      <p className="mt-6 text-sm">
        <a
          href={institution.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-forest hover:text-gold"
        >
          Official site ↗
        </a>
      </p>
      <div className="mt-6">
        <TopicChips topics={institution.topics} />
      </div>
      <div className="mt-12 space-y-12">
        {articles.length === 0 ? (
          <p className="text-sm text-muted">No pieces filed against this institution yet.</p>
        ) : (
          articles.map((article) => (
            <ArticleCard key={`${article.category}-${article.slug}`} article={article} />
          ))
        )}
      </div>
    </div>
  );
}
