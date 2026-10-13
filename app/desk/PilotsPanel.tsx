import { SectionTitle } from "@/components/data/parts";
import { Badge } from "@/components/ui/Badge";
import { IssueApiKey, RevokeApiKey } from "./DeskActions";
import { marketsOf } from "./FunnelPanel";
import { pilotFlag, type KeyRow } from "./today-core";

/**
 * Every data key: usage, days used (the D-004 test counts pilots used on 5+ days), days left, and the flag to ask for
 * payment or to nudge. Revoke is one click. There is no safe "extend" function (a new key would be revealed here),
 * so an extension is the manual step from docs/sales/sales-operator.md §3, and only once the founder approves A3.
 */

const n = (v: number | null | undefined) => (v == null || Number.isNaN(v) ? "—" : v.toLocaleString("en-US"));
const DAY = 86400000;

function lastCall(iso: string | null, now: number) {
  if (!iso) return "never";
  const d = Math.floor((now - Date.parse(iso)) / DAY);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} d ago`;
}

export function PilotsPanel({ keys, now, daysKnown }: { keys: KeyRow[]; now: number; daysKnown: boolean }) {
  const live = keys.filter((k) => !k.revoked_at).sort((a, b) => (a.plan === "trial" ? 0 : 1) - (b.plan === "trial" ? 0 : 1) || b.created_at.localeCompare(a.created_at));
  const revoked = keys.filter((k) => k.revoked_at);
  const trials = live.filter((k) => k.plan === "trial");
  return (
    <section id="pilots" className="scroll-mt-20">
      <SectionTitle
        kicker="Pilots and keys"
        title={`${trials.length} live pilot${trials.length === 1 ? "" : "s"}, ${live.length - trials.length} paid or licensed key${live.length - trials.length === 1 ? "" : "s"}`}
        note="Ask for payment in the last week of a pilot when it is in use, or once it has been used on 5+ days. Nudge a pilot with no calls after day 7."
      />
      {live.length ? (
        <ul className="mt-4 grid gap-3 lg:grid-cols-2">
          {live.map((k) => {
            const f = pilotFlag(k, now);
            return (
              <li key={k.id} className="rounded-2xl border border-rule bg-surface px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 text-sm font-semibold text-ink [overflow-wrap:anywhere]">{k.label}</span>
                  {f.flag === "ask" ? <Badge tone="warn">Ask for payment</Badge> : f.flag === "nudge" ? <Badge>Nudge: idle</Badge> : f.flag === "expired" ? <Badge tone="down">Expired</Badge> : null}
                </div>
                <p className="mt-0.5 text-[12px] text-muted">
                  {k.plan}
                  {k.prefix ? <> · <code className="font-mono">{k.prefix}…</code></> : null} · issued {k.created_at.slice(0, 10)}
                  {k.plan === "trial" ? ` · day ${f.day}` : ""}
                  {f.daysLeft != null ? ` · ${f.daysLeft > 0 ? `${f.daysLeft} d left` : "ended"}` : " · no expiry"}
                </p>
                <dl className="mt-2 grid grid-cols-4 gap-2 text-center">
                  {[
                    ["Calls 7 d", n(k.calls_7d)],
                    ["Calls 30 d", n(k.calls_30d)],
                    ["Days used", daysKnown ? n(k.days_used) : "—"],
                    ["Last call", lastCall(k.last_used_at ?? k.last_day, now)],
                  ].map(([l, v]) => (
                    <div key={l} className="rounded-lg bg-paper-2 px-1 py-1.5">
                      <dt className="text-[10px] text-muted">{l}</dt>
                      <dd className="text-[13px] font-semibold tabular-nums text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 text-[11px] text-muted [overflow-wrap:anywhere]">Markets, 30 d: {k.paths_30d.length ? marketsOf(k.paths_30d).join(", ") : "none"}</p>
                <div className="mt-1">
                  <RevokeApiKey id={k.id} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">No live keys. Pilots get a key from the pilot form, or issue one below with plan “trial”.</p>
      )}
      {!daysKnown ? <p className="mt-2 text-[12px] text-muted">Days used per key needs migration 0040 (af_desk_today).</p> : null}
      {revoked.length ? <p className="mt-2 text-[12px] text-muted">{revoked.length} revoked key{revoked.length === 1 ? "" : "s"} not shown.</p> : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <details className="rounded-2xl border border-rule bg-surface px-4 py-3">
          <summary className="cursor-pointer text-[14px] font-semibold text-ink">Extend a pilot (manual steps)</summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13px] text-ink-soft">
            <li>Only once you have approved A3 (one 15-day extension per organisation, for keys used on 5+ days). Until then, extensions are your call each time.</li>
            <li>
              In the Supabase SQL editor run{" "}
              <code className="break-all font-mono text-[12px]">
                select af_trial_key_issue((select value from af_secrets where name = &apos;cron&apos;), &apos;&lt;their work email&gt;&apos;, &apos;Pilot extension: &lt;Organisation&gt;&apos;, 15);
              </code>
            </li>
            <li>The new key is shown once: paste it only into your reply to that person. “exists” means their current key is still live: wait until it ends; “limited” means the domain cap is reached.</li>
            <li>Move the deal’s next step to “Extension ends” and the date to today + 15.</li>
          </ol>
        </details>
        <details className="rounded-2xl border border-rule bg-surface px-4 py-3">
          <summary className="cursor-pointer text-[14px] font-semibold text-ink">Issue a key</summary>
          <div className="mt-3">
            <IssueApiKey />
          </div>
        </details>
      </div>
    </section>
  );
}
