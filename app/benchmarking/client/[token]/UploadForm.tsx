"use client";

import { useState, type FormEvent } from "react";

const field = "mt-1 w-full rounded-xl border border-rule bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent";

/** Send a quarter's holdings: choose a CSV (read in the browser) or paste it. The server checks every line. */
export function UploadForm({ token, quarters }: { token: string; quarters: string[] }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string; errors?: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    let csv = String(data.get("csv") ?? "");
    let fileName = "";
    if (file instanceof File && file.size > 0) {
      if (file.size > 200_000) return setMsg({ ok: false, text: "The file is larger than 200 KB." });
      csv = await file.text();
      fileName = file.name;
    }
    setBusy(true);
    const r = await fetch("/api/benchmark-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, quarter: data.get("quarter"), csv, file_name: fileName }),
    }).catch(() => null);
    const body = r ? ((await r.json().catch(() => ({ ok: false }))) as { ok: boolean; reason?: string; errors?: string[]; holdings?: number }) : { ok: false, reason: "No connection." };
    setBusy(false);
    setMsg(body.ok ? { ok: true, text: `Received ${body.holdings} holdings. The desk checks the page and releases it within five working days.` } : { ok: false, text: body.reason ?? "Failed.", errors: body.errors });
    if (body.ok) form.reset();
  }
  return (
    <form onSubmit={submit} className="grid max-w-2xl gap-4">
      <label className="block">
        <span className="text-[13px] font-medium text-ink">Quarter</span>
        <select name="quarter" className={field} defaultValue={quarters[0]}>
          {quarters.map((q) => (
            <option key={q} value={q}>
              {q.replace("-", " ")}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-[13px] font-medium text-ink">Holdings file (CSV)</span>
        <input type="file" name="file" accept=".csv,text/csv" className={field} />
      </label>
      <label className="block">
        <span className="text-[13px] font-medium text-ink">Or paste the rows</span>
        <textarea name="csv" rows={6} className={`${field} font-mono text-[12px]`} placeholder="name,kind,amount_kes,rate_pct,start,end" />
      </label>
      <div>
        <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-paper hover:bg-forest disabled:opacity-60">
          {busy ? "Sending…" : "Send the holdings"}
        </button>
      </div>
      {msg ? (
        <div role="status" className={`rounded-xl border px-4 py-3 text-sm ${msg.ok ? "border-rule text-ink" : "border-down text-ink"}`}>
          <p>{msg.text}</p>
          {msg.errors?.length ? (
            <ul className="mt-2 list-disc pl-5 text-[13px] text-ink-soft">
              {msg.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
