import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { DemoMark } from "@/components/ui/DemoMark";
import { Provenance } from "@/components/ui/Provenance";
import { getSignal, signalCategorySlug, signals } from "@/lib/demo/signals";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return signals.map((signal) => ({ slug: signal.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const signal = getSignal(slug);
  if (!signal) return {};
  return {
    title: signal.title,
    description: signal.fact,
    alternates: { canonical: `${site.url}/signals/${signal.slug}` },
  };
}

export default async function SignalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const signal = getSignal(slug);
  if (!signal) notFound();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/signals", label: "Signals" },
        { href: `/signals/categories/${signalCategorySlug(signal.category)}`, label: signal.category },
        { label: signal.title },
      ]}
      kicker={`${signal.category} · ${signal.country}`}
      title={signal.title}
      lede="A signal is not a prediction sold as fact. The document, any calculation, a model note, and the desk’s interpretation stay apart."
    >
      <div className="mb-6">
        <DemoMark kind="methodology" />
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-4">
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
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <p className="text-sm leading-6">
          <span className="font-semibold">Fact. </span>
          {signal.fact}
        </p>
        <p className="text-sm leading-6 text-ink-soft">
          <span className="font-semibold text-ink">Interpretation. </span>
          {signal.interpretation}
        </p>
      </div>
      {signal.countrySlug ? (
        <p className="mt-8 text-sm">
          <Link href={`/countries/${signal.countrySlug}`} className="text-forest underline underline-offset-2">
            {signal.country} terminal
          </Link>
        </p>
      ) : null}
      <ul className="mt-4 flex flex-wrap gap-3 text-sm">
        {signal.related.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-forest underline underline-offset-2">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <Provenance source="Desk methodology" methodology="No production score. Model output never writes a verified observation." />
    </LayerPage>
  );
}
