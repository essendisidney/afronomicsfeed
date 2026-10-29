import { Card } from "@/components/ui/Card";
import { moneyLabel } from "@/lib/billing/plans";
import { toUsd } from "./money-core";
import type { MoneyWindow } from "./today-core";

/** Collected money (real payments only) today, 7 days, 30 days and all time, in US dollars with the currencies beneath. */

const usd = (n: number) => `$${n < 10 && n > 0 ? n.toFixed(2) : Math.round(n).toLocaleString("en-US")}`;

export function MoneyWindows({ windows, perUsd, moneyNote }: { windows: MoneyWindow[]; perUsd: Record<string, number>; moneyNote: string }) {
  return (
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
  );
}
