import Link from "next/link";
import type { Need } from "./today-core";

/**
 * The first phone screen of the desk: how many people are reading today, money collected today, sign-ups, returning
 * readers, and the three things that need the founder. Everything here links down to its full
 * panel; nothing is counted here that the panels below do not also show.
 */

const TONE = { down: "text-down", warn: "text-opinion", neutral: "text-ink-soft" } as const;

export type GlanceFigures = {
  /** People today so far (counted per UTC day: the day starts at 03:00 Nairobi). */
  peopleToday: number | null;
  peopleYesterday: number | null;
  /** Mean people a day over the 7 full days before today. */
  peopleAvg7: number | null;
  collectedToday: string;
  paymentsToday: number;
  signups7d: number;
  returningShare7d: number | null;
  topSource7d: string | null;
};

function Figure({ label, value, note, href }: { label: string; value: string; note?: string; href: string }) {
  return (
    <a href={href} className="block min-w-0 bg-surface px-3 py-2.5 hover:bg-paper-2">
      <span className="block text-[12px] leading-4 text-muted">{label}</span>
      <span className="mt-0.5 block truncate font-serif text-2xl tabular-nums text-ink">{value}</span>
      {note ? <span className="block truncate text-[11px] leading-4 text-muted">{note}</span> : null}
    </a>
  );
}

export function Glance({ figures: f, needs }: { figures: GlanceFigures; needs: Need[] }) {
  const pace =
    f.peopleToday == null
      ? "not available"
      : [f.peopleYesterday != null ? `yesterday ${f.peopleYesterday}` : null, f.peopleAvg7 != null ? `7-day avg ${f.peopleAvg7}` : null].filter(Boolean).join(" · ");
  return (
    <section id="cockpit" aria-labelledby="glance-h" className="scroll-mt-20">
      <h2 id="glance-h" className="sr-only">
        The business at a glance
      </h2>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-4">
        <Figure label="Readers today" value={f.peopleToday == null ? "—" : String(f.peopleToday)} note={pace || "first day of data"} href="#ref-audience" />
        <Figure label="Collected today" value={f.collectedToday} note={`${f.paymentsToday} payment${f.paymentsToday === 1 ? "" : "s"} · real only`} href="#needs" />
        <Figure label="Sign-ups, 7 days" value={String(f.signups7d)} note={f.topSource7d ? `top source: ${f.topSource7d}` : "newsletter"} href="#ref-audience" />
        <Figure label="Returning, 7 days" value={f.returningShare7d == null ? "—" : `${f.returningShare7d}%`} note="of page views" href="#ref-audience" />
      </div>

      <div className="mt-2 rounded-xl border border-rule bg-surface px-3 py-2.5">
        <p className="flex items-baseline justify-between gap-2">
          <span className="text-[13px] font-semibold text-ink">{needs.length ? `${needs.length} need${needs.length === 1 ? "s" : ""} you` : "Nothing needs you today"}</span>
          {needs.length > 3 ? (
            <a href="#needs" className="text-[12px] font-semibold text-forest underline underline-offset-2">
              All {needs.length}
            </a>
          ) : null}
        </p>
        {needs.length ? (
          <ol className="mt-1 divide-y divide-rule">
            {needs.slice(0, 3).map((n, i) => (
              <li key={`${n.rule}-${n.label}-${i}`} className="py-1.5 text-[13px] leading-5">
                <span className={`font-semibold ${TONE[n.tone]}`}>{n.rule}</span>{" "}
                <Link href={n.href} className="text-ink hover:text-forest [overflow-wrap:anywhere]">
                  {n.label}
                </Link>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}
