"use client";

import { useState, type FormEvent } from "react";

function useAction() {
  const [msg, setMsg] = useState<string | null>(null);
  async function run(action: string, form: HTMLFormElement) {
    const payload = Object.fromEntries([...new FormData(form).entries()].map(([k, v]) => [k, String(v)]));
    setMsg("…");
    const r = await fetch("/api/desk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...payload }) });
    const body = (await r.json()) as { ok: boolean; reason?: string };
    setMsg(body.ok ? "Done. Refresh to see it." : body.reason ?? "Failed.");
    if (body.ok) form.reset();
  }
  return { msg, run };
}

const field = "mt-1 w-full rounded-xl border border-rule bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent";
const label = "text-[12px] font-medium text-muted";
const btn = "rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-paper hover:bg-forest";

export function GrantAccess({ reference }: { reference: string }) {
  const { msg, run } = useAction();
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void run("access", e.currentTarget);
  }
  return (
    <form onSubmit={submit} className="inline">
      <input type="hidden" name="reference" value={reference} />
      <button type="submit" className="text-[12px] font-semibold text-down underline underline-offset-2 hover:text-ink">
        {msg ?? "mark access granted"}
      </button>
    </form>
  );
}

export function AddCorrection() {
  const { msg, run } = useAction();
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void run("correction", e.currentTarget);
  }
  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className={label}>Market slug (optional)</span>
        <input name="market" className={field} placeholder="kenya" />
      </label>
      <label className="block">
        <span className={label}>Page (optional)</span>
        <input name="page" className={field} placeholder="/markets/tbills/zambia/2026-10-01" />
      </label>
      <label className="block sm:col-span-2">
        <span className={label}>What was wrong</span>
        <input required name="wrong" className={field} />
      </label>
      <label className="block sm:col-span-2">
        <span className={label}>What changed</span>
        <input required name="changed" className={field} />
      </label>
      <label className="block">
        <span className={label}>Reason</span>
        <input name="reason" className={field} placeholder="Bank restated the result / notice misread" />
      </label>
      <label className="block">
        <span className={label}>Reported by</span>
        <input name="reported_by" className={field} placeholder="desk / a reader" />
      </label>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button type="submit" className={btn}>
          Log correction
        </button>
        {msg ? <span className="text-sm text-muted">{msg}</span> : null}
      </div>
    </form>
  );
}

export function AddPress() {
  const { msg, run } = useAction();
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void run("press", e.currentTarget);
  }
  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3">
      <label className="block">
        <span className={label}>Email</span>
        <input required type="email" name="email" className={field} />
      </label>
      <label className="block">
        <span className={label}>Name</span>
        <input name="name" className={field} />
      </label>
      <label className="block">
        <span className={label}>Outlet</span>
        <input name="outlet" className={field} placeholder="Business Daily" />
      </label>
      <div className="sm:col-span-3 flex items-center gap-3">
        <button type="submit" className={btn}>
          Add to press list
        </button>
        {msg ? <span className="text-sm text-muted">{msg}</span> : null}
      </div>
    </form>
  );
}

export function HideReport({ id }: { id: number }) {
  const { msg, run } = useAction();
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void run("hide_report", e.currentTarget);
  }
  return (
    <form onSubmit={submit} className="inline">
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-[12px] font-semibold text-down underline underline-offset-2 hover:text-ink">
        {msg ?? "hide"}
      </button>
    </form>
  );
}
