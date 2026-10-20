import type { Metadata } from "next";
import Link from "next/link";
import { CallItForm } from "@/components/data/CallItForm";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Questions } from "@/components/seo/Questions";
import { nextRound, scoreBoard, TENORS, type Guess, type Tenor } from "@/lib/call-it-core";
import { renderTime } from "@/lib/data/fetcher";
import { loadTbills, tenorLabel } from "@/lib/data/kenya-tbills";
import { loadLedger, publishedFor } from "@/lib/ledger";
import { site } from "@/lib/site";
import { fitDescription, fitTitle, withSocial } from "@/lib/seo";
import { rpcRead } from "@/lib/store";

export const revalidate = 300;

const nbo = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: "Africa/Nairobi" });
const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const d = (iso: string) => day.format(new Date(`${iso}T00:00:00Z`));
const pct = (n: number) => `${n.toFixed(2)}%`;

type Board = { entries: number; shown: (Guess & { handle: string })[] };

export const metadata: Metadata = withSocial(
  {
    title: fitTitle("Call it: guess Kenya's T-bill rates before the CBK auction"),
    description: fitDescription(
      "Before bids close each Thursday, call the 91-, 182- and 364-day Treasury bill rates. When the CBK publishes, every call is scored against the result and against our own published range. Free.",
    ),
    alternates: { canonical: `${site.url}/markets/kenya-tbills/call-it` },
  },
  "/markets/kenya-tbills/call-it",
);

async function board(valueDate: string): Promise<Board | null> {
  const r = await rpcRead("af_call_it_board", { p_value_date: valueDate }, 120);
  return r.ok && r.value ? (r.value as Board) : null;
}

export default async function CallItPage() {
  const now = new Date(renderTime()).toISOString();
  const round = nextRound(now, loadLedger().rows);
  const ours = publishedFor(round.valueDate);
  const rows = loadTbills().rows;
  const lastDate = rows[0]?.value_date ?? null;
  const actual: Partial<Record<Tenor, number>> = {};
  for (const r of rows) if (r.value_date === lastDate && actual[r.tenor] == null) actual[r.tenor] = r.weighted_avg_rate;
  const lastOurs = lastDate ? publishedFor(lastDate) : new Map();

  const [current, last] = await Promise.all([board(round.valueDate), lastDate ? board(lastDate) : Promise.resolve(null)]);
  const open = current != null; // the board function answers once migration 0044 is applied
  const scored = last ? scoreBoard(last.shown, actual) : [];
  const start = { g91: actual[91]?.toFixed(2) ?? "", g182: actual[182]?.toFixed(2) ?? "", g364: actual[364]?.toFixed(2) ?? "" };
  const closesLabel = nbo.format(new Date(round.closesAt));

  const items = [
    { q: "How is a call scored?", a: "By how far it is from the weighted average rate the CBK accepts, in basis points (0.01 of a percentage point), averaged over the bills you called. The smallest miss wins the week." },
    { q: "When does a round close?", a: "When bids for the auction close, at 2 p.m. Nairobi time on the Thursday. Until then you can change your call as often as you like; the last one counts." },
    { q: "Is this investment advice?", a: "No. It is a game about where a published rate will land. It does not tell anyone to buy or sell anything." },
  ];

  return (
    <PageShell
      share={{ path: "/markets/kenya-tbills/call-it", campaign: "tool" }}
      crumbs={[{ href: "/", label: "Today" }, { href: "/markets/kenya-tbills", label: "Kenya T-bills" }, { label: "Call it" }]}
      kicker="Weekly game · Kenya T-bills"
      title="Call this week’s T-bill rates"
      lede={
        <p>
          Before bids close, say where Thursday&rsquo;s Treasury bill averages will land. When the CBK publishes, every call is scored against the result,
          and against our own range. This round closes {closesLabel}, for bills dated {d(round.valueDate)}.
        </p>
      }
    >
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          {open ? (
            <CallItForm start={start} closesLabel={closesLabel} />
          ) : (
            <p className="rounded-2xl border border-rule bg-surface px-5 py-5 text-[15px] text-ink-soft">
              Call it opens soon. Until then, see{" "}
              <Link href="/markets/kenya-tbills/auction" className="font-semibold text-forest underline underline-offset-2">
                our range for the next auction
              </Link>
              .
            </p>
          )}
          {open ? <p className="mt-2 text-[13px] text-muted tabular">{current.entries ? `${current.entries} call${current.entries === 1 ? "" : "s"} in so far this round.` : "Be the first to call this round."}</p> : null}
        </div>
        <aside className="min-w-0 lg:col-span-2">
          <SectionTitle kicker="To beat" title="Our range for this auction" />
          {ours.size ? (
            <ul className="mt-3 divide-y divide-rule text-[14px]">
              {TENORS.filter((t) => ours.has(t)).map((t) => (
                <li key={t} className="flex justify-between gap-3 py-2">
                  <span className="text-ink">{tenorLabel[t]}</span>
                  <span className="tabular text-ink-soft">
                    {pct(ours.get(t)!.low)} to {pct(ours.get(t)!.high)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[14px] text-muted">Our range is published here once the forecast for this auction is in the ledger.</p>
          )}
          <p className="mt-2 text-[12px] text-muted">
            Published before bids close and graded in public on <Link href="/record" className="underline underline-offset-2">our record</Link>.
          </p>
        </aside>
      </div>

      {lastDate ? (
        <section aria-labelledby="last-h" className="mt-12">
          <SectionTitle
            kicker="Last round"
            title={`Results for bills dated ${d(lastDate)}`}
            note={`CBK weighted averages: ${TENORS.filter((t) => actual[t] != null).map((t) => `${tenorLabel[t]} ${pct(actual[t]!)}`).join(", ")}.`}
          />
          {scored.length ? (
            <div className="table-box mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="Last round's board (scrolls sideways)">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th className="text-right">Average miss</th>
                    <th className="text-right">Bills called</th>
                  </tr>
                </thead>
                <tbody>
                  {scored.slice(0, 20).map((s, i) => (
                    <tr key={`${s.handle}-${i}`}>
                      <td data-num>{i + 1}</td>
                      <th scope="row">{s.handle}</th>
                      <td data-num className="text-right">
                        {s.missBps.toFixed(1)} bps
                      </td>
                      <td data-num className="text-right">
                        {s.tenors}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-3 text-[14px] text-muted">{last?.entries ? `${last.entries} call${last.entries === 1 ? "" : "s"} last round; none chose to show a name.` : "No calls last round. This week can be the first board."}</p>
          )}
          {lastOurs.size ? (
            <p className="mt-3 text-[13px] text-ink-soft">
              Our range last round:{" "}
              {TENORS.filter((t) => lastOurs.has(t) && actual[t] != null)
                .map((t) => {
                  const r = lastOurs.get(t)!;
                  const inside = actual[t]! >= r.low && actual[t]! <= r.high;
                  return `${tenorLabel[t]} ${pct(r.low)}–${pct(r.high)} (${inside ? "held" : "missed"})`;
                })
                .join(" · ")}
              .
            </p>
          ) : null}
        </section>
      ) : null}

      <p className="mt-8 text-sm text-ink-soft">
        <em>A game, not advice.</em> Rates are the CBK&rsquo;s weighted averages of accepted bids, from its published results.
      </p>
      <Questions items={items} />
    </PageShell>
  );
}
