import { SectionTitle } from "@/components/data/parts";
import { dailyYieldName, loadCmaFunds } from "@/lib/data/cma-mmf";

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const bn = (n: number) => (n >= 1e9 ? `KES ${(n / 1e9).toFixed(1)}bn` : `KES ${(n / 1e6).toFixed(n >= 1e8 ? 0 : 1)}m`);

/** Every licensed money market fund by size, from the CMA's quarterly report, with the funds whose yield we read daily marked. */
export function FundSizes({ readDaily }: { readDaily: Set<string> }) {
  const f = loadCmaFunds();
  if (!f?.rows.length) return null;
  const kes = f.rows.filter((r) => r.currency === "KES");
  const usd = f.rows.filter((r) => r.currency === "USD");
  const top2 = f.rows.slice(0, 2).reduce((n, r) => n + r.share_pct, 0);
  return (
    <section className="mt-14" id="every-fund">
      <SectionTitle
        kicker={`Capital Markets Authority · ${dateFmt.format(new Date(f.as_of))}`}
        title={`Every money market fund in Kenya: ${f.rows.length} funds, ${bn(f.total_aum_kes)}`}
        note={`Size of each fund as the regulator reports it (${kes.length} shilling funds, ${usd.length} dollar funds, all shown in shillings). The two largest hold ${top2.toFixed(0)}% of the money. Size is not return: a bigger fund is not a better-paying one. A yield is shown above only for funds whose manager publishes it on their own page.`}
      />
      <div className="mt-4 max-h-[36rem] overflow-auto rounded-xl border border-rule">
        <table className="data-table">
          <thead className="sticky top-0 bg-paper">
            <tr>
              <th>#</th>
              <th>Fund</th>
              <th>Currency</th>
              <th className="text-right">Size</th>
              <th className="text-right">Share</th>
              <th>Daily yield</th>
            </tr>
          </thead>
          <tbody>
            {f.rows.map((r) => {
              const daily = dailyYieldName(r.fund);
              return (
                <tr key={r.rank}>
                  <td className="text-xs text-muted">{r.rank}</td>
                  <td>
                    <span className="font-medium">{r.fund}</span>
                    <span className="block text-[11px] text-muted">{r.scheme}</span>
                  </td>
                  <td className="text-xs">{r.currency}</td>
                  <td className="whitespace-nowrap text-right">{bn(r.aum_kes)}</td>
                  <td className="text-right text-xs">{r.share_pct < 0.1 ? "<0.1" : r.share_pct.toFixed(1)}%</td>
                  <td className="text-xs">{daily && readDaily.has(daily) ? <a href="#league" className="text-forest underline underline-offset-2">in the table above</a> : <span className="text-muted">not read yet</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 max-w-3xl text-xs leading-5 text-muted">
        Source:{" "}
        <a href={f.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          {f.publisher}, {f.report}
        </a>
        , table &ldquo;Money Market Funds&rdquo;. Updated when the CMA publishes the next quarter.{" "}
        <a href="/api/data/kenya-mmf-sizes" download className="underline underline-offset-2">
          Download as CSV
        </a>
        . Fund managers: publish your daily yield as text on your fund page and it will be read here every weekday.
      </p>
    </section>
  );
}
