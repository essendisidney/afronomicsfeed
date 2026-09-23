import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubscribeForm } from "@/components/ui/SubscribeForm";
import { getArticlesByCategory, toIndexItem } from "@/lib/content";
import { fiveThings } from "@/lib/demo/brief";

export const metadata: Metadata = {
  title: "The Afronomics Brief",
  description: "The 5 things moving Africa today — plus the Kenya desk file. What happened, why it matters, what to watch.",
};

export default function BriefIndexPage() {
  const articles = getArticlesByCategory("brief").map(toIndexItem);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="The Afronomics Brief"
        title="The 5 things moving Africa today"
        lede="What happened. Why it matters. The number. Who is affected. What to watch. Morning, closing and weekly capital/climate/tech editions follow the same spine."
      />

      <ol className="mt-10 space-y-6">
        {fiveThings.map((item, index) => (
          <li key={item.href} className="border-b border-rule pb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">{index + 1}</p>
            <p className="mt-2 text-sm leading-6">
              <span className="font-semibold">What happened. </span>
              {item.happened}
            </p>
            <p className="text-sm leading-6 text-ink-soft">
              <span className="font-semibold text-ink">Why it matters. </span>
              {item.why}
            </p>
            <p className="text-sm leading-6 text-ink-soft">
              <span className="font-semibold text-ink">The number. </span>
              {item.number}
            </p>
            <p className="text-sm leading-6 text-ink-soft">
              <span className="font-semibold text-ink">Who is affected. </span>
              {item.affected}
            </p>
            <p className="text-sm leading-6 text-ink-soft">
              <span className="font-semibold text-ink">What to watch. </span>
              {item.watch}
            </p>
            <Link href={item.href} className="mt-2 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-forest">
              Open file →
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-12 border border-rule p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">Email</p>
        <p className="mt-2 text-sm text-ink-soft">Morning Brief waitlist. This form does not take money.</p>
        <div className="mt-4">
          <SubscribeForm />
        </div>
      </div>

      <h2 className="mt-16 font-serif text-2xl">Kenya desk file</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Free readers get the headline and three bullets. The annotated method sits behind a seat.
      </p>
      <div className="mt-8 space-y-12">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
