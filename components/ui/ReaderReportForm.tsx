"use client";

import { useState, type FormEvent } from "react";
import { bounds, COUNTRIES, country as findCountry, ITEMS, item as findItem } from "@/lib/reader-reports-core";

/**
 * "What did you pay?" — a price or a rate in a few taps, or a story for the editor. Figures are published only as
 * the middle of at least three reports; stories never without checking.
 */
const field = "mt-1 w-full rounded-xl border border-rule bg-surface px-3 py-2.5 text-[15px] text-ink outline-none focus:border-accent";
const label = "text-[12px] font-medium text-muted";
const groups = [...new Set(ITEMS.map((i) => i.group))];

export function ReaderReportForm({ defaultCountry = "KE" }: { defaultCountry?: string }) {
  const [mode, setMode] = useState<"figure" | "story">("figure");
  const [countryCode, setCountry] = useState(defaultCountry);
  const [itemId, setItem] = useState(ITEMS[0].id);
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const c = findCountry(countryCode)!;
  const it = findItem(itemId)!;
  const [lo, hi] = bounds(it, c);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setBusy(true);
    setState(null);
    const r = await fetch("/api/reader-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, kind: mode === "story" ? "story" : it.kind }),
    }).catch(() => null);
    const body = r ? ((await r.json().catch(() => null)) as { ok: boolean; message?: string; reason?: string } | null) : null;
    setBusy(false);
    setState(body?.ok ? { ok: true, text: body.message ?? "Thank you." } : { ok: false, text: body?.reason ?? "That didn’t go through. Please try again." });
    if (body?.ok) {
      const keep = { country: countryCode, item: itemId };
      form.reset();
      setCountry(keep.country);
      setItem(keep.item);
    }
  }

  return (
    <div className="rounded-2xl border border-rule bg-surface px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">Tell us what you paid</h2>
        <p className="text-[12px] text-muted">Anonymous · takes 20 seconds</p>
      </div>
      <div className="mt-3 flex gap-2">
        {(["figure", "story"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setState(null);
            }}
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold ${mode === m ? "bg-ink text-paper" : "border border-rule text-ink-soft hover:border-accent"}`}
          >
            {m === "figure" ? "A price or rate" : "A story for the editor"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Country</span>
          <select name="country" value={countryCode} onChange={(e) => setCountry(e.target.value)} className={field}>
            {COUNTRIES.map((x) => (
              <option key={x.code} value={x.code}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={label}>Town or area (optional, never published)</span>
          <input name="place" maxLength={80} placeholder="e.g. Kisumu, Kawangware" className={field} />
        </label>
        {mode === "figure" ? (
          <>
            <label className="block">
              <span className={label}>What</span>
              <select name="item" value={itemId} onChange={(e) => setItem(e.target.value)} className={field}>
                {groups.map((g) => (
                  <optgroup key={g} label={g}>
                    {ITEMS.filter((i) => i.group === g).map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={label}>{it.kind === "rate" ? `Rate, ${it.unit}` : `What you paid, ${c.currency}`}</span>
              <input
                required
                name="amount"
                inputMode="decimal"
                placeholder={it.kind === "rate" ? "e.g. 7.5" : `e.g. ${Math.round(Math.sqrt(lo * hi)).toLocaleString("en-GB")}`}
                className={field}
              />
            </label>
          </>
        ) : (
          <>
            <label className="block sm:col-span-2">
              <span className={label}>What is happening where you are? A price, a fee, a business problem, something not working</span>
              <textarea required name="note" minLength={20} maxLength={2000} rows={4} className={field} />
            </label>
            <label className="block sm:col-span-2">
              <span className={label}>Phone or email, if you are happy for the editor to follow up (optional, never published)</span>
              <input name="contact" maxLength={200} className={field} />
            </label>
          </>
        )}
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button type="submit" disabled={busy} className="rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-paper hover:bg-forest disabled:opacity-60">
            {busy ? "Sending…" : "Send"}
          </button>
          {state ? (
            <p className={`text-[13px] ${state.ok ? "text-up" : "text-down"}`} aria-live="polite">
              {state.text}
            </p>
          ) : null}
        </div>
      </form>
      <p className="mt-4 text-[12px] leading-5 text-muted">
        {mode === "figure"
          ? "We publish only the middle of at least three reports from different readers in the last 30 days — never one person’s figure, town or address. Please don’t name a shop, bank or person."
          : "Stories are read by the editor and are never published as sent: anything we report is checked first. Your contact details are never published or shared."}
      </p>
    </div>
  );
}
