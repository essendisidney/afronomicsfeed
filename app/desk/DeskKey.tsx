"use client";

import { useState } from "react";

/** Stores the desk key in a cookie for a year, then reloads. The page checks it against the database. */
export function DeskKey({ wrong }: { wrong: boolean }) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        try {
          localStorage.setItem("af_owner", "1");
        } catch {}
        document.cookie = `af_desk=${encodeURIComponent(value.trim())}; path=/desk; max-age=31536000; secure; samesite=strict`;
        window.location.reload();
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
      {wrong ? <p className="text-sm text-down">That key isn’t right.</p> : null}
      <button type="submit" className="rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-paper hover:bg-forest">
        Open the desk
      </button>
    </form>
  );
}
