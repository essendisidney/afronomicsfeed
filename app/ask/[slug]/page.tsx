import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { askQuestions, getAskQuestion } from "@/lib/demo/ask";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return askQuestions.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const question = getAskQuestion(slug);
  if (!question) return {};
  return {
    title: question.title,
    description: question.lede,
    alternates: { canonical: `${site.url}/ask/${question.slug}` },
  };
}

export default async function AskQuestionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const question = getAskQuestion(slug);
  if (!question) notFound();
  const peers = askQuestions.filter((item) => item.slug !== question.slug);

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/ask", label: "Ask" },
        { label: question.title },
      ]}
      kicker="Ask file"
      title={question.title}
      lede={question.lede}
    >
      <div className="border border-rule bg-paper-2 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">Retrieval status</p>
        <p className="mt-3 font-serif text-2xl">The document index is empty</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
          Afronomics will not generate a number, ranking or time series without a stored observation and a
          source citation. These are the files the question would retrieve once the corpus is connected.
        </p>
      </div>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Would retrieve</h2>
        <ul className="mt-4 space-y-2">
          {question.wouldRetrieve.map((door) => (
            <li key={door.href}>
              <Link href={door.href} className="text-forest underline underline-offset-2">
                {door.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <ul className="mt-8 flex flex-wrap gap-3 text-sm">
        {peers.map((item) => (
          <li key={item.slug}>
            <Link href={`/ask/${item.slug}`} className="text-forest underline underline-offset-2">
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
      <Provenance
        source="No document chunk stored"
        methodology="Model text cannot write a verified GDP, FX print or funding ticket. Citations are mandatory."
      />
    </LayerPage>
  );
}
