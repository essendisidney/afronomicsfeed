import Link from "next/link";
import { SectionTitle } from "@/components/data/parts";
import { TableScroll } from "@/components/ui/DataTable";

/**
 * Stories that work (af_desk_signals, migration 0043): for each story, Receipt and lesson read in the last 30 days,
 * how many people came, how many read half and to the end, how many stayed 30 seconds, and what it produced (shares,
 * sign-ups made on the page). Then return rates by the week readers first came, and the searches that found nothing.
 * All counts are anonymous (lib/signals-core.ts). Feeds docs/editorial/hot-stories-calendar.md.
 */

export type Signals = {
  stories: { path: string; people: number; views: number; read_half: number; read_end: number; engaged_30: number; shares: number; signups: number }[];
  cohorts: { week: string; first: number; w1: number; w2_4: number; w5_12: number }[];
  search_misses: { query: string; count: number }[];
};

/** A share of views as a whole percent, or a dash while there is nothing to divide by. */
const pct = (n: number, of: number) => (of > 0 ? `${Math.round((100 * n) / of)}%` : "—");

export function SignalsPanel({ signals }: { signals: Signals | null }) {
  return (
    <section id="signals" className="scroll-mt-20">
      <SectionTitle
        kicker="Readers · last 30 days"
        title="Stories that work"
        note="Read to half / to the end and engaged are shares of views (one count per view). Counting began with migration 0043, so older stories show views without reading figures."
      />
      {!signals ? (
        <p className="mt-4 text-sm text-muted">Needs migration 0043 (supabase/migrations/0043_reader_signals.sql).</p>
      ) : (
        <div className="mt-4 space-y-8">
          {signals.stories.length ? (
            <TableScroll label="Stories that work">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Story</th>
                    <th className="text-right">People</th>
                    <th className="text-right">Read half</th>
                    <th className="text-right">To the end</th>
                    <th className="text-right">30 s+</th>
                    <th className="text-right">Shares</th>
                    <th className="text-right">Sign-ups</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.stories.map((s) => (
                    <tr key={s.path}>
                      <td className="text-xs">
                        <Link href={s.path} className="text-ink hover:text-forest [overflow-wrap:anywhere]">
                          {s.path.replace(/^\/(brief|receipts|learn|stories)\//, "").replace(/-/g, " ")}
                        </Link>
                        <span className="block text-[11px] text-muted">{s.path.split("/")[1]}</span>
                      </td>
                      <td className="text-right text-xs font-semibold">{s.people}</td>
                      <td className="text-right text-xs">{pct(s.read_half, s.views)}</td>
                      <td className="text-right text-xs">{pct(s.read_end, s.views)}</td>
                      <td className="text-right text-xs">{pct(s.engaged_30, s.views)}</td>
                      <td className="text-right text-xs">{s.shares}</td>
                      <td className="text-right text-xs">{s.signups}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
          ) : (
            <p className="text-sm text-muted">No story views in the last 30 days.</p>
          )}
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-[13px] font-semibold text-ink">Do readers come back?</p>
              {signals.cohorts.length ? (
                <TableScroll label="Return rates by first week" className="mt-2">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>First came</th>
                        <th className="text-right">New readers</th>
                        <th className="text-right">Back in week 1</th>
                        <th className="text-right">Weeks 2-4</th>
                        <th className="text-right">Weeks 5-12</th>
                      </tr>
                    </thead>
                    <tbody>
                      {signals.cohorts.map((c) => (
                        <tr key={c.week}>
                          <td className="text-xs">{c.week}</td>
                          <td className="text-right text-xs font-semibold">{c.first}</td>
                          <td className="text-right text-xs">{pct(c.w1, c.first)}</td>
                          <td className="text-right text-xs">{pct(c.w2_4, c.first)}</td>
                          <td className="text-right text-xs">{pct(c.w5_12, c.first)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableScroll>
              ) : (
                <p className="mt-2 text-sm text-muted">No first visits counted yet.</p>
              )}
              <p className="mt-1 text-[11px] text-muted">One count per browser, by the week it first came. A recent week is still filling in.</p>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-ink">Searched for, not found</p>
              {signals.search_misses.length ? (
                <ul className="mt-2 divide-y divide-rule">
                  {signals.search_misses.map((m) => (
                    <li key={m.query} className="flex justify-between gap-4 py-1.5 text-sm">
                      <span className="text-ink [overflow-wrap:anywhere]">{m.query.replace(/-/g, " ")}</span>
                      <span className="text-muted">{m.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted">No empty searches in the last 30 days.</p>
              )}
              <p className="mt-1 text-[11px] text-muted">Each is a story or tool idea. Words only; anything that could be contact details is never stored.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
