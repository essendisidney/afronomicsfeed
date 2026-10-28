"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";

/** Posts a Treasury Desk action to /desk/actions, then refreshes the server-rendered desk. */
function useAction() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  async function run(action: string, form: HTMLFormElement, reset = true) {
    const payload = Object.fromEntries([...new FormData(form).entries()].map(([k, v]) => [k, String(v)]));
    setMsg("…");
    const r = await fetch("/desk/actions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...payload }) }).catch(() => null);
    const body = r ? ((await r.json().catch(() => ({ ok: false }))) as { ok: boolean; reason?: string; value?: unknown }) : { ok: false, reason: "No connection." };
    const value = body.value as { added?: number; marked?: number } | undefined;
    setMsg(body.ok ? (value?.added != null ? `Loaded: ${value.added} added, ${value.marked ?? 0} already in the log.` : "Saved.") : body.reason ?? "Failed.");
    if (body.ok) {
      if (reset) form.reset();
      router.refresh();
    }
  }
  return { msg, run };
}

const field = "mt-1 w-full rounded-xl border border-rule bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent";
const label = "text-[12px] font-medium text-muted";
const btn = "inline-flex min-h-11 items-center rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-paper hover:bg-forest";

function Form({ action, children, submit, reset = true, className = "" }: { action: string; children: ReactNode; submit: string; reset?: boolean; className?: string }) {
  const { msg, run } = useAction();
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void run(action, e.currentTarget, reset);
  }
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
      <div className="mt-3 flex items-center gap-3">
        <button type="submit" className={btn}>
          {submit}
        </button>
        {msg ? <span className="text-[12px] text-ink-soft" role="status">{msg}</span> : null}
      </div>
    </form>
  );
}

export const STAGES = [
  { id: "prospect", label: "Target" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Conversation" },
  { id: "pilot", label: "Sample sent" },
  { id: "proposal", label: "Quoted" },
  { id: "won", label: "Paying" },
  { id: "lost", label: "Lost / not now" },
] as const;

export function LoadTargets() {
  return (
    <Form action="treasury_load" submit="Load the 60 names into the deal log">
      <p className="text-[13px] leading-5 text-ink-soft">
        Adds each name in <code>data/sales/treasury-desk-targets.json</code> as a target, or marks it if it is already in the log. Safe to run again.
      </p>
    </Form>
  );
}

export function UpdateTarget({ id, stage }: { id: number; stage: string }) {
  return (
    <Form action="treasury_update" submit="Save" className="grid gap-2 sm:grid-cols-3">
      <input type="hidden" name="id" value={id} />
      <label className="block">
        <span className={label}>Stage</span>
        <select name="stage" defaultValue={stage} className={field}>
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={label}>Decision-maker reached</span>
        <select name="decision_maker" defaultValue="" className={field}>
          <option value="">unchanged</option>
          <option value="yes">yes</option>
          <option value="no">no</option>
        </select>
      </label>
      <label className="block">
        <span className={label}>Board or committee date</span>
        <input type="date" name="board_date" className={field} />
      </label>
      <label className="block">
        <span className={label}>Sample sent on</span>
        <input type="date" name="sample_sent_on" className={field} />
      </label>
      <label className="block">
        <span className={label}>Price quoted (KES a month)</span>
        <input name="price" inputMode="numeric" className={field} placeholder="18000" />
      </label>
      <label className="block">
        <span className={label}>Next date</span>
        <input type="date" name="next_date" className={field} />
      </label>
      <label className="block sm:col-span-3">
        <span className={label}>Main objection, in their words</span>
        <input name="objection" className={field} maxLength={500} />
      </label>
      <label className="block sm:col-span-3">
        <span className={label}>Next step</span>
        <input name="next_step" className={field} maxLength={500} />
      </label>
      <label className="block sm:col-span-3">
        <span className={label}>Note (added to the deal with today’s date)</span>
        <input name="note" className={field} maxLength={300} />
      </label>
    </Form>
  );
}

export function GrantEntitlement() {
  return (
    <Form action="treasury_grant" submit="Open the entitlement" className="grid gap-2 sm:grid-cols-3">
      <label className="block sm:col-span-2">
        <span className={label}>Organisation</span>
        <input name="organisation" required className={field} maxLength={160} />
      </label>
      <label className="block">
        <span className={label}>Kind</span>
        <select name="kind" className={field} defaultValue="sacco">
          {["sacco", "pension", "administrator", "fund_manager", "insurer", "bank", "corporate", "other"].map((k) => (
            <option key={k} value={k}>
              {k.replace("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={label}>Product</span>
        <select name="product" className={field} defaultValue="pack_plus">
          <option value="pack">Pack (KES 12,000)</option>
          <option value="pack_plus">Board Pack with alerts (KES 18,000)</option>
          <option value="treasury_desk">Treasury Desk</option>
          <option value="benchmarking">Benchmarking (quarter)</option>
        </select>
      </label>
      <label className="block">
        <span className={label}>Months</span>
        <input name="months" inputMode="numeric" className={field} defaultValue="12" />
      </label>
      <label className="block">
        <span className={label}>KES a month (as invoiced)</span>
        <input name="amount" inputMode="numeric" className={field} placeholder="12000" />
      </label>
      <label className="block">
        <span className={label}>Source</span>
        <select name="source" className={field} defaultValue="invoice">
          <option value="invoice">Invoice</option>
          <option value="pilot">Paid pilot</option>
        </select>
      </label>
      <label className="block">
        <span className={label}>Invoice number</span>
        <input name="reference" className={field} placeholder="AF-INV-2026-001" />
      </label>
      <label className="block">
        <span className={label}>Schemes covered</span>
        <input name="schemes" inputMode="numeric" className={field} defaultValue="1" />
      </label>
    </Form>
  );
}

export function RenameOrg({ org, name }: { org: number; name: string }) {
  return (
    <Form action="treasury_rename" submit="Rename" className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="org" value={org} />
      <label className="block">
        <span className={label}>Name for the cover</span>
        <input name="name" defaultValue={name} className={field} maxLength={160} />
      </label>
      <input type="hidden" name="kind" value="" />
    </Form>
  );
}

export function MarkPack({ org, period }: { org: number; period: string }) {
  return (
    <Form action="treasury_pack_mark" submit="Mark checked" reset={false} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="org" value={org} />
      <input type="hidden" name="period" value={period} />
      <label className="block">
        <span className={label}>Checked by</span>
        <input name="checked_by" required className={field} placeholder="Founder" maxLength={80} />
      </label>
      <label className="flex items-center gap-2 pb-2 text-[13px] text-ink">
        <input type="checkbox" name="sent" value="1" /> sent
      </label>
    </Form>
  );
}
