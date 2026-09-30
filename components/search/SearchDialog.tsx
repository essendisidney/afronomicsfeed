"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { searchIndex, type SearchHit } from "@/lib/search-core";

export function SearchDialog({
  index,
  open,
  onClose,
}: {
  index: SearchHit[];
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => searchIndex(query, index, 12), [index, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 py-16"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      onClick={onClose}
    >
      <div className="w-full max-w-xl border border-rule bg-paper shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-rule px-4 py-3">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Search Afronomics</p>
          <button type="button" onClick={onClose} className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
            Close
          </button>
        </div>
        <div className="px-4 py-3">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Kenya, inflation, FDI, climate…"
            className="w-full border border-rule bg-paper-2 px-3 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <ul className="max-h-96 overflow-auto border-t border-rule">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-sm text-muted">Nothing matches. Try a country or an indicator.</li>
          ) : (
            results.map((hit) => (
              <li key={`${hit.href}-${hit.title}`} className="border-b border-rule last:border-0">
                <Link href={hit.href} onClick={onClose} className="block px-4 py-3 hover:bg-paper-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">{hit.kicker}</p>
                  <p className="mt-1 font-serif text-lg text-ink">{hit.title}</p>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
