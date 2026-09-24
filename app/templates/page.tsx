import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { deskTemplates, issuedTemplateCount } from "@/lib/demo/templates";

export const metadata: Metadata = {
  title: "Templates",
  description: "Editorial and delivery templates for Afronomics. Nothing mints a filled file without a source.",
};

export default function TemplatesPage() {
  const issued = issuedTemplateCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Templates" }]}
      kicker="Templates"
      title="Shapes without a fake fill"
      lede="Brief, signal, pack and export outlines for seats that will use them. This build does not mint a filled brief or invent a cited cell."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Catalogue</p>
          <p className="mt-1 font-serif text-xl">{deskTemplates.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Issued</p>
          <p className="mt-1 font-serif text-xl">{issued}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/runbooks" className="text-forest underline underline-offset-2">
          Runbooks
        </Link>
        {" · "}
        <Link href="/packs" className="text-forest underline underline-offset-2">
          Packs
        </Link>
        {" · "}
        <Link href="/exports" className="text-forest underline underline-offset-2">
          Exports
        </Link>
        {" · "}
        <Link href="/support" className="text-forest underline underline-offset-2">
          Support
        </Link>
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {deskTemplates.map((item) => (
          <li key={item.slug} className="border border-rule px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {item.kind} · {item.seat} · {item.status}
            </p>
            {item.href ? (
              <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
                {item.label}
              </Link>
            ) : (
              <p className="mt-1 font-serif text-xl">{item.label}</p>
            )}
            <p className="mt-2 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Desk template catalogue" methodology="No template invents a filled print." />
    </LayerPage>
  );
}
