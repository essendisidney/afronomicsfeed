import { fmtAmount, fmtBpsAbs, fmtCover, fmtMillions, fmtRate, resultName, shortDate, type AuctionWeek, type MarketMeta } from "@/lib/data/auction-week";

function Tile({ label, value, note }: { label: string; value: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="min-w-0 bg-paper-2 px-4 py-4">
      <p className="text-[12px] font-medium text-gold">{label}</p>
      <p className="mt-1.5 font-serif text-2xl leading-tight tracking-[-0.02em] text-ink sm:text-3xl">{value}</p>
      {note ? <p className="mt-1 text-[12px] leading-5 text-ink-soft">{note}</p> : null}
    </div>
  );
}

const arrow = (bps: number) => (bps > 0 ? "▲" : bps < 0 ? "▼" : "");

/** The week in six numbers, each computed from the auction files on this build. */
export function HeadlineStats({ week }: { week: AuctionWeek }) {
  const metas = new Map<string, MarketMeta>(week.markets.map((m) => [m.meta.key, m.meta]));
  const name = (r: Parameters<typeof resultName>[0]) => resultName(r, metas, false);
  const { weekMove: move, coverHigh: high, coverLow: low } = week;
  const missing = week.markets.reduce((n, m) => n + m.acceptedMissing, 0);
  const tie = (n: number) => (n ? ` (and ${n} other result${n === 1 ? "" : "s"} at the same level)` : "");
  return (
    <section aria-labelledby="aw-numbers">
      <h2 id="aw-numbers" className="sr-only">
        The week in numbers
      </h2>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rule bg-rule lg:grid-cols-3">
        <Tile label="Auctions held" value={week.auctions} note={`${week.resultCount} results by tenor`} />
        <Tile label="Markets active" value={week.marketsActive} note={week.markets.map((m) => m.meta.country).join(", ")} />
        <div className="col-span-2 lg:col-span-1">
          <Tile
            label="Largest move, week on week"
            value={
              move ? (
                <>
                  {arrow(move.bps)} {fmtBpsAbs(move.bps)} bp
                </>
              ) : (
                "—"
              )
            }
            note={
              move ? (
                <>
                  {name(move.result)}: {fmtRate(move.prev.rate)} on {shortDate(move.prev.date)} to {fmtRate(move.result.rate)} on {shortDate(move.result.date)}. Among{" "}
                  {week.weekPairs} tenor{week.weekPairs === 1 ? "" : "s"} sold in both weeks.
                </>
              ) : (
                "No tenor was sold in both this week and the week before."
              )
            }
          />
        </div>
        <Tile
          label="Highest bid cover"
          value={high ? fmtCover(high.result.bidCover!) : "—"}
          note={high ? `${name(high.result)}, ${shortDate(high.result.date)}${tie(high.ties)}` : "No bid cover published"}
        />
        <Tile
          label="Lowest bid cover"
          value={low ? fmtCover(low.result.bidCover!) : "—"}
          note={low ? `${name(low.result)}, ${shortDate(low.result.date)}${tie(low.ties)}` : "No bid cover published"}
        />
        <div className="col-span-2 lg:col-span-1">
          <div className="h-full min-w-0 bg-paper-2 px-4 py-4">
            <p className="text-[12px] font-medium text-gold">Accepted, by currency</p>
            <ul className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[14px]">
              {week.accepted.map((c) => (
                <li key={c.currency} className="flex justify-between gap-2" title={`${c.currency} ${fmtMillions(c.total)} million`}>
                  <span className="text-ink-soft">{c.currency}</span>
                  <span className="font-mono text-ink">{fmtAmount("", c.total).trim()}</span>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-[12px] leading-5 text-ink-soft">
              Not converted.
              {missing ? ` ${missing} result${missing === 1 ? "" : "s"} without a published amount ${missing === 1 ? "is" : "are"} left out.` : ""}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
