"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { pilotMarkets, pilotNextOptions, type PilotResult } from "@/lib/billing/pilot";
import { localInstitutionPrices } from "@/lib/billing/ratecard";
import { track, trackPilotForm } from "@/lib/track";

const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/**
 * The self-serve 30-day pilot: five questions, then the key (or when it arrives) on screen. Posts to /api/pilot.
 * With `localPricing` it also asks for the country, for a local-institution price after the pilot (D-014).
 */
export function PilotForm({ siteUrl, localPricing = false }: { siteUrl: string; localPricing?: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Extract<PilotResult, { ok: true }> | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const markets = form.getAll("markets").map(String);
    if (!markets.length) {
      setError("Tick at least one market.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/pilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          organisation: form.get("organisation"),
          markets,
          next: form.get("next"),
          country: form.get("country"),
          website: form.get("website"),
          source: window.location.pathname,
        }),
      });
      const body = (await response.json().catch(() => null)) as PilotResult | null;
      if (body?.ok) {
        track("enquiry");
        trackPilotForm("submit");
        setResult(body);
      } else setError(body && !body.ok ? body.reason : "That didn’t go through. Please try again.");
    } catch {
      setError("That didn’t go through. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (result) return <PilotDone result={result} siteUrl={siteUrl} />;

  const field = "mt-1 w-full border border-rule bg-paper px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-gold/40";
  const label = "text-[13px] font-medium text-muted";

  return (
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit} onChange={() => trackPilotForm("start")}>
      <label className="block">
        <span className={label}>Name *</span>
        <input required name="name" autoComplete="name" maxLength={120} className={field} />
      </label>
      <label className="block">
        <span className={label}>Work email *</span>
        <input required type="email" name="email" autoComplete="email" maxLength={200} className={field} placeholder="you@yourfirm.com" />
      </label>
      <label className="block sm:col-span-2">
        <span className={label}>Organisation *</span>
        <input required name="organisation" autoComplete="organization" minLength={2} maxLength={160} className={field} />
      </label>
      {localPricing ? (
        <label className="block sm:col-span-2">
          <span className={label}>Local-institution price for *</span>
          <select required name="country" defaultValue="" className={field}>
            <option value="" disabled>
              Choose the country your institution is incorporated in
            </option>
            {localInstitutionPrices.map((p) => (
              <option key={p.id} value={p.id}>
                {p.country} ({p.currency})
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <fieldset className="sm:col-span-2">
        <legend className={label}>Markets of interest *</legend>
        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
          {pilotMarkets.map((m) => (
            <label key={m.id} className="flex items-start gap-2 text-[13px] text-ink">
              <input type="checkbox" name="markets" value={m.id} className="mt-0.5 accent-forest" />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="sm:col-span-2">
        <legend className={label}>Which would you pay for next? *</legend>
        <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1.5">
          {pilotNextOptions.map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-[13px] text-ink">
              <input type="radio" name="next" value={o.id} required className="accent-forest" />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-forest px-5 py-2.5 text-[14px] font-semibold text-paper hover:bg-forest-deep disabled:opacity-60"
        >
          {pending ? "Sending…" : "Start my 30-day pilot"}
        </button>
        <p className="text-[12px] text-muted">Free. No payment details. Trial keys go to work email addresses.</p>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-down sm:col-span-2">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function PilotDone({ result, siteUrl }: { result: Extract<PilotResult, { ok: true }>; siteUrl: string }) {
  const box = "border border-forest/40 bg-paper-2 px-4 py-4 text-sm leading-6 text-ink";
  if (result.status === "issued") {
    return (
      <div className={box} role="status">
        <p className="text-[15px] font-semibold">
          {result.emailed === false
            ? `Your pilot key (${result.prefix}…) is issued, but the email to ${result.email} did not go out.`
            : `Your pilot key (${result.prefix}…) is on its way to ${result.email}.`}{" "}
          It works until {day(result.expiresAt)}.
        </p>
        <p className="mt-2 text-[13px] text-ink-soft">
          {result.emailed === false
            ? "Write to the desk from that address and we send it within one working day."
            : "For safety the key is sent only to the address on the form, never shown on screen. We keep only a fingerprint of it, so store the email somewhere safe."}
        </p>
        <p className="mt-3 font-semibold">Next steps</p>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-[13px] text-ink-soft">
          <li>
            Call the API with the key as a header:
            <code className="mt-1 block overflow-x-auto whitespace-pre bg-surface px-3 py-2 font-mono text-[12px] text-ink">{`curl -H "Authorization: Bearer ${result.prefix}…" \\\n  "${siteUrl}/api/v1/bonds/egypt?from=2026-01-01"`}</code>
          </li>
          <li>
            Endpoints and terms are on the{" "}
            <Link href="/data-api" className="underline underline-offset-2">
              data API page
            </Link>
            .
          </li>
          <li>
            Before day 30 the desk asks which plan fits. To keep going, buy{" "}
            <Link href="/pricing#institutions" className="underline underline-offset-2">
              Analyst or Team and API
            </Link>{" "}
            at checkout, or ask for an invoice.
          </li>
        </ol>
      </div>
    );
  }
  const copy: Record<typeof result.status, string> = {
    pending: `Received. Your 30-day pilot key arrives at ${result.email} within one working day, with the endpoints and terms.`,
    webmail: `Received, thank you. Instant trial keys go to work email addresses only, so the desk will check the request and reply to ${result.email} within one working day. If you have a work address, send the form again with it to get the key now.`,
    exists: `${result.email} already has a pilot key${result.expiresAt ? `, which works until ${day(result.expiresAt)}` : ""}. It was sent to that address when it was issued. Lost it? Reply to that email and the desk replaces it.`,
    limited: `Received. Your organisation has already had pilot keys recently, so the desk will reply to ${result.email} within one working day to set up access.`,
    duplicate: `We already have your request from ${result.email} today. The desk replies within one working day.`,
  };
  return (
    <div className={box} role="status">
      <p>{copy[result.status]}</p>
      <p className="mt-2 text-[13px] text-ink-soft">
        While you wait, the{" "}
        <Link href="/developers" className="underline underline-offset-2">
          open API
        </Link>{" "}
        serves the latest 12 months of the same datasets with no key and a five-minute cache.
      </p>
    </div>
  );
}
