import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { publishedSdkCount, sdkPackages } from "@/lib/demo/sdk";

export const metadata: Metadata = {
  title: "SDK",
  description: "Client SDK catalogue for Afronomics. No package is published without a live key policy.",
};

export default function SdkPage() {
  const published = publishedSdkCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "SDK" }]}
      kicker="SDK"
      title="Clients without a fake package"
      lede="Catalogue shapes for TypeScript, Python and Office clients. This build does not publish to npm, PyPI or an add-in store."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Catalogue</p>
          <p className="mt-1 font-serif text-xl">{sdkPackages.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Published</p>
          <p className="mt-1 font-serif text-xl">{published}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/developers" className="text-forest underline underline-offset-2">
          Developers
        </Link>
        {" · "}
        <Link href="/embeds" className="text-forest underline underline-offset-2">
          Embeds
        </Link>
        {" · "}
        <Link href="/integrations" className="text-forest underline underline-offset-2">
          Integrations
        </Link>
        {" · "}
        <Link href="/account/usage" className="text-forest underline underline-offset-2">
          Usage
        </Link>
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {sdkPackages.map((item) => (
          <li key={item.slug} className="border border-rule px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {item.language} · {item.seat} · {item.status}
            </p>
            <p className="mt-1 font-serif text-xl">{item.label}</p>
            <p className="mt-2 text-sm text-ink-soft">{item.lede}</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Publish — key policy required
            </p>
          </li>
        ))}
      </ul>

      <Provenance source="No package registry" methodology="Catalogue only. No client invents a print." />
    </LayerPage>
  );
}
