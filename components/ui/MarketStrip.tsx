import Link from "next/link";
import { currencies } from "@/lib/demo/markets";
import { fxForLabel, loadFxQuote } from "@/lib/fx/reference";

function TapeItems({
  rows,
  duplicate = false,
}: {
  rows: { label: string; value: string; fileHref: string }[];
  duplicate?: boolean;
}) {
  return (
    <ul className="af-tape-items" aria-hidden={duplicate || undefined} {...(duplicate ? { inert: true } : {})}>
      {rows.map((print) => (
        <li key={`${duplicate ? "loop" : "live"}-${print.label}`} className="flex items-baseline gap-1.5 whitespace-nowrap">
          <Link
            href={print.fileHref}
            tabIndex={duplicate ? -1 : undefined}
            className="font-mono uppercase tracking-[0.08em] text-night-ink hover:text-gold-soft"
          >
            {print.label}
          </Link>
          <span className="font-serif">{print.value}</span>
        </li>
      ))}
    </ul>
  );
}

export async function MarketStrip() {
  const quote = await loadFxQuote();
  const rows = currencies.flatMap((item) => {
    const value = fxForLabel(item.label, quote);
    if (!value) return [];
    return [{ label: item.label, value, fileHref: item.fileHref }];
  });
  if (!quote || rows.length === 0) return null;

  return (
    <div className="no-print border-b border-night-line bg-night text-night-soft">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-1.5 sm:px-6">
        <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-night-muted">Reference</span>
        <div className="af-tape-viewport min-w-0 flex-1">
          <div className="af-tape-track text-[11px]">
            <TapeItems rows={rows} />
            <TapeItems rows={rows} duplicate />
          </div>
        </div>
        <span className="hidden shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-night-muted lg:block">
          {quote.updated} · daily reference
        </span>
      </div>
    </div>
  );
}
