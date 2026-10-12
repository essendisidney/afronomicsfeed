"use client";

import { useState } from "react";

type Cell = { lender: string; n: number; low: number | null; median: number | null; high: number | null; shamed_pct: number | null };
type Result = { ok: true; replaced: boolean; yours: number; cell: Cell | null } | { ok: false; reason: string };

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;

/** "What did your loan app really cost?": a borrower's report, answered with that lender's figures so far. */
export function LoanReportForm({ lenders }: { lenders: string[] }) {
  const [lender, setLender] = useState("");
  const [borrowed, setBorrowed] = useState("");
  const [repaid, setRepaid] = useState("");
  const [days, setDays] = useState("30");
  const [shamed, setShamed] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const field = "mt-1 w-full rounded-lg border border-rule bg-surface px-3 py-2 text-[15px] text-ink";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await fetch("/api/loan-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lender, borrowed, repaid, days, shamed }),
    })
      .then((x) => x.json())
      .catch(() => ({ ok: false, reason: "That didn’t go through. Please try again." }));
    setResult(r as Result);
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-rule bg-surface px-5 py-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-[13px] text-ink-soft sm:col-span-2">
          Lender (the company behind the app, from the CBK’s list)
          <input className={field} list="dcp-lenders" required value={lender} onChange={(e) => setLender(e.target.value)} placeholder="Start typing, e.g. Zenka" />
          <datalist id="dcp-lenders">
            {lenders.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </label>
        <label className="text-[13px] text-ink-soft">
          Amount you received (KES)
          <input className={field} inputMode="numeric" required value={borrowed} onChange={(e) => setBorrowed(e.target.value)} placeholder="e.g. 5,000" />
        </label>
        <label className="text-[13px] text-ink-soft">
          Total you repaid, every fee included (KES)
          <input className={field} inputMode="numeric" required value={repaid} onChange={(e) => setRepaid(e.target.value)} placeholder="e.g. 5,750" />
        </label>
        <label className="text-[13px] text-ink-soft">
          How many days the loan ran
          <input className={field} inputMode="numeric" required value={days} onChange={(e) => setDays(e.target.value)} />
        </label>
        <label className="text-[13px] text-ink-soft">
          Did the app contact your friends or family?
          <select className={field} value={shamed} onChange={(e) => setShamed(e.target.value)}>
            <option value="">Prefer not to say</option>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </label>
      </div>
      <button type="submit" disabled={busy} className="mt-4 rounded-full bg-ink px-5 py-2 text-[14px] font-semibold text-paper hover:bg-forest disabled:opacity-60">
        {busy ? "Sending…" : "Add my loan"}
      </button>
      <p className="mt-2 text-[12px] text-muted">Anonymous: no name, no number, and your address is never stored. We publish only the middle of at least five reports per lender.</p>

      {result ? (
        <div className="mt-5 rounded-xl border-l-4 border-forest bg-forest/5 px-4 py-4 text-[14px] leading-6 text-ink-soft">
          {!result.ok ? (
            <p className="text-accent">{result.reason}</p>
          ) : (
            <p>
              <strong className="text-ink">Your loan cost {kes(result.yours)} per KES 1,000 for 30 days.</strong>{" "}
              {result.cell?.median != null
                ? `Borrowers of ${result.cell.lender} report a middle cost of ${kes(result.cell.median)} (half between ${kes(result.cell.low!)} and ${kes(result.cell.high!)}, from ${result.cell.n} reports).`
                : `You are one of ${result.cell?.n ?? 1} report${(result.cell?.n ?? 1) === 1 ? "" : "s"} for this lender; its figure appears once five borrowers have reported.`}
              {result.replaced ? " (Your earlier report today was updated.)" : ""}
            </p>
          )}
        </div>
      ) : null}
    </form>
  );
}
