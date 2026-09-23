"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { countries, type CountryProfile } from "@/lib/demo/countries";

const regions = ["All", "North Africa", "West Africa", "East Africa", "Central Africa", "Southern Africa"] as const;

export function CountryIndex() {
  const [region, setRegion] = useState<(typeof regions)[number]>("All");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    return countries.filter((country) => {
      const regionOk = region === "All" || country.region === region;
      const hay = `${country.name} ${country.iso} ${country.currency} ${country.sectors.join(" ")}`.toLowerCase();
      return regionOk && hay.includes(q.trim().toLowerCase());
    });
  }, [region, q]);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Region</span>
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value as (typeof regions)[number])}
            className="mt-1 block border border-rule bg-paper px-2 py-1.5 text-sm"
          >
            {regions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="block min-w-[12rem] flex-1 text-sm">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Find a country</span>
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Kenya, KES, East Africa…"
            className="mt-1 block w-full border border-rule bg-paper px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        {rows.length} terminals · indicator cells empty until sourced
      </p>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((country) => (
          <CountryCard key={country.slug} country={country} />
        ))}
      </ul>
    </div>
  );
}

function CountryCard({ country }: { country: CountryProfile }) {
  return (
    <li>
      <Link href={`/countries/${country.slug}`} className="block border border-rule px-4 py-3 hover:border-gold">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">
          {country.iso} · {country.currency}
        </p>
        <p className="mt-1 font-serif text-xl">{country.name}</p>
        <p className="mt-1 text-xs text-muted">{country.region} · 10 series files</p>
      </Link>
    </li>
  );
}
