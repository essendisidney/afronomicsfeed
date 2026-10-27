import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { moneyLabel } from "@/lib/billing/plans";
import { toUsd } from "./money-core";
import { GrantAccess } from "./DeskActions";
import type { MoneyWindow, Need } from "./today-core";

/**
 * The first screen of the desk: money (real payments only) and what needs the founder today.
 * Collected money is the only money here.
 */

const usd = (n: number) => `$${n < 10 && n > 0 ? n.toFixed(2) : Math.round(n).toLocaleString("en-US")}`;
const toneClass = { down: "text-down", warn: "text-opinion", neutral: "text-ink-soft" } as const;

export function TodayStrip({
  windows,
  perUsd,
  moneyNote,
  needs,
}: {
  windows: MoneyWindow[];
  perUsd: Record<string, number>;
  moneyNote: string;
  needs: Need[];
}) {
  const rules = [...new Set(needs.map((n) => n.rule))].map((r) => ({ rule: r, n: needs.filter((x) => x.rule === r).length, tone: needs.find((x) => x.rule === r)!.tone }));
  const top = needs.slice(0, 3);
  const rest = needs.slice(3);

  return (
    <section aria-labelledby="today-title" className="grid gap-4 lg:grid-cols-12 lg:items-start">
      <h2 id="today-title" className="sr-only">
        Today
      </h2>
      <div className="space-y-4 lg:col-span-7">
        <Card className="!px-0 !py-0 overflow-hidden">
          <div className="grid grid-cols-2 gap-px bg-rule sm:grid-cols-4">
            {windows.map((w) => {
              const total = toUsd(w.rows, perUsd).total;
              const shown = w.rows.filter((r) => r.amount);
              return (
                <div key={w.label} className="bg-surface px-4 py-3">
                  <p className="text-[12px] text-muted">Collected {w.label}</p>
                  <p className={`mt-1 font-serif text-2xl tabular-nums ${total > 0 ? "text-up" : "text-ink"}`}>{usd(total)}</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-muted [overflow-wrap:anywhere]">
                    {shown.length ? shown.map((r) => moneyLabel(r.amount, r.currency)).join(" + ") : "nothing"}
                    {w.count != null ? ` · ${w.count} payment${w.count === 1 ? "" : "s"}` : ""}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="border-t border-rule px-4 py-2 text-[11px] text-muted">{moneyNote}</p>
        </Card>
      </div>

      <Card tone="emphasis" id="needs" className="scroll-mt-20 lg:col-span-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-serif text-xl text-ink">{needs.length ? `${needs.length} thing${needs.length === 1 ? "" : "s"} need you today` : "Nothing needs you today"}</h3>
          <div className="flex flex-wrap gap-1.5">
            {rules.map((r) => (
              <Badge key={r.rule} tone={r.tone === "down" ? "down" : r.tone === "warn" ? "warn" : "neutral"}>
                {r.rule} {r.n}
              </Badge>
            ))}
          </div>
        </div>
        {top.length ? (
          <ol className="mt-3 space-y-2">
            {top.map((n, i) => (
              <li key={`${n.rule}-${n.label}-${i}`} className="flex gap-3 rounded-xl border border-rule bg-paper px-3 py-2">
                <span className="font-serif text-xl leading-6 text-muted">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[12px] font-semibold ${toneClass[n.tone]}`}>{n.rule}</p>
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
          <p className="mt-2 text-sm text-muted">No payments waiting for access, no waiting inbox items, no setup gaps detected.</p>
        )}
        {rest.length ? (
          <details className="mt-3">
            <summary className="cursor-pointer text-[13px] font-semibold text-forest">All {needs.length}</summary>
            <ul className="mt-2 divide-y divide-rule">
              {rest.map((n, i) => (
                <li key={`${n.rule}-${n.label}-r${i}`} className="py-2 text-sm">
                  <span className={`text-[12px] font-semibold ${toneClass[n.tone]}`}>{n.rule}</span>{" "}
                  <Link href={n.href} className="text-ink hover:text-forest [overflow-wrap:anywhere]">
                    {n.label}
                  </Link>
                  {n.detail ? <span className="block text-[12px] text-muted [overflow-wrap:anywhere]">{n.detail}</span> : null}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </Card>
    </section>
  );
}
