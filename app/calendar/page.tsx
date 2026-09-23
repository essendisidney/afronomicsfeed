import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { calendarSlots, scheduledCalendarCount } from "@/lib/demo/calendar";

export const metadata: Metadata = {
  title: "Calendar",
  description: "Desk calendar for Afronomics. Dates stay blank until a primary notice is cited.",
};

export default function CalendarPage() {
  const scheduled = scheduledCalendarCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Calendar" }]}
      kicker="Calendar"
      title="Dates after a notice"
      lede="Slots show what the desk would watch. When is null until a primary document posts the date — no remembered calendar invented as this week’s print."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Slots</p>
          <p className="mt-1 font-serif text-xl">{calendarSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Scheduled</p>
          <p className="mt-1 font-serif text-xl">{scheduled}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/today" className="text-forest underline underline-offset-2">
          Morning file
        </Link>
        {" · "}
        <Link href="/packs" className="text-forest underline underline-offset-2">
          Packs
        </Link>
        {" · "}
        <Link href="/alerts" className="text-forest underline underline-offset-2">
          Alerts
        </Link>
        {" · "}
        <Link href="/sources" className="text-forest underline underline-offset-2">
          Sources
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {calendarSlots.map((slot) => (
          <li key={slot.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {slot.kind} · {slot.status}
            </p>
            <Link href={slot.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {slot.label}
            </Link>
            <p className="mt-1 font-mono text-sm">{slot.when ?? "—"}</p>
            <p className="mt-1 text-sm text-ink-soft">{slot.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="No calendar store" methodology="Empty dates are intentional. No invented MPC week." />
    </LayerPage>
  );
}
