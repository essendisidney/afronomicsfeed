import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { compareAxes, featuredCompareRows } from "@/lib/demo/compare";

export const metadata: Metadata = {
  title: "Compare",
  description: "Featured African desks side by side. Observation cells stay blank until a cited print exists.",
};

export default function ComparePage() {
  const rows = featuredCompareRows();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Compare" }]}
      kicker="Compare"
      title="Featured desks, empty cells"
      lede="ISO, currency and graph shape are editorial. Policy rate, FX and equity prints stay as em dashes until each has a citation."
    >
      <p className="text-sm">
        <Link href="/countries" className="text-forest underline underline-offset-2">
          Countries
        </Link>
        {" · "}
        <Link href="/graph" className="text-forest underline underline-offset-2">
          Graph
        </Link>
        {" · "}
        <Link href="/exports" className="text-forest underline underline-offset-2">
          Exports
        </Link>
        {" · "}
        <Link href="/sources" className="text-forest underline underline-offset-2">
          Sources
        </Link>
      </p>

      <div className="mt-10 overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Desk</th>
              <th>ISO</th>
              <th>Currency</th>
              <th>Graph</th>
              {compareAxes.map((axis) => (
                <th key={axis.key}>{axis.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.slug}>
                <td>
                  <Link href={`/countries/${row.slug}`} className="text-forest underline underline-offset-2">
                    {row.name}
                  </Link>
                </td>
                <td>{row.iso}</td>
                <td>{row.currency}</td>
                <td>
                  <Link href={row.desk} className="text-forest underline underline-offset-2">
                    {row.edges}e · {row.nodes}n
                  </Link>
                </td>
                <td>{row.policyRate}</td>
                <td>{row.fx}</td>
                <td>{row.exchange}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 max-w-2xl text-sm text-ink-soft">
        A ranking or scoreboard requires sourced series. This matrix refuses invented prints.
      </p>

      <Provenance source="Featured desk matrix" methodology="Empty cells are intentional. No modelled headline figure." />
    </LayerPage>
  );
}
