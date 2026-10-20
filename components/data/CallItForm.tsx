"use client";

import { useState, type FormEvent } from "react";

const TENORS = [
  { key: "g91", label: "91-day" },
  { key: "g182", label: "182-day" },
  { key: "g364", label: "364-day" },
] as const;

/**
 * The "Call it" entry: three rates, an email address and an optional name for the board. Posts to app/api/call-it,
 * which checks the round is still open. Starts from last week's results so a reader only nudges the numbers.
 */
export function CallItForm({ start, closesLabel }: { start: Record<"g91" | "g182" | "g364", string>; closesLabel: string }) {
  const [rates, setRates] = useState(start);
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [show, setShow] = useState(true);
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("pending");
    setMessage(null);
    try {
      const response = await fetch("/api/call-it", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rates, email, handle, show }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; reason?: string; status?: string };
      if (response.ok && body.ok) {
        setState("done");
        setMessage(
          `${body.status === "updated" ? "Call updated" : "You’re in"}: ${TENORS.map((t) => (rates[t.key] ? `${t.label} ${rates[t.key]}%` : null)).filter(Boolean).join(", ")}. You can change it until ${closesLabel}; we email the result and your score.`,
        );
      } else {
        setState("error");
        setMessage(body.reason ?? "That didn’t go through. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("That didn’t go through. Please try again.");
    }
  }

  const field = "mt-1 w-full rounded-lg border border-rule bg-paper px-3 py-2 text-[15px] text-ink";
  return (
    <form onSubmit={submit} className="rounded-2xl border border-rule bg-surface px-5 py-5" aria-labelledby="callit-form-h">
      <h2 id="callit-form-h" className="t-h2 text-ink">
        Your call
      </h2>
      <p className="mt-1 text-[13px] text-ink-soft">The weighted average rate the CBK will accept, in percent. Call one, two or all three.</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {TENORS.map((t) => (
          <label key={t.key} className="block min-w-0 text-[13px] text-ink-soft">
            {t.label}
            <input
              className={`${field} tabular`}
              inputMode="decimal"
              value={rates[t.key]}
              onChange={(e) => setRates((r) => ({ ...r, [t.key]: e.target.value.slice(0, 7) }))}
              aria-describedby="callit-unit"
            />
          </label>
        ))}
      </div>
      <p id="callit-unit" className="mt-1 text-[11.5px] text-muted">
        Filled in with last week&rsquo;s results. A move of 0.01 is one basis point.
      </p>
      <label className="mt-4 block text-[13px] text-ink-soft">
        Email (for your score)
        <input className={field} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="mt-3 block text-[13px] text-ink-soft">
        Name on the board (optional)
        <input className={field} maxLength={24} value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="e.g. Wanjiku K" />
      </label>
      <label className="mt-2 flex min-h-11 items-center gap-2 text-[13px] text-ink-soft">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="h-4 w-4" />
        Show this name and my call on the board
      </label>
      <button
        type="submit"
        disabled={state === "pending"}
        className="mt-3 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-[14px] font-semibold text-paper hover:bg-forest disabled:opacity-60"
      >
        {state === "pending" ? "Saving…" : "Lock in my call"}
      </button>
      <p className="mt-2 text-[11.5px] leading-4 text-muted">
        Entering also brings you the free weekday Morning; unsubscribe with one click. We never show your email.
      </p>
      {message ? (
        <p role="status" className={`mt-3 text-[14px] ${state === "error" ? "text-down" : "text-ink"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
