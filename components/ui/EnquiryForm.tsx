"use client";

import { useState, type FormEvent } from "react";

const options = [
  { value: "sponsorship", label: "Sponsorship / advertising" },
  { value: "licensing", label: "Data licensing / API" },
  { value: "research", label: "Commissioned research" },
  { value: "access", label: "Pro or Team access" },
  { value: "widgets", label: "Branded widgets" },
  { value: "other", label: "Something else" },
];

export function EnquiryForm({ interest = "other", cta = "Send enquiry" }: { interest?: string; cta?: string }) {
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
    setState("pending");
    setMessage(null);
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, source: window.location.pathname }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; reason?: string };
      if (response.ok && body.ok) {
        setState("done");
        setMessage("Received. The desk replies within one business day.");
      } else {
        setState("error");
        setMessage(body.reason ?? "That didn’t go through. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("That didn’t go through. Please try again.");
    }
  }

  const field = "mt-1 w-full border border-rule bg-paper px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-gold/40";
  const label = "text-[13px] font-medium text-muted";

  if (state === "done") {
    return <p className="border border-forest/40 bg-paper-2 px-4 py-4 text-sm text-ink">{message}</p>;
  }

  return (
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
      <label className="block">
        <span className={label}>Name</span>
        <input name="name" autoComplete="name" className={field} />
      </label>
      <label className="block">
        <span className={label}>Work email *</span>
        <input required type="email" name="email" autoComplete="email" className={field} placeholder="you@company.com" />
      </label>
      <label className="block">
        <span className={label}>Organisation</span>
        <input name="organisation" autoComplete="organization" className={field} />
      </label>
      <label className="block">
        <span className={label}>Interested in</span>
        <select name="interest" defaultValue={interest} className={field}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className={label}>What do you need?</span>
        <textarea name="message" rows={4} className={field} />
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={state === "pending"}
          className="rounded-full bg-forest px-5 py-2.5 text-[14px] font-semibold text-paper hover:bg-forest-deep disabled:opacity-60"
        >
          {state === "pending" ? "Sending…" : cta}
        </button>
        {message ? <p className="text-sm text-gold">{message}</p> : null}
      </div>
    </form>
  );
}
