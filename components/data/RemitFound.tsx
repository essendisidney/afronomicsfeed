"use client";

import { useState } from "react";
import { FoundLine } from "@/components/data/FoundLine";
import { foundRemit, foundSlug, type FxRef, type RemitCorridor, type RemitSurvey } from "@/lib/found";

const key = (c: RemitCorridor) => `${c.src}-${c.dst}`;

/**
 * Sending money home (/rates/remittances, and /diaspora under the country picker): the reader picks the service they
 * use from the World Bank's list for the corridor and how many times a year they send USD 200; the line sets it against
 * the cheapest service surveyed on the same corridor in the same survey (lib/found.ts foundRemit), in dollars, with the
 * shilling equivalent at the reference rate the site shows. With `corridor` set, the corridor is chosen elsewhere.
 */
export function RemitFound({ corridors, survey, fx, corridor }: { corridors: RemitCorridor[]; survey: RemitSurvey; fx: FxRef; corridor?: string }) {
  const sorted = [...corridors].sort((a, b) => a.dstName.localeCompare(b.dstName) || a.srcName.localeCompare(b.srcName));
  const [picked, setPicked] = useState("");
  const [firm, setFirm] = useState("");
  const [sends, setSends] = useState("12");
  const k = corridor ?? picked;
  const c = corridors.find((x) => key(x) === k) ?? null;
  const n = Math.round(Number(sends.replace(/[^\d]/g, "")));
  const services = c ? [...c.firms].sort((a, b) => a.firm.localeCompare(b.firm)) : [];
  const chosen = c && services.some((f) => f.firm === firm) ? firm : "";
  const result = c && chosen ? foundRemit({ corridor: c, firm: chosen, sends: n, survey, fx }) : null;
  const field = "mt-1 w-full rounded-xl border border-rule bg-surface px-3 py-2.5 text-[15px] text-ink outline-none focus:border-accent";
  return (
    <section id={corridor ? undefined : "found"} aria-labelledby={corridor ? "found-remit-h" : "found-h"} className="scroll-mt-24 rounded-2xl border border-rule bg-surface px-5 py-5 sm:px-6">
      <h2 id={corridor ? "found-remit-h" : "found-h"} className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
        The service you use, against the cheapest surveyed
      </h2>
      <div className={`mt-3 grid gap-3 ${corridor ? "sm:grid-cols-[2fr_1fr]" : "sm:grid-cols-[2fr_2fr_1fr]"}`}>
        {corridor ? null : (
          <label className="block min-w-0 text-[12px] font-medium text-muted">
            From and to
            <select data-found-corridor value={picked} onChange={(e) => setPicked(e.target.value)} className={field}>
              <option value="">Pick a corridor</option>
              {sorted.map((x) => (
                <option key={key(x)} value={key(x)}>
                  {x.srcName} to {x.dstName}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block min-w-0 text-[12px] font-medium text-muted">
          The service you use
          <select data-found-firm value={chosen} onChange={(e) => setFirm(e.target.value)} disabled={!c} className={field}>
            <option value="">{c ? "Pick a service" : "Pick a corridor first"}</option>
            {services.map((f) => (
              <option key={f.firm} value={f.firm}>
                {f.firm}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[12px] font-medium text-muted">
          Times you send USD 200 a year
          <input data-found-times inputMode="numeric" value={sends} onChange={(e) => setSends(e.target.value)} className={field} />
        </label>
      </div>
      {result && result.status !== "none" && c ? (
        <FoundLine result={result} payload={{ tool: "remit", src: c.src, dst: c.dst, firm: chosen, sends: n }} figures={{ src: c.src, firm: foundSlug(chosen), sends: n }} />
      ) : (
        <p className="mt-3 text-[13px] text-muted">
          Only the services the World Bank surveyed on the corridor are listed ({survey.period}). If yours is not there, we hold no price for it.
        </p>
      )}
    </section>
  );
}
