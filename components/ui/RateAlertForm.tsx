"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { track } from "@/lib/track";
import { alertTenors, kindLabel, type AlertKind } from "@/lib/rate-alerts-core";

type State = "idle" | "pending" | "done" | "error";

/**
 * Sign-up for an email rate alert (double opt-in: the alert starts only once the emailed link is opened).
 * `kinds` limits the choices; with one kind the picker is hidden. `compact` is the one-line version for data pages.
 */
export function RateAlertForm({
  kinds = ["auction", "tbill_above", "tbill_below", "ng_savings_bond", "policy_change"],
  defaultTenor = 364,
  compact = false,
}: {
  kinds?: AlertKind[];
  defaultTenor?: (typeof alertTenors)[number];
  compact?: boolean;
}) {
  const [kind, setKind] = useState<AlertKind>(kinds[0]);
  const [tenor, setTenor] = useState<number>(defaultTenor);
  const [threshold, setThreshold] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const needsLevel = kind === "tbill_above" || kind === "tbill_below";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("pending");
    setMessage(null);
    try {
      const response = await fetch("/api/rate-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, kind, tenor: needsLevel ? tenor : null, threshold: needsLevel ? threshold : null }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; reason?: string; message?: string };
      if (response.ok && body.ok) {
        setState("done");
        track("alert_signup");
        setMessage(body.message ?? "Check your inbox to confirm the alert.");
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

  const field = "mt-1 w-full rounded-xl border border-rule bg-paper px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-gold/40";
  const label = "text-[13px] font-medium text-muted";

  return (
    <form onSubmit={submit} className={compact ? "space-y-3" : "space-y-4"}>
      {kinds.length > 1 ? (
        <label className="block">
          <span className={label}>Email me when</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as AlertKind)} className={field}>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {kindLabel[k]}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {needsLevel ? (
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={label}>Bill</span>
            <select value={tenor} onChange={(e) => setTenor(Number(e.target.value))} className={field}>
              {alertTenors.map((t) => (
                <option key={t} value={t}>
                  {t}-day
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={label}>{kind === "tbill_above" ? "Rises above (%)" : "Falls below (%)"}</span>
            <input
              required
              inputMode="decimal"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="e.g. 9.50"
              pattern="[0-9]{1,2}([.,][0-9]{1,2})?"
              className={field}
            />
          </label>
        </div>
      ) : null}
      <div className={compact ? "flex flex-col gap-2 sm:flex-row sm:items-end" : "space-y-4"}>
        <label className="block sm:flex-1">
          <span className={label}>Email</span>
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={field}
          />
        </label>
        <button
          type="submit"
          disabled={state === "pending"}
          className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-paper hover:bg-forest disabled:opacity-60"
        >
          {state === "pending" ? "Sending" : "Email me"}
        </button>
      </div>
      {message ? (
        <p role="status" className={`text-[13px] ${state === "error" ? "text-down" : "text-forest"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}

/** Compact "Email me when…" box for a data page. Self-contained: drop it in wherever it fits. */
export function EmailAlertBox({ kinds, title = "Email me when…", note }: { kinds: AlertKind[]; title?: string; note?: string }) {
  return (
    <aside className="mt-6 max-w-xl rounded-2xl border border-rule bg-surface px-5 py-5" aria-label="Email alerts">
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      <p className="mt-1 text-[13px] leading-5 text-ink-soft">
        {note ?? (kinds.length === 1 ? `${kindLabel[kinds[0]]}: one short email, with the source.` : "One short email when it happens, with the source.")} Free; confirm by
        email; stop with one click. <Link href="/alerts#email-alerts" className="underline underline-offset-2">All alerts</Link>
      </p>
      <div className="mt-3">
        <RateAlertForm kinds={kinds} compact />
      </div>
    </aside>
  );
}

const statusNote: Record<string, string> = {
  confirmed: "Your alert is on. The next email comes when there is something new to report.",
  stopped: "Done: that alert is off. No more alert email unless you set one up again.",
  invalid: "That link has expired or was already used. Set the alert up again below.",
};

/** The note shown after the confirm and stop links redirect here (?email=confirmed|stopped|invalid). Wrap in Suspense. */
export function RateAlertStatus() {
  const status = useSearchParams().get("email");
  const text = status ? statusNote[status] : null;
  return text ? (
    <p role="status" className="mb-4 rounded-2xl border border-rule bg-surface px-5 py-4 text-sm text-ink">
      {text}
    </p>
  ) : null;
}
