import Link from "next/link";
import { eaDate, eaPct, type EaSavings } from "@/lib/data/east-africa";
import { srcHref } from "./CountryRates";

/** Kenya: what the best-paying funds Afronomics reads are paying, beside the 91-day bill. Information, not advice. */
export function KenyaSavings({ s }: { s: EaSavings }) {
  const tax = `${Math.round(s.wht * 100)}%`;
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-8">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fund</th>
                <th className="text-right">Yield</th>
                <th className="text-right">After {tax} tax</th>
                <th>As of</th>
              </tr>
            </thead>
            <tbody>
              {s.funds.map((f) => (
                <tr key={f.name}>
                  <td>
                    <a href={srcHref(f.source)} target="_blank" rel="noopener noreferrer" className="font-medium text-ink hover:text-forest">
                      {f.name}
                    </a>
                    <span className="block text-[11px] text-muted">{f.manager}</span>
                  </td>
                  <td className="text-right font-mono font-semibold">{eaPct(f.gross)}</td>
                  <td className="text-right font-mono">{eaPct(f.net)}</td>
                  <td className="text-[12px] text-ink-soft">{f.basis ? <span className="block max-w-[14rem] leading-4">{f.basis}</span> : `read ${eaDate(f.readOn)}`}</td>
                </tr>
              ))}
              {s.bill91 ? (
                <tr className="bg-paper-2">
                  <td>
                    <a href={srcHref(s.bill91.source)} target="_blank" rel="noopener noreferrer" className="font-medium text-ink hover:text-forest">
                      91-day Treasury bill
                    </a>
                    <span className="block text-[11px] text-muted">Central Bank of Kenya, for comparison</span>
                  </td>
                  <td className="text-right font-mono font-semibold">{eaPct(s.bill91.rate)}</td>
                  <td className="text-right font-mono">{eaPct(s.bill91.net)}</td>
                  <td className="text-[12px] text-ink-soft">value date {eaDate(s.bill91.date)}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-[14px] leading-6 text-ink-soft lg:col-span-4">
        <p>
          Fund yields are the effective annual yield each manager publishes on its own site (or, where marked, its monthly fact sheet), read by Afronomics
          daily; the newest reading here is from {eaDate(s.readOn)}. {s.funds.length < s.fundsRead ? `These are the top ${s.funds.length} of the ${s.fundsRead} funds` : `These are all ${s.fundsRead} funds`} read
          cleanly on the latest run, ranked by yield after the {tax} withholding tax on interest.
        </p>
        <p className="mt-3">
          The bill rate is the weighted average at the latest auction. A fund yield moves daily and is not guaranteed; a bill’s rate is fixed until it
          matures in 91 days.
        </p>
        <p className="mt-3 font-medium text-ink">Information, not advice.</p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
          <Link href="/rates/kenya/money-market-funds" className="text-forest underline underline-offset-2">
            All funds and their history
          </Link>
          <Link href="/rates/kenya/best-money-market-fund" className="text-forest underline underline-offset-2">
            This month’s ranking
          </Link>
          <Link href="/rates/kenya" className="text-forest underline underline-offset-2">
            Every Kenya savings rate
          </Link>
        </p>
      </div>
    </div>
  );
}
