import { SectionTitle } from "@/components/data/parts";

export type QA = { q: string; a: string };

/**
 * The questions people search for, answered from the page's own figures. Shown on the page and given to search
 * engines as FAQPage data, so the answer (with today's number) can appear in the results.
 */
export function Questions({ items, kicker = "Quick answers" }: { items: QA[]; kicker?: string }) {
  if (!items.length) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
  return (
    <section className="mt-12">
      <SectionTitle kicker={kicker} title="Questions people ask" />
      <dl className="mt-4 divide-y divide-rule border-y border-rule">
        {items.map((i) => (
          <div key={i.q} className="py-4">
            <dt className="font-medium text-ink">{i.q}</dt>
            <dd className="mt-1 max-w-3xl text-sm text-ink-soft">{i.a}</dd>
          </div>
        ))}
      </dl>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </section>
  );
}
