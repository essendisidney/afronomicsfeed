"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

const roles = [
  { value: "", label: "I work in… (optional)" },
  { value: "investor", label: "Investment / fund" },
  { value: "bank", label: "Bank / treasury" },
  { value: "dfi", label: "Development finance" },
  { value: "corporate", label: "Corporate" },
  { value: "research", label: "Research / policy" },
  { value: "media", label: "Media" },
  { value: "founder", label: "Founder / fintech" },
  { value: "student", label: "Student" },
  { value: "other", label: "Other" },
];

/** "Did you find what you were looking for?" — one tap, optional detail. Stored anonymously. */
export function PageFeedback() {
  const path = usePathname();
  const [found, setFound] = useState<boolean | null>(null);
  const [text, setText] = useState("");
  const [role, setRole] = useState("");
  const [state, setState] = useState<"ask" | "detail" | "done">("ask");

  const send = (payload: { found: boolean | null; text?: string; role?: string }) =>
    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, ...payload }),
      keepalive: true,
    }).catch(() => undefined);

  if (!path || !/^\/(markets|data|countries|capital|weekly|news|economy|climate|technology|trade|signals)(\/|$)/.test(path)) return null;

  if (state === "done") {
    return <p className="mt-12 border-t border-rule pt-4 text-sm text-ink-soft">Thank you — the desk reads every answer.</p>;
  }

  return (
    <section className="mt-12 border-t border-rule pt-4 text-sm" aria-label="Page feedback">
      {state === "ask" ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-ink-soft">Did you find what you were looking for?</span>
          {[
            { label: "Yes", value: true },
            { label: "Not quite", value: false },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                setFound(option.value);
                void send({ found: option.value });
                setState("detail");
              }}
              className="border border-rule px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink hover:border-gold"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <form
          className="grid gap-2 sm:grid-cols-[1fr_14rem_auto] sm:items-center"
          onSubmit={(event) => {
            event.preventDefault();
            if (text.trim() || role) void send({ found, text, role });
            setState("done");
          }}
        >
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={600}
            placeholder={found ? "What will you use it for? (optional)" : "What were you looking for?"}
            className="border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted"
          />
          <select value={role} onChange={(event) => setRole(event.target.value)} className="border border-rule bg-paper px-3 py-2 text-sm text-ink">
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <button type="submit" className="bg-forest px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-paper hover:bg-forest-deep">
            Send
          </button>
        </form>
      )}
    </section>
  );
}
