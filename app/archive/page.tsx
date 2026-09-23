import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAllArticles, toIndexItem } from "@/lib/content";
import { topics } from "@/lib/taxonomy";
import type { Category, ContentLabel } from "@/lib/types";

export const metadata: Metadata = {
  title: "Archive",
  description: "Every Afronomics Feed brief, weekly note, and explainer in one file.",
};

type Query = { type?: string; topic?: string; label?: string };

const types: { value?: Category; label: string }[] = [
  { label: "All" },
  { value: "brief", label: "Daily Brief" },
  { value: "weekly", label: "Weekly" },
  { value: "explainer", label: "Explainers" },
];

const labels: ContentLabel[] = ["Facts", "Analysis", "Opinion"];

function archiveHref(query: Query) {
  const params = new URLSearchParams();
  if (query.type) params.set("type", query.type);
  if (query.topic) params.set("topic", query.topic);
  if (query.label) params.set("label", query.label);
  const qs = params.toString();
  return qs ? `/archive?${qs}` : "/archive";
}

function chipClass(active: boolean) {
  return `px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] ${
    active ? "bg-forest text-paper" : "border border-rule text-ink-soft hover:border-gold"
  }`;
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const raw = await searchParams;
  const category = raw.type === "brief" || raw.type === "weekly" || raw.type === "explainer" ? raw.type : undefined;
  const topic = topics.some((item) => item.slug === raw.topic) ? raw.topic : undefined;
  const label = labels.includes(raw.label as ContentLabel) ? (raw.label as ContentLabel) : undefined;
  const query: Query = { type: category, topic, label };

  const articles = getAllArticles()
    .filter((article) => !category || article.category === category)
    .filter((article) => !topic || article.topics?.includes(topic))
    .filter((article) => !label || article.labels.includes(label))
    .map(toIndexItem);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Archive"
        title="The whole file"
        lede="Filter by series, topic, or label. Search from the header still reads teasers."
      />

      <div className="mt-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          {types.map((item) => (
            <Link
              key={item.label}
              href={archiveHref({ ...query, type: item.value === category ? undefined : item.value })}
              className={chipClass(item.value === category || (!item.value && !category))}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {labels.map((item) => (
            <Link
              key={item}
              href={archiveHref({ ...query, label: item === label ? undefined : item })}
              className={chipClass(item === label)}
            >
              {item}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {topics.map((item) => (
            <Link
              key={item.slug}
              href={archiveHref({ ...query, topic: item.slug === topic ? undefined : item.slug })}
              className={chipClass(item.slug === topic)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
        {articles.length} {articles.length === 1 ? "piece" : "pieces"}
      </p>
      <div className="mt-10 space-y-12">
        {articles.map((article) => (
          <ArticleCard key={`${article.category}-${article.slug}`} article={article} />
        ))}
      </div>
    </div>
  );
}
