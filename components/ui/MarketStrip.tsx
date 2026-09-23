import { ticker } from "@/lib/demo/markets";
import { formatDateTime } from "@/lib/format";
import { DemoMark } from "./DemoMark";

function TapeItems({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul className="af-tape-items" aria-hidden={duplicate || undefined} {...(duplicate ? { inert: true } : {})}>
      {ticker.map((print) => (
        <li key={`${duplicate ? "loop" : "live"}-${print.label}`} className="flex items-baseline gap-1.5 whitespace-nowrap">
          <a
            href={print.href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={duplicate ? -1 : undefined}
            className="font-mono uppercase tracking-[0.08em] text-gold hover:text-ink"
          >
            {print.label}
          </a>
          <span className="font-serif">{print.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function MarketStrip() {
  return (
    <div className="no-print border-b border-rule bg-tape text-tape-ink">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-1.5 sm:px-6">
        <DemoMark />
        <div className="af-tape-viewport min-w-0 flex-1">
          <div className="af-tape-track text-[11px]">
            <TapeItems />
            <TapeItems duplicate />
          </div>
        </div>
        <span className="hidden shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-tape-ink/50 lg:block">
          as of {formatDateTime(ticker[0].asOf)} · not a live feed
        </span>
      </div>
    </div>
  );
}
