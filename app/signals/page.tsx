import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { DemoMark } from "@/components/ui/DemoMark";
import { signalCategories, signalCategorySlug, signals } from "@/lib/demo/signals";

export const metadata: Metadata = {
  title: "Signals",
  description: "Afronomics Signal Engine — fact, calculation, model signal and interpretation kept apart.",
};

export default function SignalsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Signals" }]}
      kicker="Signal engine"
      title="Changes that matter, before they are obvious"
      lede="A signal is not a prediction sold as fact. Each card separates the document, any calculation, a model note, and the desk’s interpretation."
    >
      <ul className="mb-8 flex flex-wrap gap-2">
        {signalCategories.map((category) => (
          <li key={category}>
            <Link
              href={`/signals/categories/${signalCategorySlug(category)}`}
              className="border border-rule px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] hover:border-gold"
            >
              {category}
            </Link>
          </li>
        ))}
      </ul>
      <ul className="space-y-6">
        {signals.map((signal) => (
          <li key={signal.slug} className="border border-rule p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">
                {signal.category} · {signal.country} · {signal.sector}
              </p>
              <DemoMark kind="methodology" />
            </div>
            <h2 className="mt-2 font-serif text-2xl">
              <Link href={`/signals/${signal.slug}`} className="hover:text-forest">
                {signal.title}
              </Link>
            </h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="font-mono text-[10px] uppercase text-muted">Direction</dt>
                <dd>{signal.direction}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase text-muted">Confidence</dt>
                <dd>{signal.confidence}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase text-muted">Severity</dt>
                <dd>{signal.severity}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase text-muted">Horizon</dt>
                <dd>{signal.horizon}</dd>
              </div>
            </dl>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <p className="text-sm leading-6">
                <span className="font-semibold">Fact. </span>
                {signal.fact}
              </p>
              <p className="text-sm leading-6 text-ink-soft">
                <span className="font-semibold text-ink">Interpretation. </span>
                {signal.interpretation}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </LayerPage>
  );
}
