"use client";

import { useState, type FormEvent } from "react";
import { track } from "@/lib/track";

const roles = [
  { value: "investor", label: "Investor / fund" },
  { value: "bank", label: "Bank / treasury" },
  { value: "dfi", label: "DFI / development" },
  { value: "corporate", label: "Corporate / strategy" },
  { value: "research", label: "Research / policy" },
  { value: "founder", label: "Founder / operator" },
  { value: "other", label: "Other" },
];

export function SubscribeForm({ tone = "paper" }: { tone?: "paper" | "night" }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("investor");
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const night = tone === "night";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("pending");
    setMessage(null);
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, source: typeof window === "undefined" ? "" : window.location.pathname }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; reason?: string };
      if (response.ok && body.ok) {
        setState("done");
        track("newsletter_signup");
        setMessage("You’re on the list. The next Morning lands at 7:00 on the next weekday.");
        setEmail("");
      } else {
        setState("error");
        setMessage(body.reason ?? "That didn’t go through. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("That didn’t go through. Please try again.");
    }
  }

  const field = night
    ? "border-night-line bg-night text-night-ink placeholder:text-night-muted"
    : "border-rule bg-paper text-ink placeholder:text-muted";
  const labelTone = night ? "text-night-muted" : "text-muted";

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
        <label className="block">
          <span className={`text-[13px] font-medium ${labelTone}`}>Work email</span>
          <input
            required
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="you@company.com"
            className={`mt-1 w-full rounded-xl border px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40 ${field}`}
          />
        </label>
        <label className="block">
          <span className={`text-[13px] font-medium ${labelTone}`}>I work in</span>
          <select
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className={`mt-1 w-full rounded-xl border px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40 ${field}`}
          >
            {roles.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        disabled={state === "pending"}
        className={`rounded-full px-6 py-3 text-[15px] font-semibold disabled:opacity-60 ${night ? "bg-accent text-night hover:bg-gold-soft" : "bg-ink text-paper hover:bg-forest"}`}
      >
        {state === "pending" ? "Adding you" : "Get the Morning"}
      </button>
      {message ? (
        <p role="status" className={`text-sm ${state === "error" ? "text-gold-soft" : night ? "text-night-soft" : "text-forest"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
