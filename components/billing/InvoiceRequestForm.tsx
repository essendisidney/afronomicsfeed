"use client";

import { useState, type FormEvent } from "react";
import { institutionalLadder, institutionalPriceText } from "@/lib/billing/ratecard";
import { track } from "@/lib/track";

const plans = [...institutionalLadder].reverse().map((t) => ({ id: t.id, label: `${t.name} (${institutionalPriceText(t)} a month)` }));

/** "Request an invoice" for the institutional ladder: a lead in `leads` through /api/enquiry (interest 'licensing'). */
export function InvoiceRequestForm({ plan = "enterprise" }: { plan?: string }) {
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const chosen = plans.find((p) => p.id === form.get("plan"))?.label ?? "Enterprise";
    setState("pending");
    setMessage(null);
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          organisation: form.get("organisation"),
          interest: "licensing",
          message: `Invoice request: ${chosen}. ${String(form.get("notes") ?? "").trim()}`.trim(),
          website: form.get("website"),
          source: `invoice:${window.location.pathname}`,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; reason?: string };
      if (response.ok && body.ok) {
        track("enquiry");
        setState("done");
      } else {
        setState("error");
        setMessage(body.reason ?? "That didn’t go through. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("That didn’t go through. Please try again.");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="border border-forest/40 bg-paper-2 px-4 py-4 text-sm leading-6 text-ink">
        Received. The desk replies within one working day with the terms and an invoice in US dollars.
      </p>
    );
  }

  const field = "mt-1 w-full border border-rule bg-paper px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-gold/40";
  const label = "text-[13px] font-medium text-muted";
  return (
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
      <label className="block">
        <span className={label}>Name *</span>
        <input required name="name" autoComplete="name" maxLength={120} className={field} />
      </label>
      <label className="block">
        <span className={label}>Work email *</span>
        <input required type="email" name="email" autoComplete="email" maxLength={200} className={field} placeholder="you@yourfirm.com" />
      </label>
      <label className="block">
        <span className={label}>Organisation *</span>
        <input required name="organisation" autoComplete="organization" maxLength={160} className={field} />
      </label>
      <label className="block">
        <span className={label}>Plan</span>
        <select name="plan" defaultValue={plans.some((p) => p.id === plan) ? plan : "enterprise"} className={field}>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className={label}>Anything the invoice needs (PO number, billing address, teams, redistribution)</span>
        <textarea name="notes" rows={3} maxLength={2000} className={field} />
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={state === "pending"}
          className="rounded-full bg-forest px-5 py-2.5 text-[14px] font-semibold text-paper hover:bg-forest-deep disabled:opacity-60"
        >
          {state === "pending" ? "Sending…" : "Request an invoice"}
        </button>
        {message ? <p className="text-sm text-down">{message}</p> : null}
      </div>
    </form>
  );
}
