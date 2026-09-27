import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { holidaySlots, storedHolidayCount } from "@/lib/demo/holidays";

export const metadata: Metadata = {
  title: "Holidays",
  description: "Holiday shapes for Afronomics Feed. No date is stored.",
};

export default function HolidaysPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Holidays" }]}
      kicker="Holidays"
      title="When a market would be shut"
      lede="A slot stays empty until a publisher and a date exist. This page does not store a sample holiday."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{holidaySlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedHolidayCount()}</p>
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
        <Link href="/sessions" className="text-forest underline underline-offset-2">
          Sessions
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {holidaySlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Holiday shapes" methodology="Stored count is zero. No date is attached." />
    </LayerPage>
  );
}
