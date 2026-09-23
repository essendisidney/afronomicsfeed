"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AdvisoryPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Advisory"
        title="Enterprise and licensed desks"
        lede="A contact stub for institutions that need seats, compliance packs, or a conversation — not a tips hotline. This form does not open a mandate."
      />
      <form
        className="mt-10 space-y-4 border border-rule bg-paper-2 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
      >
        <label className="block">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Name
          </span>
          <input
            required
            name="name"
            className="mt-2 w-full border border-rule bg-paper px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Institution
          </span>
          <input
            required
            name="institution"
            className="mt-2 w-full border border-rule bg-paper px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Work email
          </span>
          <input
            required
            type="email"
            name="email"
            className="mt-2 w-full border border-rule bg-paper px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            What you need
          </span>
          <textarea
            required
            name="message"
            rows={5}
            className="mt-2 w-full border border-rule bg-paper px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40"
          />
        </label>
        <button
          type="submit"
          className="bg-forest px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-paper hover:bg-forest-mid"
        >
          Send (stub)
        </button>
        {sent ? (
          <p role="status" className="font-mono text-[11px] text-forest">
            Recorded locally. No ticket system is wired in this build.
          </p>
        ) : null}
      </form>
    </div>
  );
}
