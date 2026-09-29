import type { Metadata } from "next";
import Link from "next/link";
import { CurrencyConverter } from "@/components/markets/CurrencyConverter";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { marketBoards } from "@/lib/demo/markets";
import { fxForLabel, loadFxQuote } from "@/lib/fx/reference";

export const metadata: Metadata = {
  title: "Markets",
  description: "Convert African and major currencies with a daily mid-market reference. Exchange and commodity boards stay labelled until a licensed print exists.",
};

export const revalidate = 3600;

export default async function MarketsPage() {
  const quote = await loadFxQuote();
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Markets" }]}
      kicker="Markets"
      title="African market prints, delayed and sourced"
      lede="Currency pairs use the daily reference. Exchange indices and commodities stay blank until a licensed print exists."
    >
      {quote ? (
        <CurrencyConverter quote={quote} />
      ) : (
        <p className="border border-rule px-5 py-6 text-sm text-ink-soft">
          This hour did not return a reference rate. Conversion stays closed.
        </p>
      )}
      {marketBoards.map((board) => {
        const sourced = board.name === "Currencies";
        return (
          <section key={board.name} className="mb-10">
            <h2 className="mb-3 font-serif text-2xl">{board.name}</h2>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Instrument</th>
                    <th>{sourced ? "Reference" : "Print"}</th>
                    <th>Official door</th>
                  </tr>
                </thead>
                <tbody>
                  {board.items.map((row) => (
                    <tr key={row.label}>
                      <td className="font-mono text-xs">
                        <Link href={row.fileHref} className="hover:text-forest">
                          {row.label}
                        </Link>
                      </td>
                      <td>{sourced ? (fxForLabel(row.label, quote) ?? "—") : "—"}</td>
                      <td>
                        <a href={row.href} target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-2">
                          Source
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Provenance
              source={sourced ? "ExchangeRate-API daily reference" : "No licensed print"}
              updated={sourced && quote ? quote.updated : "Not stored"}
              methodology={sourced ? "Units of local currency per one US dollar. Not a central-bank dealing rate." : "The cell stays blank until a cited print exists."}
            />
          </section>
        );
      })}
    </LayerPage>
  );
}
