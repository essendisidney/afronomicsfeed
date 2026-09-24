import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { contactDoors, openContactCount } from "@/lib/demo/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact doors for Afronomics Feed. No fake form delivery.",
};

export default function ContactPage() {
  const open = openContactCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Contact" }]}
      kicker="Contact"
      title="Doors without a fake form"
      lede="Open doors point at live pages. Empty means no public inbox is published. This desk does not pretend a message was delivered."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Doors</p>
          <p className="mt-1 font-serif text-xl">{contactDoors.length}</p>
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
        <Link href="/support" className="text-forest underline underline-offset-2">
          Support
        </Link>
        {" · "}
        <Link href="/social" className="text-forest underline underline-offset-2">
          Social
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {contactDoors.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {item.kind} · {item.status}
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

      <Provenance source="Contact catalogue" methodology="No door invents a delivered message." />
    </LayerPage>
  );
}
