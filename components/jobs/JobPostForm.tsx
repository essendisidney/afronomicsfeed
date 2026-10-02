"use client";

import { useState, type FormEvent } from "react";
import { PaystackCheckout } from "@/components/billing/PaystackCheckout";

/** Two steps: the listing, then the KES 10,000 fee. The listing goes live automatically when the payment from the same email lands. */
export function JobPostForm({ live }: { live: boolean }) {
  const [state, setState] = useState<"idle" | "pending" | "saved" | "error">("idle");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const field = "mt-1 w-full rounded-xl border border-rule bg-surface px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-accent";
  const label = "text-[13px] font-medium text-muted";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
    setState("pending");
    setMessage(null);
    try {
      const r = await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = (await r.json()) as { ok: boolean; reason?: string };
      if (!body.ok) {
        setState("error");
        setMessage(body.reason ?? "Could not save the listing.");
        return;
      }
      setEmail(payload.email);
      setState("saved");
    } catch {
      setState("error");
      setMessage("Could not save the listing.");
    }
  }

  if (state === "saved") {
    return (
      <div className="rounded-2xl border border-up/40 bg-surface px-5 py-5">
        <p className="text-[15px] font-semibold text-ink">Listing saved. One step left: the KES 10,000 fee.</p>
        <p className="mt-1 text-sm text-ink-soft">Pay from the same email address ({email}) and the listing goes live on its own, for 30 days. Prefer an invoice? Email desk@afronomicsfeed.com with the institution name.</p>
        <div className="mt-4 max-w-sm">
          {live ? <PaystackCheckout plan="job_listing" label="Pay KES 10,000 · M-Pesa or card" variant="primary" /> : <p className="text-sm text-muted">Checkout is being set up; the desk will send an invoice.</p>}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <label className="block sm:col-span-2">
        <span className={label}>Role title</span>
        <input required name="title" maxLength={120} className={field} placeholder="Treasury Analyst" />
      </label>
      <label className="block">
        <span className={label}>Institution</span>
        <input required name="institution" maxLength={120} className={field} />
      </label>
      <label className="block">
        <span className={label}>Location</span>
        <input name="location" maxLength={80} className={field} placeholder="Nairobi · hybrid" />
      </label>
      <label className="block">
        <span className={label}>Type</span>
        <select name="role_type" className={field} defaultValue="Full-time">
          {["Full-time", "Contract", "Internship", "Graduate", "Part-time"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={label}>Closing date</span>
        <input type="date" name="closes" className={field} />
      </label>
      <label className="block sm:col-span-2">
        <span className={label}>Where to apply (link or email)</span>
        <input name="apply_url" maxLength={500} className={field} placeholder="https://… or careers@…" />
      </label>
      <label className="block sm:col-span-2">
        <span className={label}>Description</span>
        <textarea name="description" rows={6} maxLength={4000} className={field} placeholder="What the role does, what it needs, what it pays if you say so." />
      </label>
      <label className="block sm:col-span-2">
        <span className={label}>Your email (for the receipt; the listing is tied to it)</span>
        <input required type="email" name="email" maxLength={200} className={field} />
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="sm:col-span-2">
        <button type="submit" disabled={state === "pending"} className="rounded-full bg-ink px-5 py-3 text-[14px] font-semibold text-paper hover:bg-forest disabled:opacity-60">
          {state === "pending" ? "Saving…" : "Save listing and continue to payment"}
        </button>
        {message ? <p className="mt-2 text-sm text-down">{message}</p> : null}
      </div>
    </form>
  );
}
