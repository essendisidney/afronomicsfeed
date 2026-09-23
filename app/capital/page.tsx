import type { Metadata } from "next";
import Link from "next/link";
import { CapitalExplorer } from "@/components/capital/CapitalExplorer";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { capitalBooks } from "@/lib/demo/capital";
import { investors } from "@/lib/demo/investors";

export const metadata: Metadata = {
  title: "Africa Capital Tracker",
  description: "Who invested, how much, into what, where — VC, PE, DFI, climate, infrastructure, sovereign and M&A. Demo rows only.",
};

export default function CapitalPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Capital" }]}
      kicker="Africa Capital Tracker"
      title="Who funded what, across Africa"
      lede="Filter by country, sector, capital type and year once the book is sourced. Amounts stay blank until a cited transaction exists. These rows prove the table, not the market."
    >
      <section className="mb-10">
        <h2 className="font-serif text-2xl">Books</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {capitalBooks.map((book) => (
            <li key={book.slug}>
              <Link href={`/capital/${book.slug}`} className="block h-full border border-rule px-3 py-3 hover:border-gold">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{book.name}</p>
                <p className="mt-2 text-xs leading-5 text-ink-soft">{book.lede}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="mb-10">
        <h2 className="font-serif text-2xl">EXAMPLE investors</h2>
        <ul className="mt-4 flex flex-wrap gap-3 text-sm">
          {investors.map((investor) => (
            <li key={investor.slug}>
              <Link href={`/investors/${investor.slug}`} className="text-forest underline underline-offset-2">
                {investor.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <CapitalExplorer />
      <Provenance
        source="Demonstration tickets (EXAMPLE counterparties)"
        updated="No production capital book"
        methodology="Never silently overwrite a historical ticket"
      />
    </LayerPage>
  );
}
