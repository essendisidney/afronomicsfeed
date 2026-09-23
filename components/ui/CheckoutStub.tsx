"use client";

import { useState } from "react";

export function CheckoutStub({
  label,
  variant = "primary",
}: {
  label: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const [message, setMessage] = useState<string | null>(null);

  const styles = {
    primary: "bg-forest text-paper hover:bg-forest-mid",
    secondary: "bg-gold text-forest-deep hover:bg-gold-soft",
    ghost: "border border-ink/20 text-ink hover:border-gold",
  }[variant];

  return (
    <div>
      <button
        type="button"
        onClick={() => setMessage("M-Pesa checkout coming soon")}
        className={`w-full px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] ${styles}`}
      >
        {label}
      </button>
      {message ? (
        <p role="status" className="mt-2 text-center font-mono text-[11px] text-gold">
          {message}
        </p>
      ) : null}
    </div>
  );
}
