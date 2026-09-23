"use client";

import { useMemo, useState } from "react";
import { DemoMark } from "@/components/ui/DemoMark";
import { capitalRows, capitalTypes } from "@/lib/demo/capital";
import { featuredCountrySlugs } from "@/lib/demo/countries";

export function CapitalExplorer() {
  const [country, setCountry] = useState("all");
  const [type, setType] = useState("all");

  const rows = useMemo(
    () =>
      capitalRows.filter((row) => {
        const countryOk = country === "all" || row.country.toLowerCase().includes(country.replace("-", " "));
        const typeOk = type === "all" || row.type === type;
        return countryOk && typeOk;
      }),
    [country, type],
  );

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 border-b border-rule pb-4">
        <label className="block text-sm">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Country</span>
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="mt-1 block border border-rule bg-paper px-2 py-1.5 text-sm"
          >
            <option value="all">All (demo rows)</option>
            {featuredCountrySlugs.map((slug) => (
              <option key={slug} value={slug}>
                {slug}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Capital type</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="mt-1 block border border-rule bg-paper px-2 py-1.5 text-sm"
          >
            <option value="all">All types</option>
            {capitalTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <DemoMark />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Investor</th>
              <th>Target</th>
              <th>Where</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Stage</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted">
                  No demo rows match these filters. Production tickets are not loaded.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.investor}</td>
                  <td>
                    {row.target}
                    <p className="text-[11px] text-muted">{row.sector}</p>
                  </td>
                  <td>{row.country}</td>
                  <td>{row.type}</td>
                  <td>
                    {row.amount} {row.currency}
                  </td>
                  <td>{row.stage}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
