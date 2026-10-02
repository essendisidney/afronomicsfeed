"use client";

import { useState, type FormEvent } from "react";
import type { CheckoutPlanId } from "@/lib/billing/plans";

export function PaystackCheckout({
  plan,
  label,
  variant = "primary",
}: {
  plan: CheckoutPlanId;
  label: string;
  variant?: "primary" | "accent" | "ghost";
}) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const styles = {
    primary: "bg-ink text-paper hover:bg-ink/90",
    accent: "bg-accent text-night hover:bg-gold-soft",
    ghost: "border border-ink/20 text-ink hover:border-accent",
  }[variant];
  const field = variant === "accent" ? "border-night-line bg-night-2 text-night-ink placeholder:text-night-soft" : "border-rule bg-surface text-ink";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email }),
      });
      const body = (await response.json()) as { authorizationUrl?: string; reason?: string };
      if (body.authorizationUrl?.startsWith("https://checkout.paystack.com/")) {
        window.location.assign(body.authorizationUrl);
        return;
      }
      setMessage(body.reason ?? "Checkout did not open.");
    } catch {
      setMessage("Checkout did not open.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <label className="block">
        <span className="sr-only">Email for the receipt</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email for the receipt"
          className={`w-full rounded-full border px-4 py-2.5 text-sm outline-none focus:border-accent ${field}`}
          autoComplete="email"
        />
      </label>
      <button type="submit" disabled={pending} className={`w-full rounded-full px-4 py-3 text-[13px] font-semibold transition disabled:opacity-60 ${styles}`}>
        {pending ? "Opening Paystack…" : label}
      </button>
      <p className={`text-center text-[11px] ${variant === "accent" ? "text-night-soft" : "text-muted"}`}>M-Pesa, card or bank transfer. Cancel any time.</p>
      {message ? (
        <p role="status" className="text-center text-[12px] text-down">
          {message}
        </p>
      ) : null}
    </form>
  );
}
