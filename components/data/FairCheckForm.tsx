"use client";

import { useState } from "react";
import { COUNTRIES, TOWNS, categories, categoryLabel, townLabel, type FairCell, type FairKind } from "@/lib/fair-core";

type Result = { ok: true; replaced: boolean; amount: number; town: FairCell | null; country: FairCell | null; min: number } | { ok: false; reason: string };

const money = (code: string, n: number) => `${COUNTRIES.find((c) => c.code === code)?.symbol ?? ""}${Math.round(n).toLocaleString("en-US")}`;

/** Report a salary or rent, then see how it compares with the middle of everyone else's in the same town and job or home. */
export function FairCheckForm({ kind }: { kind: FairKind }) {
  const [country, setCountry] = useState("KE");
  const [town, setTown] = useState(TOWNS.KE[0].id);
  const [category, setCategory] = useState(categories(kind)[0].id);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const field = "mt-1 w-full rounded-lg border border-rule bg-surface px-3 py-2 text-[15px] text-ink";
  const what = kind === "pay" ? "salary" : "rent";
  const cats = categories(kind);
  const groups = [...new Set(cats.map((c) => c.group ?? ""))];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await fetch("/api/fair-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, country, town, category, amount }),
    })
      .then((x) => x.json())
      .catch(() => ({ ok: false, reason: "That didn’t go through. Please try again." }));
    setResult(r as Result);
    setBusy(false);
  }

  const compare = (cell: FairCell, mine: number) => {
    const gap = ((mine - cell.median!) / cell.median!) * 100;
    const where = Math.abs(gap) < 3 ? "about the same as" : `${Math.abs(Math.round(gap))}% ${gap > 0 ? "above" : "below"}`;
    return (
      <>
        Your {money(country, mine)} is <strong>{where}</strong> the middle {what} of <strong>{money(country, cell.median!)}</strong> for{" "}
        {categoryLabel(kind, category).toLowerCase()} in {townLabel(country, cell.town)}. Half of the {cell.n} reports fall between{" "}
        {money(country, cell.low!)} and {money(country, cell.high!)}.
      </>
    );
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-rule bg-surface px-5 py-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-[13px] text-ink-soft">
          Country
          <select
            className={field}
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setTown(TOWNS[e.target.value][0].id);
            }}
          >
            {COUNTRIES.filter((c) => TOWNS[c.code]).map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[13px] text-ink-soft">
          Town
          <select className={field} value={town} onChange={(e) => setTown(e.target.value)}>
            {TOWNS[country].map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[13px] text-ink-soft">
          {kind === "pay" ? "Your job" : "Your home"}
          <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
            {groups.map((g) =>
              g ? (
                <optgroup key={g} label={g}>
                  {cats.filter((c) => c.group === g).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </optgroup>
              ) : (
                cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))
              ),
            )}
          </select>
        </label>
        <label className="text-[13px] text-ink-soft">
          {kind === "pay" ? "Monthly salary before tax" : "Monthly rent"} ({COUNTRIES.find((c) => c.code === country)?.currency})
          <input className={field} inputMode="numeric" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={kind === "pay" ? "e.g. 45,000" : "e.g. 15,000"} />
        </label>
      </div>
      <button type="submit" disabled={busy} className="mt-4 rounded-full bg-ink px-5 py-2 text-[14px] font-semibold text-paper hover:bg-forest disabled:opacity-60">
        {busy ? "Checking…" : `Is my ${what} fair?`}
      </button>
      <p className="mt-2 text-[12px] text-muted">Anonymous: no name, no email, and your address is never stored. We publish only the middle of at least five reports.</p>

      {result ? (
        <div className="mt-5 rounded-xl border-l-4 border-forest bg-forest/5 px-4 py-4 text-[14px] leading-6 text-ink-soft">
          {!result.ok ? (
            <p className="text-accent">{result.reason}</p>
          ) : result.town?.median != null ? (
            <p>{compare(result.town, result.amount)}</p>
          ) : result.country?.median != null ? (
            <p>
              Not enough reports from {townLabel(country, town)} yet, so here is the whole country. {compare(result.country, result.amount)}
            </p>
          ) : (
            <p>
              <strong>Thank you{result.replaced ? " (your earlier figure today was updated)" : ""}.</strong> You are one of {result.town?.n ?? 1} report
              {(result.town?.n ?? 1) === 1 ? "" : "s"} for {categoryLabel(kind, category).toLowerCase()} in {townLabel(country, town)}. We publish the middle {what}{" "}
              once {result.min} people have reported. Share this page with colleagues or neighbours to get there sooner.
            </p>
          )}
        </div>
      ) : null}
    </form>
  );
}
