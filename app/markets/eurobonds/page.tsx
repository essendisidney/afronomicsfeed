import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Questions } from "@/components/seo/Questions";
import { bondLabel, eurobondTable, loadEurobonds, type EurobondCountry, type EurobondRow } from "@/lib/data/eurobonds";
import { eurobondAnswers } from "@/lib/seo/answers";
import { site } from "@/lib/site";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const { title, description } = eurobondAnswers();
  return { title, description, alternates: { canonical: `${site.url}/markets/eurobonds` } };
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const pts = (v: number | null) =>
  v == null ? <span className="text-muted">—</span> : Math.abs(v) < 0.005 ? <span className="text-muted">same</span> : (
    <span className={v > 0 ? "text-down" : "text-up"}>{`${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(2)}`}</span>
  );

/** Yield against years to maturity: the government's dollar borrowing curve on the day. */
function Curve({ rows }: { rows: EurobondRow[] }) {
  const W = 640;
  const H = 200;
  const pad = { l: 40, r: 12, t: 12, b: 28 };
  const maxX = Math.ceil(Math.max(...rows.map((r) => r.years)) / 5) * 5;
  const lo = Math.floor(Math.min(...rows.map((r) => r.yield)) - 0.5);
  const hi = Math.ceil(Math.max(...rows.map((r) => r.yield)) + 0.5);
  const x = (v: number) => pad.l + (v / maxX) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + ((hi - v) / (hi - lo)) * (H - pad.t - pad.b);
  const ticksY = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  const ticksX = Array.from({ length: maxX / 5 + 1 }, (_, i) => i * 5);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full max-w-3xl" role="img" aria-label="Yield by years to maturity">
      {ticksY.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="stroke-rule" strokeWidth={1} />
          <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" className="fill-muted text-[11px]">{`${t}%`}</text>
        </g>
      ))}
      {ticksX.map((t) => (
        <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-muted text-[11px]">{`${t}y`}</text>
      ))}
      <polyline fill="none" className="stroke-accent" strokeWidth={2} points={rows.map((r) => `${x(r.years)},${y(r.yield)}`).join(" ")} />
      {rows.map((r) => (
        <circle key={r.id} cx={x(r.years)} cy={y(r.yield)} r={3.5} className="fill-accent">
          <title>{`${bondLabel(r)}: ${r.yield.toFixed(2)}%`}</title>
        </circle>
      ))}
    </svg>
  );
}

function CountryBlock({ id, c }: { id: string; c: EurobondCountry }) {
  const rows = eurobondTable(c);
  const anyMonth = rows.some((r) => r.monthChange != null);
  const hasSize = rows.some((r) => r.size);
  const hasPrice = rows.some((r) => r.price != null);
  return (
    <section id={id} className="mt-12 scroll-mt-24">
      <SectionTitle
        kicker={`${c.country} · ${dateFmt.format(new Date(c.latest.date))}`}
        title={`${c.country}’s Eurobonds`}
        note={`${rows.length} bonds, as the ${c.publisher} publishes them. Change in percentage points.`}
      />
      <Curve rows={rows} />
      <div className="mt-4 overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bond</th>
              {hasSize ? <th className="text-right">Issued</th> : null}
              {hasPrice ? <th className="text-right">Price</th> : null}
              <th className="text-right">Yield</th>
              <th className="text-right">Day</th>
              {anyMonth ? <th className="text-right">4 weeks</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="text-sm">
                  {bondLabel(r)}
                  <span className="block text-[11px] text-muted">{r.years.toFixed(1)} years left</span>
                </td>
                {hasSize ? <td className="text-right text-sm text-ink-soft">{r.size ?? "—"}</td> : null}
                {hasPrice ? <td className="text-right text-sm">{r.price != null ? r.price.toFixed(3) : "—"}</td> : null}
                <td className="text-right text-sm font-semibold">{r.yield.toFixed(3)}%</td>
                <td className="text-right text-xs">{pts(r.dayChange)}</td>
                {anyMonth ? <td className="text-right text-xs">{pts(r.monthChange)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">
        Source:{" "}
        <a href={c.latest.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          {c.publisher}
        </a>{" "}
        (
        <a href={c.source_page} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          all reports
        </a>
        ). {c.note}
        {hasPrice ? " Price per US$100 of face value." : ""}
      </p>
    </section>
  );
}

export default function EurobondsPage() {
  const file = loadEurobonds();
  const countries = Object.entries(file?.countries ?? {});

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets", label: "Markets" }, { label: "Eurobond yields" }]}
      kicker="Afronomics dataset · dollar borrowing"
      title="What African governments pay to borrow in dollars"
      lede={
        <p>
          The yield on each Eurobond, the dollar bonds governments sell to foreign investors, read from the government&rsquo;s own published report
          and updated as each one publishes (Nigeria every business day, Kenya every week with the daily figures). The yield is what a buyer of the bond today would earn a year if they held it to the end;
          it is the market&rsquo;s price for lending to that government in dollars.
        </p>
      }
    >
      {!countries.length ? (
        <p className="text-sm text-muted">The first day&rsquo;s yields have not been read yet.</p>
      ) : (
        <>
          {countries.length > 1 ? (
            <nav className="flex flex-wrap gap-1.5">
              {countries.map(([id, c]) => (
                <a key={id} href={`#${id}`} className="rounded-full border border-rule bg-surface px-3 py-1 text-[13px] hover:border-accent">
                  {c.country}
                </a>
              ))}
            </nav>
          ) : null}
          {countries.map(([id, c]) => (
            <CountryBlock key={id} id={id} c={c} />
          ))}

          <section className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              ["Price and yield move opposite ways", "A bond pays a fixed coupon. When its price falls below 100, a buyer gets that coupon for less, so the yield rises above the coupon; when the price is above 100, the yield is below it."],
              ["A rising yield means dearer borrowing", "If yields rise, a new Eurobond would have to pay more. Banks and companies that borrow in dollars in the same country are often priced off the government’s yield."],
              ["Longer bonds usually pay more", "The curve above plots each bond’s yield against the years it has left. Lenders usually ask more to lend for longer; where the line bends down, they do not."],
            ].map(([t, d]) => (
              <div key={t}>
                <h3 className="font-serif text-xl text-ink">{t}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-soft">{d}</p>
              </div>
            ))}
          </section>

          <p className="mt-10 max-w-3xl text-xs leading-5 text-muted">
            Yields and prices are as each government publishes them; Afronomics computes only the years to maturity (to the middle of the
            maturity month) and the changes. Information, not advice. See also{" "}
            <Link href="/markets/borrowing-costs" className="underline underline-offset-2">
              what governments pay to borrow at home
            </Link>{" "}
            and{" "}
            <Link href="/rates/policy" className="underline underline-offset-2">
              central-bank policy rates
            </Link>
            .
          </p>
          <Questions items={eurobondAnswers().items} />
        </>
      )}
      <NewsletterBand />
    </PageShell>
  );
}
