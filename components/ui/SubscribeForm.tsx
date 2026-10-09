"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { track } from "@/lib/track";


export const GUIDE_HREF = "/guides/where-your-shilling-earns-most";

/** Newsletter sign-up: one email box, any email. On success it hands over the free guide straight away. */
export function SubscribeForm({ tone = "paper", button = "Get it free" }: { tone?: "paper" | "night"; button?: string }) {
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ email, source: typeof window === "undefined" ? "" : window.location.pathname }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; reason?: string };
      if (response.ok && body.ok) {
        setState("done");
        track("newsletter_signup");
        setMessage("You’re in. Your guide is on its way to your inbox, and the Morning lands at 7:00 on weekdays.");
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className={`text-[13px] font-medium ${labelTone}`}>Your email</span>
          <input
            required
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            className={`mt-1 w-full rounded-xl border px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40 ${field}`}
          />
        </label>
        <button
          type="submit"
          disabled={state === "pending"}
          className={`rounded-full px-6 py-3 text-[15px] font-semibold disabled:opacity-60 ${night ? "bg-accent text-night hover:bg-gold-soft" : "bg-ink text-paper hover:bg-forest"}`}
        >
          {state === "pending" ? "Adding you" : button}
        </button>
      </div>
      {message ? (
        <p role="status" className={`text-sm ${state === "error" ? "text-gold-soft" : night ? "text-night-soft" : "text-forest"}`}>
          {message}
          {state === "done" ? (
            <>
              {" "}
              <Link href={GUIDE_HREF} className="font-semibold underline underline-offset-2">
                Or open the guide now →
              </Link>
            </>
          ) : null}
        </p>
      ) : (
        <p className={`text-[12px] ${labelTone}`}>Free. Any email. One click to stop.</p>
      )}
    </form>
  );
}
