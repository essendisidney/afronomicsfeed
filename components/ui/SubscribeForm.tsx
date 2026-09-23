"use client";

import { useState } from "react";

export function SubscribeForm() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setStatus("sent");
      }}
    >
      <label className="block">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Work email
        </span>
        <input
          required
          type="email"
          name="email"
          placeholder="treasury@example.co.ke"
          className="mt-2 w-full border border-rule bg-paper px-3 py-3 text-sm text-ink outline-none ring-gold/40 placeholder:text-muted focus:ring-2"
        />
      </label>
      <label className="block">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Desk
        </span>
        <select
          name="desk"
          className="mt-2 w-full border border-rule bg-paper px-3 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-gold/40"
          defaultValue="treasury"
        >
          <option value="treasury">Bank treasury / ALCO</option>
          <option value="research">Research / strategy</option>
          <option value="risk">Risk / compliance</option>
          <option value="asset">Asset management</option>
          <option value="other">Other licensed desk</option>
        </select>
      </label>
      <p className="text-xs leading-5 text-muted">
        No live billing. This form records intent only. Trial is KES 500 for 14-day
        Individual access when checkout ships.
      </p>
      <button
        type="submit"
        className="bg-forest px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-paper hover:bg-forest-mid"
      >
        Request trial access
      </button>
      {status === "sent" ? (
        <p role="status" className="font-mono text-[11px] text-forest">
          Received. Checkout is not live — we will not charge this email.
        </p>
      ) : null}
    </form>
  );
}
