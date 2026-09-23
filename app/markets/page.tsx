import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { DemoMark } from "@/components/ui/DemoMark";
import { Provenance } from "@/components/ui/Provenance";
import { marketBoards } from "@/lib/demo/markets";

export const metadata: Metadata = {
  title: "Markets",
  description: "African currencies, exchanges, commodities and rates — sourced prints only, never a live fake tape.",
};

export default function MarketsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Markets" }]}
      kicker="Markets"
      title="African market prints, delayed and sourced"
      lede="Currencies, exchanges, bonds, commodities and policy rates. Afronomics does not redistribute a live tape. Official doors stay one click away."
    >
      {marketBoards.map((board) => (
        <section key={board.name} className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-2xl">{board.name}</h2>
            <DemoMark />
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Demo value</th>
                  <th>Official door</th>
                </tr>
              </thead>
              <tbody>
                {board.items.map((row) => (
                  <tr key={row.label}>
                    <td className="font-mono text-xs">
                      <Link href={`/markets/currencies/${row.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="hover:text-forest">
                        {row.label}
                      </Link>
                    </td>
                    <td>{row.value}</td>
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
          <Provenance source="Demonstration layout only" updated="Not a live feed" methodology="Awaiting licensed prints" />
        </section>
      ))}
    </LayerPage>
  );
}
