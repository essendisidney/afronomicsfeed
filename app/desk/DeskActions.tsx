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

/** Issue a Data API key for a licensed customer. The key is shown once, here; only its hash is kept. */
export function IssueApiKey() {
  const [state, setState] = useState<{ msg?: string; key?: string } | null>(null);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = Object.fromEntries([...new FormData(form).entries()].map(([k, v]) => [k, String(v)]));
    setState({ msg: "…" });
    const r = await fetch("/api/desk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "api_key_create", ...payload }) });
    const body = (await r.json()) as { ok: boolean; reason?: string; value?: { key: string } };
    setState(body.ok && body.value ? { key: body.value.key } : { msg: body.reason ?? "Failed." });
    if (body.ok) form.reset();
  }
  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3">
      <label className="block sm:col-span-2">
        <span className={label}>Customer</span>
        <input required minLength={2} name="label" className={field} placeholder="Fund or company name, and the contact" />
      </label>
      <label className="block">
        <span className={label}>Plan</span>
        <select name="plan" className={field} defaultValue="data_api">
          <option value="trial">Trial</option>
          <option value="startup">Startup licence</option>
          <option value="institution">Institution / Team</option>
          <option value="data_api">Data API ($1,500)</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </label>
      <div className="sm:col-span-3">
        <button type="submit" className={btn}>
          Issue key
        </button>
        {state?.key ? (
          <p className="mt-3 rounded-xl border border-forest bg-forest/5 px-3 py-2 text-[13px] text-ink">
            Copy it now; it is not shown again: <code className="select-all break-all font-mono">{state.key}</code>
            <br />
            The customer sends it as <code className="font-mono">Authorization: Bearer &lt;key&gt;</code>.
          </p>
        ) : state?.msg ? (
          <span className="ml-3 text-[12px] text-muted">{state.msg}</span>
        ) : null}
      </div>
    </form>
  );
}

export function RevokeApiKey({ id }: { id: number }) {
  const { msg, run } = useAction();
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (confirm("Revoke this key? The customer's calls will be refused.")) void run("api_key_revoke", e.currentTarget);
  }
  return (
    <form onSubmit={submit} className="inline">
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-[12px] font-semibold text-down underline underline-offset-2 hover:text-ink">
        {msg ?? "revoke"}
      </button>
    </form>
  );
}

const SEGMENTS = ["asset_manager", "bank", "dfi", "research", "pension", "insurer", "corporate", "government", "media", "other"];
const PRODUCTS = ["frontier_debt", "data_api", "enterprise", "pack", "widget", "listing", "research", "tenders", "other"];
const STAGES = ["prospect", "contacted", "qualified", "pilot", "proposal", "won", "lost"];

/** Add a deal, or update one by its number (blank fields keep their value). "won" needs the signing date. */
export function SaveDeal() {
  const { msg, run } = useAction();
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void run("deal_save", e.currentTarget);
  }
  const select = (name: string, options: string[], blank: string) => (
    <select name={name} className={field} defaultValue="">
      <option value="">{blank}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3">
      <label className="block">
        <span className={label}>Deal no. (blank = new)</span>
        <input name="id" inputMode="numeric" className={field} />
      </label>
      <label className="block sm:col-span-2">
        <span className={label}>Organisation</span>
        <input name="organisation" className={field} placeholder="e.g. a frontier debt fund" />
      </label>
      <label className="block">
        <span className={label}>Segment</span>
        {select("segment", SEGMENTS, "keep / other")}
      </label>
      <label className="block">
        <span className={label}>Product</span>
        {select("product", PRODUCTS, "keep / frontier debt")}
      </label>
      <label className="block">
        <span className={label}>Stage</span>
        {select("stage", STAGES, "keep / prospect")}
      </label>
      <label className="block">
        <span className={label}>Expected USD a month if won</span>
        <input name="value" inputMode="decimal" className={field} />
      </label>
      <label className="block">
        <span className={label}>Next step date</span>
        <input name="next_date" type="date" className={field} />
      </label>
      <label className="block">
        <span className={label}>Signed on (needed for “won”)</span>
        <input name="signed_at" type="date" className={field} />
      </label>
      <label className="block sm:col-span-2">
        <span className={label}>Next step</span>
        <input name="next_step" className={field} />
      </label>
      <label className="block">
        <span className={label}>Source</span>
        <input name="source" className={field} placeholder="pilot form, referral…" />
      </label>
      <label className="block sm:col-span-3">
        <span className={label}>Notes</span>
        <input name="notes" className={field} />
      </label>
      <div className="flex items-center gap-3 sm:col-span-3">
        <button type="submit" className={btn}>
          Save deal
        </button>
        {msg ? <span className="text-[12px] text-muted">{msg}</span> : null}
      </div>
    </form>
  );
}
