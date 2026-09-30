import Link from "next/link";
import { formatFx, loadFxQuote, pairHref, tapeCodes } from "@/lib/data/fx";

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
            className="font-medium text-night-ink hover:text-gold-soft"
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
  const rows = tapeCodes.flatMap((code) => {
    const rate = quote?.rates[code];
    if (rate == null) return [];
    return [{ label: `USD/${code}`, value: formatFx(rate), fileHref: pairHref(code) }];
  });
  if (!quote || rows.length === 0) return null;

  return (
    <div className="no-print border-b border-night-line bg-night text-night-soft">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-1.5 sm:px-6">
        <Link href="/markets" className="shrink-0 font-medium text-[12px] text-night-muted hover:text-night-ink">FX</Link>
        <div className="af-tape-viewport min-w-0 flex-1">
          <div className="af-tape-track text-[11px]">
            <TapeItems rows={rows} />
            <TapeItems rows={rows} duplicate />
          </div>
        </div>
        <span className="hidden shrink-0 font-medium text-[12px] text-night-muted lg:block">
          Mid-market reference · {quote.updated.replace(/ \+0000$/, " UTC")}
        </span>
      </div>
    </div>
  );
}
