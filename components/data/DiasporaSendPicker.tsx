"use client";

import { useState } from "react";
import { RemitFound } from "@/components/data/RemitFound";
import type { FxRef, RemitCorridor, RemitSurvey } from "@/lib/found";

/** One sending country into Kenya, from the World Bank's survey (prepared on the server in app/diaspora/page.tsx). */
export type SendRow = {
  src: string;
  name: string;
  services: number;
  avgPct: number;
  cheapest: { firm: string; type: string; pct: number };
};

const usd = (pct: number) => `$${((200 * pct) / 100).toFixed(2)}`;
const pct = (n: number) => `${n.toFixed(2)}%`;

/**
 * The Send section's country picker: one button per sending country in our data, and the cheapest and average cost of
 * sending $200 to Kenya from the one chosen. Every country's figures are in the server HTML; the picker only shows one,
 * so nothing moves when it changes (the card keeps the same lines whatever is chosen).
 */
export function DiasporaSendPicker({
  rows,
  period,
  corridors = [],
  survey = null,
  fx = null,
}: {
  rows: SendRow[];
  period: string;
  /** The same corridors with every service surveyed, for the "money found" line (lib/found.ts). */
  corridors?: RemitCorridor[];
  survey?: RemitSurvey | null;
  fx?: FxRef;
}) {
  const [src, setSrc] = useState(rows[0]?.src ?? "");
  const row = rows.find((r) => r.src === src) ?? rows[0];
  if (!row) return null;
  const saved = (200 * (row.avgPct - row.cheapest.pct)) / 100;
  return (
    <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
      <p id="send-from" className="text-[13px] font-medium text-ink-soft">
        Where do you send from?
      </p>
      <div role="group" aria-labelledby="send-from" className="mt-2 flex flex-wrap gap-2">
        {rows.map((r) => (
          <button
            key={r.src}
            type="button"
            aria-pressed={r.src === row.src}
            onClick={() => setSrc(r.src)}
            className={`inline-flex min-h-11 items-center rounded-full border px-4 text-[14px] font-medium ${
              r.src === row.src ? "border-ink bg-ink text-paper" : "border-rule bg-paper text-ink hover:border-accent"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-2" aria-live="polite">
        <div className="bg-surface px-4 py-4">
          <p className="text-[13px] text-muted">Cheapest service surveyed</p>
          <p data-num className="af-figure tabular mt-1 font-serif text-3xl text-ink">
            {usd(row.cheapest.pct)}
          </p>
          <p className="mt-1 text-[13px] leading-5 text-ink-soft">
            {row.cheapest.firm} · {pct(row.cheapest.pct)} of $200
            <span className="block text-[12px] text-muted">{row.cheapest.type}</span>
          </p>
        </div>
        <div className="bg-surface px-4 py-4">
          <p className="text-[13px] text-muted">Average of {row.services} services</p>
          <p data-num className="af-figure tabular mt-1 font-serif text-3xl text-ink">
            {usd(row.avgPct)}
          </p>
          <p className="mt-1 text-[13px] leading-5 text-ink-soft">
            {pct(row.avgPct)} of $200
            <span className="block text-[12px] text-muted">{saved > 0 ? `The cheapest saves ${`$${saved.toFixed(2)}`} on each $200` : " "}</span>
          </p>
        </div>
      </div>
      <p className="mt-3 text-[12px] leading-5 text-muted">
        Sending the equivalent of $200 from {row.name} to Kenya: fee plus exchange-rate margin. World Bank, Remittance Prices Worldwide, survey of {period}.
      </p>
      {survey && corridors.some((c) => c.src === row.src) ? (
        <div className="mt-4">
          <RemitFound key={row.src} corridors={corridors} survey={survey} fx={fx} corridor={`${row.src}-KEN`} />
        </div>
      ) : null}
    </div>
  );
}
