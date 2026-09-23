"use client";

import Link from "next/link";
import { useState } from "react";
import { resolveEntityName } from "@/lib/ingestion/entity-resolution";

const samples = ["Kenya", "CBK", "Safaricom", "Unknown Fund X"];

export function ResolvePanel() {
  const [query, setQuery] = useState("Kenya");
  const hit = resolveEntityName(query);

  return (
    <div className="max-w-xl">
      <label className="block text-sm">
        Entity name
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-1 w-full border border-rule bg-paper px-3 py-2"
          placeholder="Try CBK or an unknown name"
        />
      </label>
      <ul className="mt-3 flex flex-wrap gap-2 text-sm">
        {samples.map((sample) => (
          <li key={sample}>
            <button
              type="button"
              onClick={() => setQuery(sample)}
              className="border border-rule px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft hover:border-gold"
            >
              {sample}
            </button>
          </li>
        ))}
      </ul>
      <dl className="mt-6 space-y-3 border border-rule px-4 py-4 text-sm">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Confidence</dt>
          <dd className="mt-1 font-serif text-xl">{hit.confidence}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Slug candidate</dt>
          <dd className="mt-1 font-mono text-sm">{hit.slug || "—"}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Node</dt>
          <dd className="mt-1">
            {hit.node ? (
              hit.node.href ? (
                <Link href={hit.node.href} className="text-forest underline underline-offset-2">
                  {hit.node.label} · {hit.node.kind}
                </Link>
              ) : (
                `${hit.node.label} · ${hit.node.kind}`
              )
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Note</dt>
          <dd className="mt-1 text-ink-soft">{hit.note}</dd>
        </div>
      </dl>
    </div>
  );
}
