import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { sessionSlots, storedSessionCount } from "@/lib/demo/sessions";

export const metadata: Metadata = {
  title: "Sessions",
  description: "Session words for Afronomics Feed. No clock time is stored.",
};

export default function SessionsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Sessions" }]}
      kicker="Sessions"
      title="When a market would be open"
      lede="These are words a session file would use. This page does not store a clock time or a sample bell."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Vocabulary</p>
          <p className="mt-1 font-serif text-xl">{sessionSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedSessionCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/markets" className="text-forest underline underline-offset-2">
          Markets
        </Link>
        {" · "}
        <Link href="/calendar" className="text-forest underline underline-offset-2">
          Calendar
        </Link>
        {" · "}
        <Link href="/frequencies" className="text-forest underline underline-offset-2">
          Frequencies
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {sessionSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Session words" methodology="Stored count is zero. No clock time is attached." />
    </LayerPage>
  );
}
