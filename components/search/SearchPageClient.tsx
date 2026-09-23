"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SearchHit } from "@/lib/search";

export function SearchPageClient({ index }: { index: SearchHit[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.slice(0, 12);
    return index.filter((hit) => `${hit.title} ${hit.kicker} ${hit.summary}`.toLowerCase().includes(q)).slice(0, 40);
  }, [index, query]);

  return (
    <div>
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Search the graph</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Kenya inflation, climate capital, Safaricom, Northern Corridor…"
          className="mt-2 w-full border border-rule bg-paper-2 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40"
        />
      </label>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        {results.length} files · free search is limited to published desks and scaffolds
      </p>
      <ul className="mt-6 divide-y divide-rule border-t border-rule">
        {results.length === 0 ? (
          <li className="py-6 text-sm text-muted">Nothing matches. Try a country, corridor, or Kenya desk term.</li>
        ) : (
          results.map((hit) => (
            <li key={`${hit.href}-${hit.title}`}>
              <Link href={hit.href} className="block py-4 hover:bg-paper-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">{hit.kicker}</p>
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
