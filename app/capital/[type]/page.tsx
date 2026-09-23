import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { capitalBooks, capitalFileHref, getCapitalBook } from "@/lib/demo/capital";
import { countries } from "@/lib/demo/countries";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return capitalBooks.map((book) => ({ type: book.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const book = getCapitalBook(type);
  if (!book) return {};
  return {
    title: `${book.name} capital`,
    description: book.lede,
    alternates: { canonical: `${site.url}/capital/${book.slug}` },
  };
}

export default async function CapitalTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const book = getCapitalBook(type);
  if (!book) notFound();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/capital", label: "Capital" },
        { label: book.name },
      ]}
      kicker="Capital book"
      title={book.name}
      lede={book.lede}
    >
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((country) => (
          <li key={country.slug}>
            <Link
              href={capitalFileHref(book.slug, country.slug)}
              className="block border border-rule px-3 py-3 hover:border-gold"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{country.iso}</p>
              <p className="mt-1 font-serif text-lg">{country.name}</p>
              <p className="mt-1 text-xs text-muted">{book.name} file · no production tickets</p>
            </Link>
          </li>
        ))}
      </ul>
      <Provenance source="No production capital book" methodology="Country files exist so a sourced ticket has a place to land." />
    </LayerPage>
  );
}
