import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { capitalBooks, capitalCountryParams, capitalRowsFor, getCapitalBook } from "@/lib/demo/capital";
import { getCountry } from "@/lib/demo/countries";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return capitalCountryParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; country: string }>;
}): Promise<Metadata> {
  const { type, country: countrySlug } = await params;
  const book = getCapitalBook(type);
  const country = getCountry(countrySlug);
  if (!book || !country) return {};
  return {
    title: `${book.name} in ${country.name}`,
    description: `${book.name} capital file for ${country.name}. ${book.lede}`,
    alternates: { canonical: `${site.url}/capital/${book.slug}/${country.slug}` },
  };
}

export default async function CapitalCountryPage({
  params,
}: {
  params: Promise<{ type: string; country: string }>;
}) {
  const { type, country: countrySlug } = await params;
  const book = getCapitalBook(type);
  const country = getCountry(countrySlug);
  if (!book || !country) notFound();

  const tickets = capitalRowsFor(book.name, country.slug);
  const peers = capitalBooks.filter((item) => item.slug !== book.slug).slice(0, 4);

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/capital", label: "Capital" },
        { href: `/capital/${book.slug}`, label: book.name },
        { label: country.name },
      ]}
      kicker={`${book.name} · ${country.iso}`}
      title={`${book.name} in ${country.name}`}
      lede={`${book.lede} This country file is empty until a cited ${book.name.toLowerCase()} ticket exists.`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Tickets" note={tickets.length ? `${tickets.length} demo row(s) — not a book` : "No sourced ticket"} />
        <EmptyMetric label="Amount" note="Blank until a cited commitment" />
        <EmptyMetric label="Latest as-of" />
      </div>

      {tickets.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-serif text-2xl">Demonstration tickets</h2>
          <ul className="mt-4 space-y-3">
            {tickets.map((row) => (
              <li key={row.id} className="border border-rule px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                  {row.stage} · {row.year}
                </p>
                <p className="mt-1 font-serif text-xl">
                  {row.investor} → {row.target}
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  {row.sector} · {row.amount} {row.currency}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-8 text-sm">
        <Link href={`/countries/${country.slug}/capital`} className="text-forest underline underline-offset-2">
          {country.name} capital series
        </Link>
        {" · "}
        <Link href={`/capital/${book.slug}`} className="text-forest underline underline-offset-2">
          All {book.name} country files
        </Link>
      </p>

      <ul className="mt-6 flex flex-wrap gap-3 text-sm">
        {peers.map((item) => (
          <li key={item.slug}>
            <Link href={`/capital/${item.slug}/${country.slug}`} className="text-forest underline underline-offset-2">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>

      <Provenance
        source="Demonstration tickets only where labelled"
        methodology="Never silently overwrite a historical ticket. Amounts stay blank without a citation."
      />
    </LayerPage>
  );
}
