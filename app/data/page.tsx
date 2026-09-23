import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { indicators } from "@/lib/demo/indicators";

export const metadata: Metadata = {
  title: "Data",
  description: "Afronomics datasets, Pulse methodology and Chart of the Day — published only with provenance.",
};

export default function DataPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Data" }]}
      kicker="Data"
      title="Observations with a source, or they do not ship"
      lede="Chart of the Day, Number of the Day and Africa in 5 Charts publish when a cited series exists. Until then the desk stays blank on purpose."
    >
      <section>
        <h2 className="font-serif text-2xl">Data of the day</h2>
        <div className="mt-4 border border-rule p-6">
          <p className="font-serif text-2xl">No verified observation selected</p>
          <p className="mt-2 text-sm text-ink-soft">
            Share, embed and CSV download attach once a chart has a stored series.
          </p>
        </div>
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Catalog</h2>
        <ul className="mt-4 space-y-3">
          {indicators.map((item) => (
            <li key={item.slug} className="border-b border-rule pb-3">
              <Link href={`/indicators/${item.slug}`} className="font-serif text-xl hover:text-forest">
                {item.name}
              </Link>
              <p className="text-sm text-muted">{item.note}</p>
            </li>
          ))}
        </ul>
      </section>
    </LayerPage>
  );
}
