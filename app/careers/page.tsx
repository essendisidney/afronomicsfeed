import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { careerRoles, openCareerCount } from "@/lib/demo/careers";

export const metadata: Metadata = {
  title: "Careers",
  description: "Roles at Afronomics Feed. Empty means nothing is posted — no invented openings.",
};

export default function CareersPage() {
  const open = openCareerCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Careers" }]}
      kicker="Careers"
      title="Roles without a fake opening"
      lede="Shape of desks we will staff. Empty means the role is not posted. This page does not invent a hiring pipeline or applicant count."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{careerRoles.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Open</p>
          <p className="mt-1 font-serif text-xl">{open}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/about" className="text-forest underline underline-offset-2">
          About
        </Link>
        {" · "}
        <Link href="/advisory" className="text-forest underline underline-offset-2">
          Advisory
        </Link>
        {" · "}
        <Link href="/press" className="text-forest underline underline-offset-2">
          Press
        </Link>
        {" · "}
        <Link href="/support" className="text-forest underline underline-offset-2">
          Support
        </Link>
        {" · "}
        <Link href="/contact" className="text-forest underline underline-offset-2">
          Contact
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {careerRoles.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {item.desk} · {item.status}
            </p>
            {item.href ? (
              <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
                {item.label}
              </Link>
            ) : (
              <p className="mt-1 font-serif text-xl">{item.label}</p>
            )}
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Careers catalogue" methodology="No role invents an open hiring slot." />
    </LayerPage>
  );
}
