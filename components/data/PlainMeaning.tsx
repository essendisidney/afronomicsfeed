import Link from "next/link";
import { plainMeaning, type PlainRow } from "@/lib/data/plain";

/**
 * The auction result as money in a saver's pocket. Server-rendered from the published rate; shown on every
 * auction page and the rates comparison. Kiswahili appears for Kenya, Tanzania and Uganda.
 */
export function PlainMeaning({ currency, iso, country, rows, compareHref }: { currency: string; iso: string; country: string; rows: PlainRow[]; compareHref?: string }) {
  const m = plainMeaning({ currency, iso, country, rows });
  if (!m) return null;
  const cur = m.currency;
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));
  return (
    <section className="mt-10 rounded-2xl border border-rule bg-surface px-5 py-5 sm:px-6" aria-labelledby="plain-meaning">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="plain-meaning" className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
          What this means for {cur} {fmt(m.amount)}
        </h2>
        <p className="text-[12px] text-muted">Worked from the published rate · information, not advice</p>
      </div>
      <p className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
        {cur} {fmt(m.take)} <span className="text-base text-muted">in {m.months} months on the {m.lead.tenor}-day bill{m.taxRate != null ? ", after tax" : ""}</span>
      </p>
      <div className="mt-3 space-y-2 text-[15px] leading-7 text-ink-soft">
        {m.en.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      {m.sw ? (
        <details className="mt-4 group">
          <summary className="cursor-pointer text-[13px] font-semibold text-ink hover:text-accent">Kwa Kiswahili</summary>
          <div className="mt-2 space-y-2 text-[15px] leading-7 text-ink-soft">
            {m.sw.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </details>
      ) : null}
      {compareHref ? (
        <p className="mt-4 text-[13px]">
          <Link href={compareHref} className="font-semibold text-ink underline underline-offset-2 hover:text-accent">
            Compare with money market funds and bank deposits, after tax →
          </Link>
        </p>
      ) : null}
    </section>
  );
}
