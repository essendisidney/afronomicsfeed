import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { agencyKinds } from "@/lib/demo/agencies";

export const metadata: Metadata = {
  title: "Agencies",
  description: "Central banks, treasuries, exchanges, regulators and statistics offices — files, not invented prints.",
};

export default function AgenciesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Agencies" }]}
      kicker="Agencies"
      title="The official doors, country by country"
      lede="A file for the issuing authority. Official sites remain the source of record. Kenya desk institutions stay on their own map."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {agencyKinds.map((kind) => (
          <li key={kind.slug}>
            <Link href={`/agencies/${kind.slug}`} className="block border border-rule px-4 py-3 hover:border-gold">
              <p className="font-serif text-xl">{kind.label}</p>
              <p className="mt-1 text-sm text-ink-soft">{kind.lede}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">54 country files</p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm">
        Kenya primaries:{" "}
        <Link href="/institutions" className="text-forest underline underline-offset-2">
          Institutions desk
        </Link>
        .
      </p>
    </LayerPage>
  );
}
