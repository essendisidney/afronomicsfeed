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
  variant?: "primary" | "secondary" | "ghost";
}) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const styles = {
    primary: "bg-forest text-paper hover:bg-forest-mid",
    secondary: "bg-gold text-forest-deep hover:bg-gold-soft",
    ghost: "border border-ink/20 text-ink hover:border-gold",
  }[variant];

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
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Email for the receipt</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full border border-rule bg-paper px-3 py-2 text-sm"
          autoComplete="email"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className={`w-full px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] disabled:opacity-60 ${styles}`}
      >
        {pending ? "Opening Paystack" : label}
      </button>
      {message ? (
        <p role="status" className="text-center font-mono text-[11px] text-gold">
          {message}
        </p>
      ) : null}
    </form>
  );
}
