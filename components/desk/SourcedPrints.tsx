import Link from "next/link";
import { SectionHead } from "@/components/ui/SectionHead";
import { formatPrint, loadDeskPrints, sortPrints, type IndicatorSlug, type SourcedPrint } from "@/lib/agents/worldbank";
import { getIndicator } from "@/lib/demo/indicators";

const labels: Record<IndicatorSlug, string> = {
  inflation: "Inflation",
  gdp: "GDP",
  fdi: "FDI",
  "public-debt": "Public debt",
  population: "Population",
  unemployment: "Unemployment",
  "gdp-per-capita": "GDP per capita",
  exports: "Exports",
  "current-account": "Current account",
  electricity: "Electricity access",
};

function deskFigure(value: number, unit: string) {
  const percent = unit.includes("%");
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: percent ? 2 : Math.abs(value) >= 100 ? 0 : 2,
  }).format(value);
}

function printHref(print: SourcedPrint) {
  if (getIndicator(print.indicatorSlug)) {
    return { href: `/indicators/${print.indicatorSlug}/${print.countrySlug}`, external: false };
  }
  return { href: print.sourceUrl, external: true };
}

export async function SourcedPrints({ compact = false }: { compact?: boolean }) {
  const prints = sortPrints(await loadDeskPrints());
  const kenya = prints.filter((print) => print.iso === "KE" && getIndicator(print.indicatorSlug));
  const kenyaCatalogue = prints.filter((print) => print.iso === "KE" && !getIndicator(print.indicatorSlug));
  const tablePrints = compact ? kenyaCatalogue : prints;

  return (
    <>
      <SectionHead kicker="Sourced" title="Prints coming in" href="/observations" demo={false} />
      <p className="mt-3 max-w-3xl text-sm text-ink-soft">
        World Bank Open Data annual series for Kenya, Nigeria, South Africa, Egypt, Ghana, Rwanda, Tanzania and Uganda.
        Inflation, GDP, FDI and public debt sit with population, unemployment, GDP per capita, exports, the current account and electricity access.
        A cell appears only when that response includes a finite value and a year.
      </p>
      {prints.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">This hour did not parse a print. Those cells stay blank.</p>
      ) : (
        <>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            {prints.length} values parsed · Kenya first
          </p>
          {kenya.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {kenya.map((print) => (
                <Link
                  key={`${print.indicatorSlug}-${print.iso}`}
                  href={printHref(print).href}
                  className="bg-paper-2 px-5 py-5 hover:bg-paper-3"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                    {labels[print.indicatorSlug]} · {print.year}
                  </p>
                  <p className="mt-2 font-serif text-3xl tracking-[-0.03em] text-ink">{deskFigure(print.value, print.unit)}</p>
                  <p className="mt-1 text-xs text-ink-soft">{print.unit}</p>
                  <p className="mt-2 font-mono text-[10px] text-muted">{print.seriesCode}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">This hour did not parse a Kenya value. Those cells stay blank.</p>
          )}
          {tablePrints.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Desk</th>
                  <th>Series</th>
                  <th>Year</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {tablePrints.map((print) => (
                  <tr key={`${print.indicatorSlug}-${print.iso}`}>
                    <td>
                      <Link href={`/countries/${print.countrySlug}`} className="hover:text-forest">
                        {print.countryName}
                      </Link>
                    </td>
                    <td>
                      {printHref(print).external ? (
                        <a href={printHref(print).href} className="hover:text-forest" target="_blank" rel="noopener noreferrer">
                          {labels[print.indicatorSlug]}
                        </a>
                      ) : (
                        <Link href={printHref(print).href} className="hover:text-forest">
                          {labels[print.indicatorSlug]}
                        </Link>
                      )}
                    </td>
                    <td className="font-mono text-xs">{print.year}</td>
                    <td>
                      {compact ? deskFigure(print.value, print.unit) : formatPrint(print.value)}{" "}
                      <span className="text-ink-soft">{print.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          ) : null}
          {compact ? (
            <p className="mt-4 text-sm text-ink-soft">
              {prints.length} values across the featured desks.{" "}
              <Link href="/observations" className="text-forest underline underline-offset-2">
                Open the full file
              </Link>
            </p>
          ) : null}
        </>
      )}
    </>
  );
}
