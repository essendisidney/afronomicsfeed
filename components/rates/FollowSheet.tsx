"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { track } from "@/lib/track";

type State = "idle" | "pending" | "done" | "error";

/**
 * "Follow this number": one sheet per page, opened by any FollowLink on it (links carrying data-follow). Asks only
 * for an email address and creates a rate alert of kind "series" through /api/rate-alerts, the same double opt-in
 * flow as every other alert: nothing is sent until the emailed link is opened, and every email has a one-click stop.
 * Without script the links simply go to the series page.
 */
export function FollowSheet() {
  const ref = useRef<HTMLDialogElement>(null);
  const [target, setTarget] = useState<{ id: string; label: string } | null>(null);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const link = (event.target as Element | null)?.closest?.("a[data-follow]");
      if (!(link instanceof HTMLAnchorElement)) return;
      event.preventDefault();
      setTarget({ id: link.dataset.follow ?? "", label: link.dataset.label ?? "this number" });
      setState("idle");
      setMessage(null);
      ref.current?.showModal();
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!target) return;
    setState("pending");
    setMessage(null);
    try {
      const response = await fetch("/api/rate-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, kind: "series", series: target.id }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; reason?: string; message?: string };
      if (response.ok && body.ok) {
        setState("done");
        track("alert_signup");
        setMessage(body.message ?? "Check your inbox to confirm.");
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

  return (
    <dialog
      ref={ref}
      aria-labelledby="follow-sheet-title"
      className="fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none rounded-t-2xl border border-rule bg-surface p-0 text-ink shadow-xl backdrop:bg-black/40 sm:inset-0 sm:m-auto sm:max-w-md sm:rounded-2xl"
    >
      <div className="px-5 pb-6 pt-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Follow this number</p>
            <h2 id="follow-sheet-title" className="mt-1 font-serif text-xl leading-tight text-ink">
              {target?.label ?? "Follow"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-paper-2 hover:text-ink"
            aria-label="Close"
          >
            <span aria-hidden="true" className="text-xl leading-none">×</span>
          </button>
        </div>
        <p className="mt-2 text-[14px] leading-6 text-ink-soft">
          One short email when a new figure differs from the last one we told you about, with the source. Free. Confirm by email; stop with one click.
        </p>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          <label className="block">
            <span className="text-[13px] font-medium text-muted">Email</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border border-rule bg-paper px-3 py-2.5 text-[16px] text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-gold/40"
            />
          </label>
          <button
            type="submit"
            disabled={state === "pending" || !target}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-[15px] font-semibold text-paper hover:bg-forest disabled:opacity-60"
          >
            {state === "pending" ? "Sending" : "Email me when it changes"}
          </button>
          {message ? (
            <p role="status" className={`text-[13px] ${state === "error" ? "text-down" : "text-forest"}`}>
              {message}
            </p>
          ) : null}
        </form>
        <p className="mt-4 text-[12px] leading-5 text-muted">
          Information, not advice. We use the address only for this alert. <Link href="/alerts#email-alerts" className="underline underline-offset-2">All alerts</Link>
        </p>
      </div>
    </dialog>
  );
}
