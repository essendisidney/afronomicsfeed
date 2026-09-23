import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { personRoles } from "@/lib/demo/people";

export const metadata: Metadata = {
  title: "People",
  description: "Role files — not biographies. No invented names.",
};

export default function PeoplePage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "People" }]}
      kicker="People"
      title="Roles, not biographies"
      lede="A file for the office. Names are not invented. The country cell stays empty until a cited appointment exists."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {personRoles.map((role) => (
          <li key={role.slug}>
            <Link href={`/people/${role.slug}`} className="block border border-rule px-4 py-3 hover:border-gold">
              <p className="font-serif text-xl">{role.label}</p>
              <p className="mt-1 text-sm text-ink-soft">{role.lede}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">54 country files</p>
            </Link>
          </li>
        ))}
      </ul>
    </LayerPage>
  );
}
