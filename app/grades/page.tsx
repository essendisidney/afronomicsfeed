import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { gradeSlots, storedGradeCount } from "@/lib/demo/grades";

export const metadata: Metadata = {
  title: "Grades",
  description: "Specification shapes for Afronomics Feed. No grade is stored.",
};

export default function GradesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Grades" }]}
      kicker="Grades"
      title="What a specification would name"
      lede="A slot stays empty until a specification and a source exist. This page does not store a sample grade."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{gradeSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedGradeCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/baskets" className="text-forest underline underline-offset-2">
          Baskets
        </Link>
        {" · "}
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
        {" · "}
        <Link href="/constituents" className="text-forest underline underline-offset-2">
          Constituents
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {gradeSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Grade shapes" methodology="Stored count is zero. No specification is attached." />
    </LayerPage>
  );
}
