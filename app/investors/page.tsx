import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { investors } from "@/lib/demo/investors";

export const metadata: Metadata = {
  title: "Investors",
  description: "EXAMPLE-labelled investor files — no invented real-fund names.",
};

export default function InvestorsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Investors" }]}
      kicker="Investors"
      title="EXAMPLE books only"
      lede="These files exist so capital-flow rows have a door. Real fund names are not invented."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {investors.map((investor) => (
          <li key={investor.slug}>
            <Link href={`/investors/${investor.slug}`} className="block border border-rule px-4 py-3 hover:border-gold">
              <p className="font-serif text-xl">{investor.name}</p>
              <p className="mt-1 text-sm text-ink-soft">{investor.kind}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{investor.lede}</p>
            </Link>
          </li>
        ))}
      </ul>
    </LayerPage>
  );
}
