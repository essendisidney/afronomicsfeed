import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { billMarkets, loadBillMarket } from "@/lib/data/sovereign-bills";
import { loadBonds } from "@/lib/data/kenya-bonds";
import { loadKenyaRates } from "@/lib/data/kenya-rates";
import { renderTime } from "@/lib/data/fetcher";
import { rpc } from "@/lib/store";
import { DeskKey } from "./DeskKey";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Desk", robots: { index: false, follow: false } };

type Desk = {
  views_by_day: { day: string; views: number }[];
  views_7d: number;
  views_prev_7d: number;
  top_pages: { path: string; views: number }[];
  referrers: { host: string; views: number }[];
  countries: { country: string; views: number }[];
  downloads_7d: { path: string; views: number }[];
  api_7d: { path: string; caller: string; calls: number }[];
  embeds_7d: { path: string; host: string; views: number }[];
  subscribers: number;
  subscribers_7d: number;
  unsubscribed_7d: number;
  alert_subs: number;
  alert_subs_7d: number;
  leads: { when: string; organisation: string | null; interest: string; message: string | null; name: string | null; email: string }[];
  leads_total: number;
  feedback: { when: string; path: string; found: boolean; role: string | null; looking_for: string | null }[];
  feedback_found_rate: number | null;
  fx_last_day: string | null;
  wire_last: string | null;
  wire_24h: number;
  push_state: { market: string; last_date: string }[];
};

const DAY = 86400000;
const ago = (iso: string | null, now: number) => {
  if (!iso) return "never";
  const h = (now - Date.parse(iso)) / 3600000;
  return h < 1 ? `${Math.round(h * 60)} min ago` : h < 48 ? `${Math.round(h)} h ago` : `${Math.round(h / 24)} d ago`;
};
const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

function Stat({ label, value, note, tone }: { label: string; value: string | number; note?: string; tone?: "up" | "down" | "warn" }) {
  return (
    <div className="bg-surface px-4 py-4">
      <p className="text-[12px] text-muted">{label}</p>
      <p className={`mt-1 font-serif text-3xl ${tone === "warn" ? "text-down" : "text-ink"}`}>{value}</p>
      {note ? <p className={`mt-0.5 text-[12px] ${tone === "up" ? "text-up" : tone === "down" ? "text-down" : "text-muted"}`}>{note}</p> : null}
    </div>
  );
}

function Bars({ rows, now }: { rows: { day: string; views: number }[]; now: number }) {
  const max = Math.max(1, ...rows.map((r) => r.views));
  const days: { day: string; views: number }[] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(now - i * DAY).toISOString().slice(0, 10);
    days.push({ day: d, views: rows.find((r) => r.day === d)?.views ?? 0 });
  }
  return (
    <div className="flex h-28 items-end gap-[3px]">
      {days.map((d) => (
        <div key={d.day} className="flex-1" title={`${dayFmt.format(new Date(d.day))}: ${d.views} views`}>
          <div className="w-full rounded-t-sm bg-accent" style={{ height: `${Math.max(2, (d.views / max) * 100)}%` }} />
        </div>
      ))}
    </div>
  );
}

export default async function DeskPage() {
  const key = (await cookies()).get("af_desk")?.value ?? "";
  const result = key ? await rpc("af_desk", { p_secret: key }) : null;
  const desk = result?.ok && result.value ? (result.value as Desk) : null;

  if (!desk) {
    return (
      <PageShell crumbs={[{ href: "/", label: "Home" }, { label: "Desk" }]} kicker="Private" title="The desk">
        <p className="max-w-xl text-sm text-ink-soft">The owner’s view of Afronomics: traffic, downloads, API use, sign-ups, leads, feedback and pipeline health. Enter the desk key.</p>
        <div className="mt-6 max-w-sm">
          <DeskKey wrong={Boolean(key)} />
        </div>
      </PageShell>
    );
  }

  // Pipeline freshness from the repo files, so a stalled extractor shows here before anyone notices.
  const now = renderTime();
  const freshness = billMarkets.map((m) => {
    const rows = loadBillMarket(m.slug).rows;
    const last = rows[0]?.date ?? null;
    const age = last ? Math.round((now - Date.parse(last)) / DAY) : null;
    const expect = m.slug === "nigeria" || m.slug === "tanzania" || m.slug === "zambia" || m.slug === "uganda" ? 21 : 10;
    return { name: m.country, last, age, stale: age == null || age > expect };
  });
  const bonds = loadBonds().rows[0]?.value_date ?? null;
  const rates = loadKenyaRates();
  const change = desk.views_prev_7d ? Math.round(((desk.views_7d - desk.views_prev_7d) / desk.views_prev_7d) * 100) : null;
  const apiCalls = desk.api_7d.reduce((n, r) => n + r.calls, 0);
  const downloads = desk.downloads_7d.reduce((n, r) => n + r.views, 0);

  return (
    <PageShell crumbs={[{ href: "/", label: "Home" }, { label: "Desk" }]} kicker={`Private · ${new Date(now).toUTCString().replace(" GMT", " UTC")}`} title="The desk">
      <section className="grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Page views, 7 days" value={desk.views_7d} note={change == null ? "no prior week" : `${change > 0 ? "+" : ""}${change}% vs prior week`} tone={change == null ? undefined : change >= 0 ? "up" : "down"} />
        <Stat label="Subscribers" value={desk.subscribers} note={`+${desk.subscribers_7d} this week${desk.unsubscribed_7d ? `, −${desk.unsubscribed_7d}` : ""}`} tone="up" />
        <Stat label="Alert sign-ups" value={desk.alert_subs} note={`+${desk.alert_subs_7d} this week`} />
        <Stat label="Data downloads, 7 days" value={downloads} />
        <Stat label="API calls, 7 days" value={apiCalls} />
        <Stat label="Leads" value={desk.leads_total} note={desk.feedback_found_rate == null ? "no feedback yet" : `${desk.feedback_found_rate}% found what they came for`} />
      </section>

      <section className="mt-10">
        <SectionTitle kicker="Traffic" title="Views, last 30 days" />
        <div className="mt-4">
          <Bars rows={desk.views_by_day} now={now} />
        </div>
      </section>

      <section className="mt-10 grid gap-10 lg:grid-cols-3">
        <div>
          <SectionTitle kicker="7 days" title="Top pages" />
          <table className="data-table mt-2">
            <tbody>
              {desk.top_pages.map((r) => (
                <tr key={r.path}>
                  <td className="text-xs">
                    <Link href={r.path} className="hover:text-forest">
                      {r.path}
                    </Link>
                  </td>
                  <td className="text-right text-xs">{r.views}</td>
                </tr>
              ))}
              {!desk.top_pages.length ? <tr><td className="text-xs text-muted">No views yet</td></tr> : null}
            </tbody>
          </table>
        </div>
        <div>
          <SectionTitle kicker="7 days" title="Where visitors came from" />
          <table className="data-table mt-2">
            <tbody>
              {desk.referrers.map((r) => (
                <tr key={r.host}>
                  <td className="text-xs">{r.host}</td>
                  <td className="text-right text-xs">{r.views}</td>
                </tr>
              ))}
              {desk.countries.map((r) => (
                <tr key={`c-${r.country}`}>
                  <td className="text-xs text-muted">{r.country}</td>
                  <td className="text-right text-xs text-muted">{r.views}</td>
                </tr>
              ))}
              {!desk.referrers.length && !desk.countries.length ? <tr><td className="text-xs text-muted">Nothing yet</td></tr> : null}
            </tbody>
          </table>
        </div>
        <div>
          <SectionTitle kicker="7 days" title="Downloads, API and embeds" />
          <table className="data-table mt-2">
            <tbody>
              {desk.downloads_7d.map((r) => (
                <tr key={r.path}>
                  <td className="text-xs">{r.path.replace("/download/api/data/", "")}</td>
                  <td className="text-right text-xs">{r.views}</td>
                </tr>
              ))}
              {desk.api_7d.map((r) => (
                <tr key={`${r.path}-${r.caller}`}>
                  <td className="text-xs">
                    {r.path.replace("/api/v1/", "api: ")} <span className="text-muted">{r.caller}</span>
                  </td>
                  <td className="text-right text-xs">{r.calls}</td>
                </tr>
              ))}
              {desk.embeds_7d.map((r) => (
                <tr key={`${r.path}-${r.host}`}>
                  <td className="text-xs">
                    {r.path.replace("/embed/", "embed: ")} <span className="text-muted">{r.host}</span>
                  </td>
                  <td className="text-right text-xs">{r.views}</td>
                </tr>
              ))}
              {!desk.downloads_7d.length && !desk.api_7d.length && !desk.embeds_7d.length ? <tr><td className="text-xs text-muted">Nothing yet</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <SectionTitle kicker="Demand" title="Latest leads" />
          <ul className="mt-2 divide-y divide-rule">
            {desk.leads.map((l) => (
              <li key={`${l.when}-${l.email}`} className="py-3 text-sm">
                <p className="font-medium text-ink">
                  {l.name || l.email} {l.organisation ? <span className="text-muted">· {l.organisation}</span> : null}
                </p>
                <p className="text-[12px] text-muted">
                  {l.interest} · {ago(l.when, now)} · <a href={`mailto:${l.email}`} className="underline">{l.email}</a>
                </p>
                {l.message ? <p className="mt-1 text-[13px] text-ink-soft">{l.message}</p> : null}
              </li>
            ))}
            {!desk.leads.length ? <li className="py-3 text-sm text-muted">No enquiries yet</li> : null}
          </ul>
        </div>
        <div>
          <SectionTitle kicker="Readers" title="Latest feedback" />
          <ul className="mt-2 divide-y divide-rule">
            {desk.feedback.map((f) => (
              <li key={`${f.when}-${f.path}`} className="py-3 text-sm">
                <p className="text-ink">
                  <span className={f.found ? "text-up" : "text-down"}>{f.found ? "Found it" : "Didn’t find it"}</span> on {f.path}{" "}
                  <span className="text-muted">· {f.role ?? "no role"} · {ago(f.when, now)}</span>
                </p>
                {f.looking_for ? <p className="mt-1 text-[13px] text-ink-soft">“{f.looking_for}”</p> : null}
              </li>
            ))}
            {!desk.feedback.length ? <li className="py-3 text-sm text-muted">No feedback yet</li> : null}
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <SectionTitle kicker="Pipelines" title="Is the data fresh?" note="Red means an extractor has not delivered within the market’s normal cycle." />
        <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-3 lg:grid-cols-6">
          {freshness.map((f) => (
            <div key={f.name} className="bg-surface px-4 py-3">
              <p className="text-[12px] text-muted">{f.name} bills</p>
              <p className={`font-serif text-xl ${f.stale ? "text-down" : "text-ink"}`}>{f.age == null ? "none" : `${f.age} d`}</p>
              <p className="text-[11px] text-muted">{f.last ?? ""}</p>
            </div>
          ))}
          <div className="bg-surface px-4 py-3">
            <p className="text-[12px] text-muted">Kenya bonds</p>
            <p className={`font-serif text-xl ${bonds && now - Date.parse(bonds) < 45 * DAY ? "text-ink" : "text-down"}`}>{bonds ? `${Math.round((now - Date.parse(bonds)) / DAY)} d` : "none"}</p>
          </div>
          <div className="bg-surface px-4 py-3">
            <p className="text-[12px] text-muted">Kenya rates</p>
            <p className={`font-serif text-xl ${rates.updated_at && now - Date.parse(rates.updated_at) < 3 * DAY ? "text-ink" : "text-down"}`}>{rates.updated_at ? ago(rates.updated_at, now) : "none"}</p>
          </div>
          <div className="bg-surface px-4 py-3">
            <p className="text-[12px] text-muted">FX archive</p>
            <p className={`font-serif text-xl ${desk.fx_last_day && now - Date.parse(desk.fx_last_day) < 2 * DAY ? "text-ink" : "text-down"}`}>{desk.fx_last_day ?? "none"}</p>
          </div>
          <div className="bg-surface px-4 py-3">
            <p className="text-[12px] text-muted">Wire archive</p>
            <p className={`font-serif text-xl ${desk.wire_24h > 0 ? "text-ink" : "text-down"}`}>{desk.wire_24h} / 24h</p>
            <p className="text-[11px] text-muted">{ago(desk.wire_last, now)}</p>
          </div>
          <div className="bg-surface px-4 py-3">
            <p className="text-[12px] text-muted">Alert checker</p>
            <p className="font-serif text-xl text-ink">{desk.push_state.length} markets</p>
          </div>
        </div>
      </section>

      <p className="mt-10 text-xs text-muted">
        Counts come from the privacy-first page counter (no cookies, no IPs). Leads and feedback are what people typed. GitHub Actions and Vercel logs hold the rest.
      </p>
    </PageShell>
  );
}
