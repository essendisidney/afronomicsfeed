import { ticker } from "@/lib/demo/markets";
import { formatDateTime } from "@/lib/format";
import { DemoMark } from "./DemoMark";

export function MarketStrip() {
  return (
    <div className="no-print border-b border-rule bg-tape text-tape-ink">
      <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto px-4 py-1.5 sm:px-6">
        <DemoMark />
        <ul className="flex min-w-max items-center gap-5 text-[11px]">
          {ticker.map((print) => (
            <li key={print.label} className="flex items-baseline gap-1.5 whitespace-nowrap">
              <a
                href={print.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono uppercase tracking-[0.1em] text-gold-soft hover:text-tape-ink"
              >
                {print.label}
              </a>
              <span className="font-serif">{print.value}</span>
            </li>
          ))}
        </ul>
        <span className="ml-auto hidden shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-tape-ink/50 lg:block">
          as of {formatDateTime(ticker[0].asOf)} · not a live feed
        </span>
      </div>
    </div>
  );
}
