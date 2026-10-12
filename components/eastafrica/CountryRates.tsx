import Link from "next/link";
import { eaDate, eaPct, eaTenor, type EaCountry } from "@/lib/data/east-africa";

/** Source URLs as the publishers print them can carry spaces; encode only those, never an existing %-escape. */
export const srcHref = (u: string) => u.replace(/ /g, "%20");

function Ext({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={srcHref(href)} target="_blank" rel="noopener noreferrer" className={`underline decoration-rule underline-offset-2 hover:text-forest hover:decoration-forest ${className}`}>
      {children}
    </a>
  );
}

function Block({ title, note, children }: { title: string; note?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-t border-rule pt-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h4 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">{title}</h4>
        {note ? <p className="text-[11px] text-muted">{note}</p> : null}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/** One country's rates today: policy rate, bills, latest bond auction and Eurobonds, each figure linked to its source. */
export function CountryRates({ c }: { c: EaCountry }) {
  const billDates = [...new Set((c.bill?.rows ?? []).map((r) => r.date))];
  const sameBillDate = billDates.length === 1;
  return (
    <article id={`ea-card-${c.slug}`} className="flex min-w-0 scroll-mt-24 flex-col gap-3 rounded-2xl border border-rule bg-surface px-4 py-4 sm:px-5" aria-labelledby={`ea-${c.slug}`}>
      <header className="flex items-baseline justify-between gap-3">
        <h3 id={`ea-${c.slug}`} className="font-serif text-2xl text-ink">
          <Link href={c.countryHref} className="hover:text-forest">
            {c.country}
          </Link>
        </h3>
        <span className="text-[12px] text-muted">{c.currency}</span>
      </header>

      <Block title="Policy rate">
        {c.policy.read ? (
          <>
            <p className="flex flex-wrap items-baseline gap-x-2">
              <Ext href={c.policy.source} className="font-mono text-2xl font-semibold text-ink">
                {eaPct(c.policy.rate)}
              </Ext>
              <span className="text-[13px] text-ink-soft">{c.policy.label}</span>
            </p>
            <p className="mt-0.5 text-[12px] text-muted">
              {c.policy.publisher}
              {c.policy.dateAsPrinted ? <> · bank’s date “{c.policy.dateAsPrinted}”</> : null} · read {eaDate(c.policy.readAt)}
            </p>
          </>
        ) : (
          <p className="text-[13px] leading-5 text-ink-soft">
            Not shown yet. Afronomics reads each policy rate from the bank’s own website, and the <Ext href={c.policy.source}>{c.policy.publisher}</Ext> page is{" "}
            {c.policy.reason}.
          </p>
        )}
      </Block>

      <Block
        title="Treasury bills"
        note={c.bill ? (sameBillDate ? `value date ${eaDate(billDates[0])}` : "value date per tenor") : undefined}
      >
        {c.bill ? (
          <>
            <table className="w-full text-[14px]">
              <tbody>
                {c.bill.rows.map((r) => (
                  <tr key={r.tenor} className="border-b border-rule/60 last:border-0">
                    <td className="py-1 text-ink-soft">{r.tenor}-day</td>
                    <td className="py-1 text-right">
                      <Ext href={r.source} className="font-mono font-semibold text-ink">
                        {eaPct(r.rate)}
                      </Ext>
                    </td>
                    {sameBillDate ? null : <td className="py-1 pl-2 text-right text-[12px] text-muted">{eaDate(r.date)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-1 text-[11px] leading-4 text-muted">
              {c.bill.market.rateLabel}, {c.bill.market.publisher}.{" "}
              <Link href={c.bill.market.href} className="text-forest underline underline-offset-2">
                Every auction
              </Link>
            </p>
          </>
        ) : (
          <p className="text-[13px] text-muted">No auction results on file.</p>
        )}
      </Block>

      <Block
        title="Latest bond sale"
        note={c.bond ? `${c.bond.dateKind === "settlement" ? "settlement date" : "auction date"} ${eaDate(c.bond.date)}` : undefined}
      >
        {c.bond ? (
          <>
            <table className="w-full text-[14px]">
              <thead>
                <tr className="text-left text-[11px] text-muted">
                  <th className="pb-1 font-normal">{c.slug === "kenya" ? "Issue" : "Tenor"}</th>
                  <th className="pb-1 text-right font-normal">Rate</th>
                  <th className="pb-1 text-right font-normal">Bid cover</th>
                </tr>
              </thead>
              <tbody>
                {c.bond.lines.map((l, i) => (
                  <tr key={`${l.label}-${i}`} className="border-t border-rule/60">
                    <td className="py-1 text-[13px] text-ink-soft">{l.label}</td>
                    <td className="py-1 text-right">
                      <Ext href={l.source || c.bond!.sourcePage} className="font-mono font-semibold text-ink">
                        {eaPct(l.rate)}
                      </Ext>
                    </td>
                    <td className="py-1 text-right font-mono text-[13px] text-ink-soft">{l.bidCover != null ? `${l.bidCover.toFixed(2)}×` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-1 text-[11px] leading-4 text-muted">
              {c.bond.kind ? `${c.bond.kind.charAt(0).toUpperCase()}${c.bond.kind.slice(1)}; ` : ""}
              {c.bond.dateKind === "settlement" ? "dated by the day the bonds settle, not the auction day. " : ""}
              {c.bond.publisher}.
              {c.bondHref ? (
                <>
                  {" "}
                  <Link href={c.bondHref} className="text-forest underline underline-offset-2">
                    All {c.country} bonds
                  </Link>
                </>
              ) : null}
            </p>
            {c.bond.newerOther ? (
              <p className="mt-1 text-[11px] leading-4 text-muted">
                Since then: a {c.bond.newerOther.kind} of {c.bond.newerOther.label} settling {eaDate(c.bond.newerOther.date)} at{" "}
                <Ext href={c.bond.newerOther.source}>{eaPct(c.bond.newerOther.rate)}</Ext> (refinances existing debt, not new borrowing).
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-[13px] leading-5 text-muted">Bond auction results for {c.country} are not in the Afronomics dataset yet.</p>
        )}
      </Block>

      <Block title="Eurobonds (US$)" note={c.eurobond ? `yields on ${eaDate(c.eurobond.date)}` : undefined}>
        {c.eurobond ? (
          <>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[13px] sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3">
              {c.eurobond.bonds.map((b) => (
                <li key={b.label} className="flex justify-between gap-2 whitespace-nowrap">
                  <span className="text-muted">{b.label}</span>{" "}
                  <Ext href={c.eurobond!.source} className="font-mono font-semibold text-ink">
                    {eaPct(b.yield)}
                  </Ext>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-[11px] leading-4 text-muted">
              Secondary-market yield by year of maturity, {c.eurobond.publisher} weekly bulletin.{" "}
              <Link href={`/markets/eurobonds#${c.slug}`} className="text-forest underline underline-offset-2">
                Trend
              </Link>
            </p>
          </>
        ) : (
          <p className="text-[13px] leading-5 text-muted">No daily Eurobond yields from a {c.country} government source yet.</p>
        )}
      </Block>
    </article>
  );
}

/** The answer in one table: each country's headline figures side by side, linked to the card below. */
export function Glance({ countries }: { countries: EaCountry[] }) {
  const bill = (c: EaCountry, t: number) => c.bill?.rows.find((r) => r.tenor === t);
  const cell = (v: { rate: number; source: string } | undefined) =>
    v ? (
      <Ext href={v.source} className="font-mono font-semibold text-ink">
        {eaPct(v.rate)}
      </Ext>
    ) : (
      <span className="text-muted">—</span>
    );
  return (
    <div className="overflow-x-auto rounded-2xl border border-rule bg-surface">
      <table className="w-full min-w-[20rem] text-[14px]">
        <thead>
          <tr className="text-left text-[11px] text-muted">
            <th className="px-3 py-2 font-semibold sm:px-4">At a glance</th>
            <th className="px-2 py-2 text-right font-semibold">Policy</th>
            <th className="px-2 py-2 text-right font-semibold">91-day</th>
            <th className="px-2 py-2 text-right font-semibold">364-day</th>
            <th className="hidden px-2 py-2 text-right font-semibold sm:table-cell">Longest bond sold</th>
            <th className="hidden px-3 py-2 text-right font-semibold sm:table-cell sm:px-4">Bills dated</th>
          </tr>
        </thead>
        <tbody>
          {countries.map((c) => {
            const long = c.bond?.lines.at(-1);
            const b364 = bill(c, 364);
            return (
              <tr key={c.slug} className="border-t border-rule">
                <td className="px-3 py-2 sm:px-4">
                  <a href={`#ea-card-${c.slug}`} className="font-medium text-ink hover:text-forest">
                    {c.country}
                  </a>
                </td>
                <td className="px-2 py-2 text-right">
                  {c.policy.read ? cell({ rate: c.policy.rate, source: c.policy.source }) : <span className="text-[12px] text-muted">not read</span>}
                </td>
                <td className="px-2 py-2 text-right">{cell(bill(c, 91))}</td>
                <td className="px-2 py-2 text-right">{cell(b364)}</td>
                <td className="hidden px-2 py-2 text-right sm:table-cell">
                  {long && c.bond ? (
                    <>
                      {cell({ rate: long.rate, source: long.source || c.bond.sourcePage })}
                      <span className="block text-[11px] text-muted">
                        {eaTenor(long.tenorYears)}, {c.bond.dateKind === "settlement" ? "settled " : ""}
                        {eaDate(c.bond.date)}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="hidden px-3 py-2 text-right text-[12px] text-ink-soft sm:table-cell sm:px-4">{b364 ? eaDate(b364.date) : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
