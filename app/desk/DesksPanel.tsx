import Link from "next/link";
import { SectionTitle } from "@/components/data/parts";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { TableScroll } from "@/components/ui/DataTable";
import { MANDATE_BASE, type DeskStatus, type NamedVerdicts, type Outcome } from "@/lib/desk/desks";

/**
 * The agent desks (UPGRADE U7, docs/desks/): each desk's mandate and its latest recorded run, then the named-verdict
 * gate (D-028): the count toward 30, corrections, the held Receipts and the right-of-reply log. Everything here is read
 * from files in the repository at the last deploy; nothing is written from this page.
 */

const TONE: Record<Outcome, BadgeTone> = { done: "up", quiet: "neutral", held: "warn", escalated: "warn", failed: "down" };

export function DesksPanel({ desks, named }: { desks: DeskStatus[]; named: NamedVerdicts | null }) {
  const count = named?.verdicts.length ?? 0;
  const target = named?.target ?? 30;
  return (
    <section id="desks" className="scroll-mt-20">
      <SectionTitle
        kicker="Desks · mandates and run logs"
        title={`${desks.length} desks, ${desks.filter((d) => d.last).length} with a run on record`}
        note="Each desk works to a written mandate in docs/desks/ so a person can take it over. The last run is read from the repository at the last deploy (docs/desks/logs/, the social log, the story log, the UI/UX audit, data/health.json); a commit that only touches docs/ or editions/ shows after the next deploy. Quiet runs are not logged."
      />
      <ul className="mt-2 divide-y divide-rule">
        {desks.map((d) => (
          <li key={d.slug} className="grid gap-x-4 gap-y-0.5 py-2.5 text-sm sm:grid-cols-[minmax(0,15rem)_1fr]">
            <div className="min-w-0">
              <a href={`${MANDATE_BASE}/${d.slug}.md`} className="font-medium text-ink hover:text-forest" target="_blank" rel="noopener noreferrer">
                {d.name}
              </a>
              <span className="block text-[12px] text-ink-soft">{d.when}</span>
              {d.quiet ? <span className="block text-[12px] text-muted">Quiet: “{d.quiet}”</span> : null}
            </div>
            <div className="min-w-0">
              {d.last ? (
                <>
                  <p className="text-[13px] text-ink [overflow-wrap:anywhere]">
                    <Badge tone={TONE[d.last.outcome]}>{d.last.outcome}</Badge> {d.last.summary}
                  </p>
                  <p className="text-[12px] text-muted">
                    {d.last.date}
                    {d.last.time ? ` ${d.last.time}` : ""} · {d.week} on record in 7 days · from {d.last.from}
                  </p>
                </>
              ) : (
                <p className="text-[13px] text-muted">No run on record yet (log: docs/desks/logs/{d.slug}/)</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div id="named" className="mt-8 scroll-mt-20">
        <SectionTitle
          kicker={`Named verdicts · D-028${named ? ` · updated ${named.updated}` : ""}`}
          title={named ? `${count} of ${target} named verdicts, ${named.corrections} correction${named.corrections === 1 ? "" : "s"}` : "Named-verdict file not found"}
          note={`A verdict naming a company, institution or person needs your one-tap approval until ${target} have run with no correction. A correction resets nothing; you decide whether the gate restarts. From data/desk/named-verdicts.json; corrections from the public log (/corrections).`}
        />
        {named ? (
          <>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-rule" role="img" aria-label={`${count} of ${target}`}>
              <div className="h-full bg-forest" style={{ width: `${Math.min(100, (count / target) * 100)}%` }} />
            </div>
            <TableScroll label="Named-company Receipts counted" className="mt-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Receipt</th>
                    <th>Names</th>
                    <th>Approved</th>
                    <th>Right of reply</th>
                  </tr>
                </thead>
                <tbody>
                  {named.verdicts.map((v) => (
                    <tr key={v.slug}>
                      <td className="text-xs">
                        <Link href={`/receipts/${v.slug}`} className="text-ink hover:text-forest [overflow-wrap:anywhere]">
                          {v.slug}
                        </Link>
                      </td>
                      <td className="text-xs">{v.names.join(", ")}</td>
                      <td className="text-xs">
                        {v.approved}
                        <span className="block text-[11px] text-muted">{v.how}</span>
                      </td>
                      <td className="text-xs text-ink-soft">{v.reply}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
            {named.held.length ? (
              <ul className="mt-3 space-y-1 text-[13px]" aria-label="Held named-company Receipts">
                {named.held.map((h) => (
                  <li key={h.slug} className="text-ink-soft">
                    <Badge tone="warn">held</Badge> <span className="[overflow-wrap:anywhere]">{h.slug}</span> ({h.names.join(", ")}): {h.why}
                  </li>
                ))}
              </ul>
            ) : null}

            <p className="mt-6 text-[13px] font-semibold text-ink">Right-of-reply log</p>
            {named.replies.length ? (
              <TableScroll label="Right-of-reply log" className="mt-2">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Receipt</th>
                      <th>Subject</th>
                      <th>Sent</th>
                      <th>Window ends</th>
                      <th>Reply</th>
                      <th>Quoted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {named.replies.map((r, i) => (
                      <tr key={`${r.receipt}-${i}`}>
                        <td className="text-xs [overflow-wrap:anywhere]">{r.receipt}</td>
                        <td className="text-xs">{r.subject}</td>
                        <td className="text-xs">{r.sent}</td>
                        <td className="text-xs">{r.window_ends}</td>
                        <td className="text-xs">{r.reply}</td>
                        <td className="text-xs">{r.quoted_on ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableScroll>
            ) : (
              <p className="mt-2 text-sm text-muted">
                None sent since the rule came in (22 Oct, D-028). Outgoing email is on hold (D-030), so each right-of-reply email waits for your yes. The
                three-working-day window starts on the day it is sent.
              </p>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
