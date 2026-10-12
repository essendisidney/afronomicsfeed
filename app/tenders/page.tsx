import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { TenderAlertForm } from "@/components/data/TenderAlertForm";
import { Questions } from "@/components/seo/Questions";
import { ShareRow } from "@/components/ui/ShareRow";
import { loadTenders, requestTime } from "@/lib/data/tenders";
import { site } from "@/lib/site";
import { CATEGORY_LABEL, PORTAL, TENDER_PRICE_KES, TRIAL_DAYS, closesLabel, matches, methodLabel, parseKeywords, type Tender } from "@/lib/tenders-core";

export const dynamic = "force-dynamic";

const PER_PAGE = 40;
type Search = { q?: string; cat?: string; closing?: string; sort?: string; page?: string; alerts?: string };

export function generateMetadata(): Metadata {
  const f = loadTenders();
  return {
    title: "Kenya government tenders open now — search and daily alerts",
    description: f
      ? `${f.tenders.length.toLocaleString("en-US")} Kenyan government tenders open for bids now, from ministries, counties, schools and hospitals. Search by what you supply and get new ones by email each morning. From the PPRA's open data.`
      : "Kenyan government tenders open for bids, from the Public Procurement Regulatory Authority's open data.",
    alternates: { canonical: `${site.url}/tenders` },
  };
}

const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Nairobi" });

function href(s: Search, change: Partial<Search>) {
  const next = { ...s, ...change, alerts: undefined };
  const q = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]);
  const str = q.toString();
  return `/tenders${str ? `?${str}` : ""}`;
}

/** Kenya's open government tenders, searchable, with paid daily alerts for the keywords a business supplies. */
export default async function TendersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const s = await searchParams;
  const f = loadTenders();
  const all = f?.tenders ?? [];
  const now = requestTime();
  const words = parseKeywords(s.q ?? "");
  const cat = s.cat && CATEGORY_LABEL[s.cat] ? s.cat : "";
  const within = s.closing === "3" || s.closing === "7" ? Number(s.closing) : 0;
  let rows: Tender[] = all.filter(
    (t) => (!words.length || matches(t, words)) && (!cat || t.category === cat) && (!within || closesLabel(t.closes, now).days <= within),
  );
  if (s.sort === "new") rows = [...rows].sort((a, b) => (b.first_seen === "before" ? "" : b.first_seen).localeCompare(a.first_seen === "before" ? "" : a.first_seen) || b.published.localeCompare(a.published));
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(s.page) || 1));
  const shown = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const filtered = words.length > 0 || cat || within;

  const byCat = Object.keys(CATEGORY_LABEL).map((c) => ({ c, n: all.filter((t) => t.category === c).length })).filter((x) => x.n);
  const buyers = Object.entries(all.reduce<Record<string, number>>((m, t) => ((m[t.buyer] = (m[t.buyer] ?? 0) + 1), m), {}))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);
  const closingWeek = all.filter((t) => closesLabel(t.closes, now).days <= 7).length;
  const dayAgo = now - 24 * 3600_000;
  const fresh = all.filter((t) => t.first_seen !== "before" && Date.parse(t.first_seen) > dayAgo).length;

  const items = [
    {
      q: "Where do I find government tenders in Kenya?",
      a: `Every public body publishes its tenders on the Public Procurement Information Portal, tenders.go.ke, run by the Public Procurement Regulatory Authority. This page lists the ${all.length.toLocaleString("en-US")} open now from its open data, searchable by what you supply; the documents and bids stay on the portal.`,
    },
    {
      q: "How do I get tender alerts in Kenya?",
      a: `Enter what you supply (for example “ICT, cleaning, Nakuru”) and your email above. You get every open tender that matches straight away, then each new one every morning. Free for ${TRIAL_DAYS} days, then KES ${TENDER_PRICE_KES} a month by M-Pesa.`,
    },
    {
      q: "What is AGPO?",
      a: "Access to Government Procurement Opportunities: by law, 30% of public procurement spending is reserved for enterprises owned by youth, women and persons with disabilities that hold an AGPO certificate from the National Treasury.",
    },
  ];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Kenya tenders" }]}
      kicker="Tenders · Kenya"
      title="Kenya government tenders open now"
      lede={
        <p>
          {all.length ? `${all.length.toLocaleString("en-US")} tenders` : "Tenders"} from ministries, counties, schools, hospitals and state agencies are open for bids
          {f?.published ? `, from the procurement regulator’s open data published ${longDate(f.published)}` : ""}. Search what you supply, or get each new match
          by email every morning.
        </p>
      }
    >
      {s.alerts ? (
        <p role="status" className="mb-6 rounded-xl border-l-4 border-forest bg-forest/5 px-4 py-3 text-[14px] text-ink">
          {s.alerts === "confirmed"
            ? "Your tender alerts are on. Your first list of open matches arrives with our next update, within a few hours, and new ones every morning after that."
            : s.alerts === "stopped"
              ? "Your tender alerts are stopped. You won’t get any more emails."
              : "That link didn’t work. It may be old: sign up again below."}
        </p>
      ) : null}

      <section className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-rule bg-rule">
        {[
          [all.length.toLocaleString("en-US"), "open for bids"],
          [closingWeek.toLocaleString("en-US"), "close within 7 days"],
          [fresh.toLocaleString("en-US"), "new in the last day"],
        ].map(([n, l]) => (
          <div key={l} className="bg-surface px-4 py-4">
            <p className="font-serif text-2xl text-ink">{n}</p>
            <p className="mt-1 text-[12px] text-muted">{l}</p>
          </div>
        ))}
      </section>

      <section id="alerts" className="mt-8 scroll-mt-24 rounded-2xl border-2 border-forest/30 bg-surface px-5 py-5">
        <p className="text-[17px] font-semibold text-ink">Get the tenders that fit your business, every morning</p>
        <p className="mt-1 mb-4 text-[14px] text-ink-soft">One email a day, only when a new tender matches. No more checking the portal.</p>
        <TenderAlertForm initialKeywords={words.join(", ")} />
        <p className="mt-3 text-[12px] text-muted">
          Already getting alerts?{" "}
          <Link href="/tenders/pay" className="underline underline-offset-2">
            Pay to keep them
          </Link>{" "}
          (KES {TENDER_PRICE_KES} a month or KES 5,000 a year, by M-Pesa, card or bank).
        </p>
      </section>

      <section className="mt-10">
        <form action="/tenders" className="grid gap-3 rounded-2xl border border-rule bg-surface px-4 py-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
          <label className="text-[13px] text-muted">
            Search titles and buyers
            <input name="q" defaultValue={s.q ?? ""} placeholder="e.g. laptops, borehole, Kisumu" className="mt-1 w-full rounded-lg border border-rule bg-paper px-3 py-2 text-[15px] text-ink" />
          </label>
          <label className="text-[13px] text-muted">
            Type
            <select name="cat" defaultValue={cat} className="mt-1 w-full rounded-lg border border-rule bg-paper px-3 py-2 text-[15px] text-ink">
              <option value="">All</option>
              {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[13px] text-muted">
            Closing
            <select name="closing" defaultValue={within ? String(within) : ""} className="mt-1 w-full rounded-lg border border-rule bg-paper px-3 py-2 text-[15px] text-ink">
              <option value="">Any time</option>
              <option value="7">Within 7 days</option>
              <option value="3">Within 3 days</option>
            </select>
          </label>
          <button type="submit" className="rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-paper hover:bg-forest">
            Search
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 text-[13px] text-muted">
          <p>
            {rows.length.toLocaleString("en-US")} {filtered ? "matching" : "open"} tender{rows.length === 1 ? "" : "s"}
            {pages > 1 ? ` · page ${page} of ${pages}` : ""}
            {filtered ? (
              <>
                {" · "}
                <Link href="/tenders" className="underline underline-offset-2">
                  clear
                </Link>
              </>
            ) : null}
          </p>
          <p>
            Sort:{" "}
            {s.sort === "new" ? (
              <Link href={href(s, { sort: undefined, page: undefined })} className="underline underline-offset-2">
                closing soonest
              </Link>
            ) : (
              <strong className="text-ink">closing soonest</strong>
            )}{" "}
            ·{" "}
            {s.sort === "new" ? (
              <strong className="text-ink">newest</strong>
            ) : (
              <Link href={href(s, { sort: "new", page: undefined })} className="underline underline-offset-2">
                newest
              </Link>
            )}
          </p>
        </div>

        {shown.length ? (
          <ul className="mt-3 divide-y divide-rule border-y border-rule">
            {shown.map((t) => {
              const c = closesLabel(t.closes, now);
              const isNew = t.first_seen !== "before" && Date.parse(t.first_seen) > now - 3 * 24 * 3600_000;
              return (
                <li key={t.id} className="py-3">
                  <p className="text-[15px] font-semibold leading-6 text-ink">
                    {isNew ? <span className="mr-2 rounded-full bg-forest/10 px-2 py-0.5 align-middle text-[11px] font-semibold text-forest">New</span> : null}
                    {t.title}
                  </p>
                  <p className="text-[13px] text-ink-soft">
                    <Link href={href({}, { q: t.buyer })} className="hover:text-forest">
                      {t.buyer}
                    </Link>
                    {" · "}
                    {CATEGORY_LABEL[t.category] ?? t.category}
                    {t.method ? ` · ${methodLabel(t.method)}` : ""}
                  </p>
                  <p className="text-[12px] text-muted">
                    Closes{" "}
                    <strong className={c.days <= 3 ? "text-accent" : "text-ink"}>
                      {c.date}, {c.time}
                    </strong>{" "}
                    ({c.when}){t.ref ? ` · ref ${t.ref}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 rounded-xl border border-rule bg-surface px-4 py-3 text-sm text-ink-soft">
            {all.length ? "No open tender matches that today. Get an email the morning one does:" : "The tender list is being read for the first time; check back within a few hours."}{" "}
            {all.length ? (
              <a href="#alerts" className="font-semibold text-forest underline underline-offset-2">
                set an alert
              </a>
            ) : null}
          </p>
        )}

        {pages > 1 ? (
          <nav className="mt-4 flex items-center justify-between text-[14px]" aria-label="Pages">
            {page > 1 ? (
              <Link href={href(s, { page: String(page - 1) })} className="font-semibold text-forest">
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            {page < pages ? (
              <Link href={href(s, { page: String(page + 1) })} className="font-semibold text-forest">
                Next →
              </Link>
            ) : null}
          </nav>
        ) : null}
        <p className="mt-3 text-[12px] text-muted">
          To bid: open the government portal,{" "}
          <a href={PORTAL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            tenders.go.ke
          </a>
          , search the tender’s title or reference, and download the documents there. Always read the full notice before bidding.
        </p>
      </section>

      {all.length ? (
        <section className="mt-12 grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle kicker="By type" title="What is being bought" />
            <ul className="mt-3 divide-y divide-rule text-sm">
              {byCat.map((x) => (
                <li key={x.c} className="flex justify-between py-2">
                  <Link href={href({}, { cat: x.c })} className="text-ink hover:text-forest">
                    {CATEGORY_LABEL[x.c]}
                  </Link>
                  <span className="text-muted">{x.n.toLocaleString("en-US")}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionTitle kicker="Buyers" title="Most open tenders" />
            <ul className="mt-3 divide-y divide-rule text-sm">
              {buyers.map(([b, n]) => (
                <li key={b} className="flex justify-between gap-3 py-2">
                  <Link href={href({}, { q: b })} className="text-ink hover:text-forest">
                    {b}
                  </Link>
                  <span className="text-muted">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <div className="mt-10">
        <ShareRow text="Every Kenyan government tender open now, searchable, with daily alerts:" path="/tenders" />
      </div>
      {f ? (
        <p className="mt-6 text-sm text-ink-soft">
          Source: Public Procurement Regulatory Authority, Public Procurement Information Portal,{" "}
          <a href={f.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            OCDS open data
          </a>{" "}
          for {f.financial_year}; read {longDate(f.read_at)}. Titles and buyers as published (capitals softened). Afronomics is not part of the government and
          does not handle bids.
        </p>
      ) : null}
      <Questions items={items} />
    </PageShell>
  );
}
