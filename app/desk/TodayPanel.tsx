import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { GrantAccess } from "./DeskActions";
import type { Need } from "./today-core";

/**
 * The Today tab: three numbers and at most five things that need the founder. Everything else lives in the
 * People, Money and Site tabs; each number links to the tab that explains it.
 */

const TONE = { down: "text-down", warn: "text-opinion", neutral: "text-ink-soft" } as const;

export type TodayFigures = {
  /** US dollars collected in the last 30 days, already formatted; real payments only. */
  collected30d: string;
  payments30d: number;
  /** One browser a day, last 7 days; null when the people counter is unavailable. */
  people7d: number | null;
  peoplePrev7d: number | null;
  /** New people who gave us an email in 7 days (any way: newsletter, alerts, pilot, key, payment). */
  newPeople7d: number;
  knownPeople: number | null;
};

function Figure({ label, value, note, href }: { label: string; value: string; note: string; href: string }) {
  return (
    <Link href={href} className="block min-w-0 bg-surface px-4 py-3 hover:bg-paper-2">
      <span className="block text-[12px] leading-4 text-muted">{label}</span>
      <span className="mt-1 block truncate font-serif text-3xl tabular-nums text-ink">{value}</span>
      <span className="mt-0.5 block truncate text-[12px] leading-4 text-muted">{note}</span>
    </Link>
  );
}

const MAX_NEEDS = 5;

export function TodayPanel({ figures: f, needs }: { figures: TodayFigures; needs: Need[] }) {
  const change = f.people7d != null && f.peoplePrev7d ? Math.round(((f.people7d - f.peoplePrev7d) / f.peoplePrev7d) * 100) : null;
  const top = needs.slice(0, MAX_NEEDS);
  return (
    <section aria-labelledby="today-h" className="space-y-4">
      <h2 id="today-h" className="sr-only">
        Today
      </h2>
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-3">
        <Figure label="Collected, 30 days" value={f.collected30d} note={`${f.payments30d} payment${f.payments30d === 1 ? "" : "s"} · real only`} href="?tab=money" />
        <Figure
          label="Readers, 7 days"
          value={f.people7d == null ? "—" : String(f.people7d)}
          note={change == null ? "one browser a day" : `${change > 0 ? "+" : ""}${change}% vs prior week`}
          href="?tab=people#readers"
        />
        <Figure
          label="New people, 7 days"
          value={String(f.newPeople7d)}
          note={f.knownPeople == null ? "gave us an email" : `${f.knownPeople} known in all`}
          href="?tab=people"
        />
      </div>

      <div id="needs" className="scroll-mt-20 rounded-xl border border-rule bg-surface px-4 py-3">
        <p className="font-serif text-xl text-ink">{needs.length ? `${needs.length} thing${needs.length === 1 ? "" : "s"} need${needs.length === 1 ? "s" : ""} you` : "Nothing needs you today"}</p>
        {top.length ? (
          <ol className="mt-2 divide-y divide-rule">
            {top.map((n, i) => (
              <li key={`${n.rule}-${n.label}-${i}`} className="flex gap-3 py-2">
                <span className="font-serif text-lg leading-6 text-muted">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[12px] font-semibold ${TONE[n.tone]}`}>{n.rule}</p>
                  <p className="text-sm font-medium text-ink [overflow-wrap:anywhere]">
                    <Link href={n.href} className="hover:text-forest">
                      {n.label}
                    </Link>
                  </p>
                  {n.detail ? <p className="text-[12px] text-muted [overflow-wrap:anywhere]">{n.detail}</p> : null}
                  {n.action?.kind === "access" ? <GrantAccess reference={n.action.reference} /> : null}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-1 text-sm text-muted">No payments waiting for access, no inbox items waiting, no setup gaps.</p>
        )}
        {needs.length > MAX_NEEDS ? (
          <details className="mt-2">
            <summary className="cursor-pointer">
              <Badge tone="neutral">+{needs.length - MAX_NEEDS} more</Badge>
            </summary>
            <ul className="mt-2 divide-y divide-rule">
              {needs.slice(MAX_NEEDS).map((n, i) => (
                <li key={`${n.rule}-${n.label}-r${i}`} className="py-2 text-sm">
                  <span className={`text-[12px] font-semibold ${TONE[n.tone]}`}>{n.rule}</span>{" "}
                  <Link href={n.href} className="text-ink hover:text-forest [overflow-wrap:anywhere]">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </section>
  );
}
