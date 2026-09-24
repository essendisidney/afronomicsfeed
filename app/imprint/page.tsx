import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { filledImprintCount, imprintFields } from "@/lib/demo/imprint";

export const metadata: Metadata = {
  title: "Imprint",
  description: "Publisher imprint for Afronomics Feed. Empty legal fields stay empty until counsel supplies them.",
};

export default function ImprintPage() {
  const filled = filledImprintCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Imprint" }]}
      kicker="Legal"
      title="Publisher notice"
      lede="What we can publish today about the product and house. Empty means counsel has not supplied a registered address or number — this page does not invent them."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Fields</p>
          <p className="mt-1 font-serif text-xl">{imprintFields.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Filled</p>
          <p className="mt-1 font-serif text-xl">{filled}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/legal/privacy" className="text-forest underline underline-offset-2">
          Privacy
        </Link>
        {" · "}
        <Link href="/legal/terms" className="text-forest underline underline-offset-2">
          Terms
        </Link>
        {" · "}
        <Link href="/legal/cookies" className="text-forest underline underline-offset-2">
          Cookies
        </Link>
        {" · "}
        <Link href="/credits" className="text-forest underline underline-offset-2">
          Credits
        </Link>
        {" · "}
        <Link href="/contact" className="text-forest underline underline-offset-2">
          Contact
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {imprintFields.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <p className="mt-1 font-serif text-xl">{item.label}</p>
            {item.href ? (
              <Link href={item.href} className="mt-1 block text-sm text-ink-soft hover:text-forest">
                {item.value}
              </Link>
            ) : (
              <p className="mt-1 text-sm text-ink-soft">{item.value}</p>
            )}
          </li>
        ))}
      </ul>

      <Provenance
        source="Publisher imprint"
        methodology="No field invents a registered address or company number."
      />
    </LayerPage>
  );
}
