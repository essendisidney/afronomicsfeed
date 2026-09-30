"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { searchIndex, type SearchHit } from "@/lib/search-core";

export function SearchPageClient({ index }: { index: SearchHit[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchIndex(query, index, 40), [index, query]);

  return (
    <div>
      <label className="block">
        <span className="font-medium text-[12px] text-muted">Search</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Kenya, inflation, FDI, remittances, electricity…"
          className="mt-2 w-full border border-rule bg-paper-2 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40"
        />
      </label>
      <p className="mt-3 font-medium text-[12px] text-muted">
        {results.length} results
      </p>
      <ul className="mt-6 divide-y divide-rule border-t border-rule">
        {results.length === 0 ? (
          <li className="py-6 text-sm text-muted">Nothing matches. Try a country or an indicator.</li>
        ) : (
          results.map((hit) => (
            <li key={`${hit.href}-${hit.title}`}>
              <Link href={hit.href} className="block py-4 hover:bg-paper-2">
                <p className="font-medium text-[12px] text-gold">{hit.kicker}</p>
                <p className="mt-1 font-serif text-xl">{hit.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{hit.summary}</p>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
