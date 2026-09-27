import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { releaseSlots, scheduledReleaseCount } from "@/lib/demo/releases";

export const metadata: Metadata = {
  title: "Releases",
  description: "Release shapes for Afronomics Feed. No date is scheduled.",
};

export default function ReleasesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Releases" }]}
      kicker="Releases"
      title="What a release would carry"
      lede="A slot stays empty until an agency, a title and a date exist. This page does not schedule a sample print."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{releaseSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Scheduled</p>
          <p className="mt-1 font-serif text-xl">{scheduledReleaseCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/calendar" className="text-forest underline underline-offset-2">
          Calendar
        </Link>
        {" · "}
        <Link href="/sources" className="text-forest underline underline-offset-2">
          Sources
        </Link>
        {" · "}
        <Link href="/markets" className="text-forest underline underline-offset-2">
          Markets
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {releaseSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Release shapes" methodology="Scheduled count is zero. No date is attached." />
    </LayerPage>
  );
}
