import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { getAllArticles } from "@/lib/content";
import { articleHref, categoryLabel, formatDate } from "@/lib/format";
import { fitDescription, withSocial } from "@/lib/seo";
import { site } from "@/lib/site";
import { topics } from "@/lib/taxonomy";

const description =
  "Every Afronomics brief, weekly note and explainer, filterable by type and topic, plus the Wire, the Morning and the archive.";

export const metadata: Metadata = withSocial(
  {
    title: "Stories: briefs, weekly notes and explainers",
    description: fitDescription(description),
    alternates: { canonical: `${site.url}/stories` },
  },
  "/stories",
);

const types = [
  { id: "all", label: "All" },
  { id: "brief", label: "Briefs" },
  { id: "weekly", label: "Weekly" },
  { id: "explainer", label: "Explainers" },
] as const;

const more = [
  { href: "/receipts", label: "Receipts", note: "Our daily verdict on one money event, with the figures from the source" },
  { href: "/casebook", label: "Casebook", note: "What happened before, who lost, and what to ask now" },
  { href: "/news", label: "The Wire", note: "Headlines from African business media, linked to the publisher" },
  { href: "/morning", label: "The Morning", note: "The day's rates and currencies, every weekday" },
  { href: "/morning/sw", label: "Asubuhi", note: "The Morning in Kiswahili" },
  { href: "/archive", label: "Archive", note: "Every edition, by date" },
  { href: "/topics", label: "Topics", note: "Stories grouped by subject" },
  { href: "/institutions", label: "Institutions", note: "Stories by regulator and central bank" },
] as const;

type Query = { type?: string; topic?: string };

function filterHref(q: Query) {
  const params = new URLSearchParams();
  if (q.type && q.type !== "all") params.set("type", q.type);
  if (q.topic) params.set("topic", q.topic);
  const s = params.toString();
  return s ? `/stories?${s}` : "/stories";
}

export default async function StoriesPage({ searchParams }: { searchParams: Promise<Query> }) {
  const q = await searchParams;
  const type = types.some((t) => t.id === q.type) ? q.type! : "all";
  const topic = topics.some((t) => t.slug === q.topic) ? q.topic : undefined;
  const all = getAllArticles();
  const usedTopics = topics.filter((t) => all.some((a) => a.topics?.includes(t.slug)));
  const list = all.filter((a) => (type === "all" || a.category === type) && (!topic || a.topics?.includes(topic)));
  const chip = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-4 text-[13px] font-medium ${active ? "border-forest bg-forest text-paper" : "border-rule text-ink-soft hover:border-forest hover:text-ink"}`;

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Today" }, { label: "Stories" }]}
      kicker="Stories"
      title="What happened, why, and what it means for your money"
      lede="Every story is labelled Facts, Analysis or Opinion, and every figure in it names its source."
    >
      <nav aria-label="Filter by type" className="mt-2 flex flex-wrap gap-2">
        {types.map((t) => (
          <Link key={t.id} href={filterHref({ type: t.id, topic })} aria-current={type === t.id ? "page" : undefined} className={chip(type === t.id)}>
            {t.label}
          </Link>
        ))}
      </nav>
      {usedTopics.length ? (
        <nav aria-label="Filter by topic" className="mt-3 flex flex-wrap gap-2">
          <Link href={filterHref({ type })} aria-current={!topic ? "page" : undefined} className={chip(!topic)}>
            Every topic
          </Link>
          {usedTopics.map((t) => (
            <Link key={t.slug} href={filterHref({ type, topic: t.slug })} aria-current={topic === t.slug ? "page" : undefined} className={chip(topic === t.slug)}>
              {t.name}
            </Link>
          ))}
        </nav>
      ) : null}

      <p className="tabular mt-6 text-[13px] text-muted">
        {list.length} {list.length === 1 ? "story" : "stories"}
      </p>
      {list.length ? (
        <ul className="mt-3 divide-y divide-rule border-y border-rule">
          {list.map((a) => (
            <li key={`${a.category}-${a.slug}`}>
              <Link href={articleHref(a.category, a.slug)} className="block py-4 hover:bg-paper-2 sm:px-2">
                <p className="text-[12px] font-semibold text-muted">
                  {categoryLabel(a.category)} · <time dateTime={a.date}>{formatDate(a.date)}</time>
                </p>
                <p className="mt-1 font-serif text-[1.2rem] leading-snug text-ink">{a.title}</p>
                {a.summary ? <p className="mt-1 max-w-3xl text-[14px] leading-6 text-ink-soft">{a.summary}</p> : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[15px] text-ink-soft">No stories match. <Link href="/stories" className="underline underline-offset-2">Show all</Link>.</p>
      )}

      <section aria-labelledby="more-reading" className="mt-12">
        <h2 id="more-reading" className="font-serif text-2xl text-ink">
          More to read
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {more.map((m) => (
            <li key={m.href}>
              <Link href={m.href} className="flex h-full min-h-11 flex-col rounded-2xl border border-rule bg-surface px-4 py-3 hover:border-forest">
                <span className="text-[15px] font-semibold text-ink">{m.label} →</span>
                <span className="mt-0.5 text-[13px] leading-5 text-muted">{m.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
