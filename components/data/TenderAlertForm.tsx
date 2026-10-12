"use client";

import { useState, type FormEvent } from "react";
import { track } from "@/lib/track";
import { TENDER_PRICE_KES, TRIAL_DAYS } from "@/lib/tenders-core";

type State = "idle" | "pending" | "done" | "error";

/** "Email me matching tenders": keywords and an email; double opt-in, then every open match and each new one daily. */
export function TenderAlertForm({ initialKeywords = "" }: { initialKeywords?: string }) {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("pending");
    setMessage(null);
    try {
      const response = await fetch("/api/tender-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, keywords, website }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; reason?: string; message?: string };
      if (response.ok && body.ok) {
        setState("done");
        track("alert_signup");
        setMessage(body.message ?? "Check your inbox to confirm.");
      } else {
        setState("error");
        setMessage(body.reason ?? "That didn’t go through. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("That didn’t go through. Please try again.");
    }
  }

  const field = "mt-1 w-full rounded-xl border border-rule bg-paper px-3 py-2.5 text-[15px] text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-gold/40";
  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block">
        <span className="text-[13px] font-medium text-muted">What do you supply? Keywords, separated by commas</span>
        <input required value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="e.g. ICT, cleaning, stationery, Nakuru" className={field} />
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="block sm:flex-1">
          <span className="text-[13px] font-medium text-muted">Email</span>
          <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.co.ke" className={field} />
        </label>
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" />
        <button type="submit" disabled={state === "pending"} className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-paper hover:bg-forest disabled:opacity-60">
          {state === "pending" ? "Sending" : `Start ${TRIAL_DAYS} days free`}
        </button>
      </div>
      <p className="text-[12px] text-muted">
        Every open tender that matches straight away, then each new one every morning. Free for {TRIAL_DAYS} days, then KES {TENDER_PRICE_KES} a month by M-Pesa.
        No card. Stop with one click.
      </p>
      {message ? (
        <p role="status" className={`text-[13px] ${state === "error" ? "text-down" : "text-forest"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
