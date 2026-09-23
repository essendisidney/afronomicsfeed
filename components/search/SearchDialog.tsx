"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { articleHref, categoryLabel, formatDate } from "@/lib/format";
import type { ArticleIndexItem } from "@/lib/types";

export function SearchDialog({
  articles,
  open,
  onClose,
}: {
  articles: ArticleIndexItem[];
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

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles.slice(0, 6);
    return articles.filter((article) => {
      const haystack = [article.title, article.summary, article.teaser.join(" "), article.labels.join(" ")]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [articles, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 py-16"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="w-full max-w-xl border border-rule bg-paper shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-rule px-4 py-3">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Search the graph
          </p>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft"
          >
            Close
          </button>
        </div>
        <div className="px-4 py-3">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Kenya, MPC, climate, Safaricom…"
            className="w-full border border-rule bg-paper-2 px-3 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <ul className="max-h-80 overflow-auto border-t border-rule">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-sm text-muted">No matching briefs.</li>
          ) : (
            results.map((article) => (
              <li key={`${article.category}-${article.slug}`} className="border-b border-rule last:border-0">
                <Link
                  href={articleHref(article.category, article.slug)}
                  className="block px-4 py-3 hover:bg-paper-2"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">
                    {categoryLabel(article.category)} · {formatDate(article.date)}
                  </p>
                  <p className="mt-1 font-serif text-lg text-ink">{article.title}</p>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
