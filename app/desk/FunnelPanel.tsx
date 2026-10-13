import { SectionTitle } from "@/components/data/parts";
import { moneyLabel } from "@/lib/billing/plans";
import type { PilotKey } from "./CommandCentre";

/**
 * How visitors become paying institutions, from real counts only (af_desk_funnel, migration 0034): no estimate or
 * model figure is shown here. Deals, follow-ups and key usage moved to the pipeline board and the pilots panel.
 */

type Window = {
  days: number;
  people: number;
  views: number;
  inst_people: number;
  inst_views: number;
  pilot_requests: number;
  trial_keys: number;
  keys_active: number;
  trial_keys_active: number;
  checkouts: number;
  payments: number;
  paid: { currency: string | null; amount: number }[];
  actions: Record<string, number>;
};

export type FunnelKey = PilotKey & { calls_7d: number; last_day: string | null; paths_30d: string[] };

export type Funnel = {
  windows: Window[];
  keys: FunnelKey[];
  surveys: { question: string; answer: string; n: number }[];
  survey_notes: { when: string; question: string; answer: string; path: string; note: string }[];
};

const DAY = 86400000;
const n = (v: number | undefined) => (v ?? 0).toLocaleString("en-US");

const ACTIONS: [string, string][] = [
  ["download_click", "CSV / API download clicks"],
  ["pricing_cta_click", "Pricing and pilot button clicks"],
  ["pilot_form_start", "Pilot form started"],
  ["pilot_form_submit", "Pilot form sent"],
  ["alert_signup", "Alert sign-ups (rates and tenders)"],
  ["share", "Share clicks"],
  ["source_click", "Clicks to the issuer’s own notice"],
  ["survey_answer", "Survey answers"],
];

const SURVEY_LABEL: Record<string, string> = {
  pay_next: "What would you pay for next?",
  use_for: "What do you use this for?",
};

/** "/v1/bonds/kenya" -> "kenya bonds"; "/v1/tbills/zambia" -> "zambia bills"; anything else as it is. */
export function marketsOf(paths: string[]) {
  const out = new Set<string>();
  for (const p of paths) {
    const m = p.match(/^\/v1\/(bonds|tbills)\/([a-z-]+)/);
    out.add(m ? `${m[2]} ${m[1] === "tbills" ? "bills" : "bonds"}` : p.replace(/^\/v1\//, "").split("?")[0]);
  }
  return [...out].sort();
}

function when(iso: string | null, now: number) {
  if (!iso) return "never";
  const d = Math.floor((now - Date.parse(iso)) / DAY);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} d ago`;
}

export function FunnelPanel({ funnel, now }: { funnel: Funnel | null; now: number }) {
  const w7 = funnel?.windows.find((w) => w.days === 7);
  const w30 = funnel?.windows.find((w) => w.days === 30);
  const steps: { label: string; note: string; get: (w: Window) => string }[] = [
    { label: "Visitors", note: "people (one browser a day), outside readers only", get: (w) => n(w.people) },
    { label: "Institutional pages", note: "people on /data/frontier-local-debt, /markets/bonds, /pricing, /licensing, /data-api", get: (w) => `${n(w.inst_people)} (${n(w.inst_views)} views)` },
    { label: "Pilot requests", note: "enquiries for licensing or a pilot (leads table)", get: (w) => n(w.pilot_requests) },
    { label: "Trial keys issued", note: "data keys with plan ‘trial’ created on the desk", get: (w) => n(w.trial_keys) },
    { label: "Keys with calls", note: "trial keys that called the API in the window (all keys in brackets)", get: (w) => `${n(w.trial_keys_active)} (${n(w.keys_active)})` },
    { label: "Checkouts started", note: "Paystack checkout opened", get: (w) => n(w.checkouts) },
    {
      label: "Payments",
      note: "status ‘success’ only; Paystack tests excluded",
      get: (w) => (w.payments ? `${w.payments} · ${w.paid.map((p) => moneyLabel(p.amount, p.currency)).join(" + ")}` : "0"),
    },
  ];

  return (
    <section className="mt-8 rounded-2xl border border-rule bg-surface px-5 py-5">
      <SectionTitle
        kicker="Funnel · real counts only"
        title="From visitor to payment"
        note="Counted, not estimated. The pipeline estimate and the model stay in the command centre, never here."
      />
      {funnel && w7 && w30 ? (
        <table className="data-table mt-3">
          <thead>
            <tr>
              <th>Step</th>
              <th className="text-right">7 days</th>
              <th className="text-right">30 days</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s) => (
              <tr key={s.label}>
                <td>
                  <span className="text-ink">{s.label}</span>
                  <span className="block text-[11px] text-muted">{s.note}</span>
                </td>
                <td className="text-right font-semibold">{s.get(w7)}</td>
                <td className="text-right">{s.get(w30)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-3 text-sm text-muted [overflow-wrap:anywhere]">
          Funnel not available: the database function af_desk_funnel is missing (apply supabase/migrations/0034_desk_funnel_and_surveys.sql) or the desk key was refused.
        </p>
      )}

      <div className="mt-6">
        <div>
          <p className="text-[13px] font-semibold text-ink">Moments that matter</p>
          {funnel && w7 && w30 ? (
            <table className="data-table mt-2">
              <thead>
                <tr>
                  <th>Action</th>
                  <th className="text-right">7 days</th>
                  <th className="text-right">30 days</th>
                </tr>
              </thead>
              <tbody>
                {ACTIONS.map(([k, label]) => (
                  <tr key={k}>
                    <td className="text-sm">{label}</td>
                    <td className="text-right text-sm font-semibold">{n(w7.actions[k])}</td>
                    <td className="text-right text-sm">{n(w30.actions[k])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-2 text-sm text-muted">Not available until migration 0034 is applied.</p>
          )}
          <p className="mt-1 text-[11px] text-muted">New click counts start on the day migration 0034 is applied; a zero before then means not yet counted.</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[13px] font-semibold text-ink">One-question surveys, 30 days</p>
        {funnel?.surveys.length ? (
          <div className="mt-2 grid gap-6 lg:grid-cols-2">
            {Object.keys(SURVEY_LABEL).map((q) => {
              const rows = funnel.surveys.filter((s) => s.question === q);
              return (
                <div key={q}>
                  <p className="text-[12px] text-muted">{SURVEY_LABEL[q]}</p>
                  <p className="mt-1 text-sm text-ink">{rows.length ? rows.map((r) => `${r.answer} ${r.n}`).join(" · ") : "No answers yet"}</p>
                </div>
              );
            })}
            {funnel.survey_notes.length ? (
              <ul className="divide-y divide-rule text-[13px] text-ink-soft lg:col-span-2">
                {funnel.survey_notes.map((s) => (
                  <li key={`${s.when}-${s.path}`} className="py-1.5">
                    “{s.note}” <span className="text-[12px] text-muted">· {s.question} on {s.path} · {when(s.when, now)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">{funnel ? "No answers yet." : "Not available until migration 0034 is applied."}</p>
        )}
      </div>
    </section>
  );
}
