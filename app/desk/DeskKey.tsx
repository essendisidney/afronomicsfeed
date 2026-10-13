"use client";

import { useState } from "react";

/**
 * Signs in to the desk: the key goes to /desk/session, which checks it and stores it in an HttpOnly cookie (scripts on
 * the page cannot read it), then the page reloads. If that route cannot be reached at all, the key is stored the old
 * way (a script-set cookie on /desk) so the owner is never locked out; the page checks it against the database either way.
 */
export function DeskKey({ wrong }: { wrong: boolean }) {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState<string | null>(wrong ? "That key isn’t right." : null);
  const [pending, setPending] = useState(false);

  async function signIn() {
    const key = value.trim();
    if (!key) return;
    setPending(true);
    try {
      localStorage.setItem("af_owner", "1");
    } catch {}
    const response = await fetch("/desk/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    }).catch(() => null);
    if (response?.ok) {
      window.location.reload();
      return;
    }
    if (response && (response.status === 401 || response.status === 403)) {
      const body = (await response.json().catch(() => null)) as { reason?: string } | null;
      setMessage(body?.reason ?? "That key isn’t right.");
      setPending(false);
      return;
    }
    // Fallback: the sign-in route is unreachable (or the database is down). Store the key as before and let the page check it.
    document.cookie = `af_desk=${encodeURIComponent(key)}; path=/desk; max-age=2592000; secure; samesite=strict`;
    window.location.reload();
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void signIn();
      }}
      className="space-y-3"
    >
      <label className="block">
        <span className="text-[13px] font-medium text-muted">Desk key</span>
        <input
          type="password"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="current-password"
          className="mt-1 w-full rounded-xl border border-rule bg-paper px-3 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-gold/40"
        />
      </label>
      {message ? <p className="text-sm text-down">{message}</p> : null}
      <button type="submit" disabled={pending} className="rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-paper hover:bg-forest disabled:opacity-60">
        {pending ? "Checking…" : "Open the desk"}
      </button>
    </form>
  );
}
