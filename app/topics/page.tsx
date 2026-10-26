import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { getArticlesByTopic } from "@/lib/content";
import { topics } from "@/lib/taxonomy";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Topics",
  alternates: { canonical: `${site.url}/topics` },
  description: "Desk topics for Kenya banking, markets, and financial regulation.",
};

export default function TopicsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Topics"
        title="The file by subject"
        lede="Our briefs and explainers filed by subject: Kenya’s banking, markets and financial regulators. Information, not advice."
      />
      <ul className="mt-12 space-y-4">
        {topics.map((topic) => {
          const count = getArticlesByTopic(topic.slug).length;
          return (
            <li key={topic.slug}>
              <Link href={`/topics/${topic.slug}`} className="block border border-rule px-5 py-5 hover:border-gold">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-2xl text-ink">{topic.name}</h2>
                  <span className="font-medium text-[12.5px] text-muted">
                    {count}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{topic.summary}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
