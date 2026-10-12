"use client";

import { useMemo, useState } from "react";
import type { Lender } from "@/lib/data/loan-apps";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

/** Search the CBK's list of licensed digital lenders by company name or email domain. Runs in the browser. */
export function LenderSearch({ lenders, updated }: { lenders: (Lender & { domain: string })[]; updated: string }) {
  const [q, setQ] = useState("");
  const hits = useMemo(() => {
    const n = norm(q);
    if (n.length < 2) return [];
    return lenders.filter((l) => norm(l.name).includes(n) || (l.domain && norm(l.domain).includes(n))).slice(0, 25);
  }, [q, lenders]);
  const searched = norm(q).length >= 2;
  return (
    <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
      <label className="text-[13px] text-ink-soft">
        App or company name
        <input
          className="mt-1 w-full rounded-lg border border-rule bg-surface px-3 py-2 text-[16px] text-ink"
          placeholder="e.g. Zenka, Watu, Tala"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>
      {searched ? (
        hits.length ? (
          <ul className="mt-4 divide-y divide-rule">
            {hits.map((l) => (
              <li key={l.no} className="py-3">
                <p className="font-semibold text-ink">
                  <span className="mr-2 rounded-full bg-forest/10 px-2 py-0.5 text-[12px] font-semibold text-forest">Licensed</span>
                  {l.name}
                </p>
                <p className="mt-1 text-[13px] text-ink-soft">
                  {l.licensed ? `Licensed ${new Date(`${l.licensed}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}` : "Date not stated"}
                  {l.email ? ` · ${l.email}` : ""}
                  {l.phone ? ` · ${l.phone}` : ""}
                </p>
                {l.address ? <p className="text-[12px] text-muted">{l.address}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border-l-4 border-accent bg-accent/5 px-4 py-3 text-[14px] leading-6 text-ink-soft">
            <strong className="text-ink">Not on the CBK’s list</strong> as of {updated}. The list names companies, not apps, so check the company behind the app
            (its terms, or “developer” on the app store page) and search for that. A digital lender that is not on the list is not licensed by the Central Bank
            to lend.
          </p>
        )
      ) : (
        <p className="mt-3 text-[12px] text-muted">{lenders.length} licensed lenders. Type at least two letters.</p>
      )}
    </div>
  );
}
