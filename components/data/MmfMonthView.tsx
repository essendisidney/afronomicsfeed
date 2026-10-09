import Link from "next/link";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Questions, type QA } from "@/components/seo/Questions";
import { RateAlertForm } from "@/components/ui/RateAlertForm";
import { ShareResult } from "@/components/ui/ShareResult";
import { loadHealth } from "@/lib/data/health";
import type { MonthRanking } from "@/lib/data/mmf-months";
import { mmfMonthSentence } from "@/lib/share-card";

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const when = (s: string) => dateFmt.format(new Date(s));
const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-GB")}`;
const p = (n: number) => `${n.toFixed(2)}%`;

export const BASE = "/rates/kenya/best-money-market-fund";

export function mmfMonthTitle(m: MonthRanking) {
  return `Best money market fund in Kenya, ${m.label}${m.complete ? "" : " (so far)"}`;
}

export function mmfMonthDescription(m: MonthRanking) {
  const top = m.rows[0];
  return top
    ? `${m.rows.length} Kenyan money market funds ranked by average yield in ${m.label}, after the 15% withholding tax. ${m.complete ? "First" : "Leading so far"}: ${top.name}, ${p(top.net)} after tax (${p(top.gross)} as published). Every figure from the fund manager. Information, not advice.`
    : `Kenyan money market funds ranked by average yield in ${m.label}, after tax.`;
}

function answers(m: MonthRanking): QA[] {
  const [a, b] = m.rows;
  if (!a) return [];
  const items: QA[] = [
    {
      q: `Which money market fund paid the most in Kenya in ${m.label}?`,
      a: `Of the ${m.rows.length} funds Afronomics reads, ${a.name} ${m.complete ? "had" : "has so far had"} the highest average yield in ${m.label}: ${p(a.gross)} a year as published, about ${p(a.net)} after the 15% withholding tax${b ? `, ahead of ${b.name} at ${p(b.net)} after tax` : ""}. Past yields are not a promise of future returns.`,
    },
    {
      q: "How much does KES 100,000 earn in a Kenyan money market fund?",
      a: `At ${a.name}’s ${m.label} average, about ${kes(1000 * a.net)} in a year after tax, if the yield held for the whole year (it will not stay exactly the same). At the lowest-ranked fund here, ${m.rows.at(-1)!.name}, about ${kes(1000 * m.rows.at(-1)!.net)}.`,
    },
    {
      q: "How is this ranking worked out?",
      a: "Afronomics reads each fund manager’s own published yield every weekday and averages the readings over the month. A fund that publishes only a monthly figure (in its fact sheet) is ranked on that figure and labelled. The ranking uses the effective annual yield as the manager publishes it, less Kenya’s 15% withholding tax on interest.",
    },
  ];
  return items;
}

export function MmfMonthView({ m, all }: { m: MonthRanking; all: MonthRanking[] }) {
  const top = m.rows[0];
  const others = all.filter((x) => x.month !== m.month);
  // Funds the data check flags (yield frozen on the manager's page): ranked, but with the warning beside them.
  const flagged = new Map(
    m.complete ? [] : (loadHealth()?.items ?? []).filter((x) => x.area === "Money market funds" && x.status === "late").map((x) => [x.name, x.detail] as const),
  );
  return (
    <PageShell
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/rates/kenya", label: "Kenya rates" },
        { href: "/rates/kenya/money-market-funds", label: "Money market funds" },
        { label: m.label },
      ]}
      kicker={`Afronomics ranking · ${m.complete ? "final" : `month to date, ${when(m.to)}`}`}
      title={mmfMonthTitle(m)}
      lede={
        <p>
          Kenya’s money market funds ranked by their average yield over {m.label}, after withholding tax. Every figure is the one each fund manager publishes
          on its own website or fact sheet, read by Afronomics {m.complete ? `from ${when(m.from)} to ${when(m.to)}` : `every weekday since ${when(m.from)}`}.
          {m.complete ? "" : " The ranking updates daily until the month ends."}
        </p>
      }
      aside={
        top ? (
          <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
            <p className="text-[13px] font-medium text-muted">{m.complete ? `Ranked first in ${m.label}` : "Leading this month"}</p>
            <p className="mt-1 font-serif text-3xl text-ink">{p(top.net)}</p>
            <p className="mt-1 text-[14px] text-ink">{top.name}</p>
            <p className="mt-1 text-[12px] text-muted">after tax · {p(top.gross)} as published</p>
          </div>
        ) : null
      }
    >
      {m.rows.length === 0 ? (
        <p className="text-sm text-muted">No fund yields were read in {m.label}.</p>
      ) : (
        <section id="ranking">
          <SectionTitle
            kicker="Ranking"
            title={`What KES 100,000 earns in a year at each fund’s ${m.label} average`}
            note="Average of the yields the manager published during the month; after-tax applies Kenya’s 15% withholding tax on interest for residents."
          />
          <div className="mt-4 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fund</th>
                  <th className="text-right">Average yield</th>
                  <th className="text-right">After tax</th>
                  <th className="text-right">KES 100,000, one year</th>
                  <th>Over the month</th>
                </tr>
              </thead>
              <tbody>
                {m.rows.map((f, i) => (
                  <tr key={f.name}>
                    <td className="text-xs text-muted">{i + 1}</td>
                    <td>
                      <a href={f.source} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-forest">
                        {f.name}
                      </a>
                      <span className="block text-[11px] text-muted">{f.manager}</span>
                      {flagged.has(f.name) ? (
                        <span className="block max-w-xs text-[11px] text-danger">
                          {flagged.get(f.name)!.replace(/^published yield/, "Yield")}
                        </span>
                      ) : null}
                    </td>
                    <td className="text-right">{p(f.gross)}</td>
                    <td className="text-right font-semibold">{p(f.net)}</td>
                    <td className="text-right">{kes(1000 * f.net)}</td>
                    <td className="text-xs text-muted">
                      {f.days == null
                        ? f.basis
                        : f.days === 1
                          ? "one reading"
                          : `${p(f.first)} → ${p(f.last)}, ${f.days} readings`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {m.pending.length ? (
            <p className="mt-3 max-w-3xl text-xs leading-5 text-muted">
              Not ranked yet: {m.pending.join(", ")}, which publish{m.pending.length === 1 ? "es" : ""} a monthly figure that is not out for {m.label} yet.
            </p>
          ) : null}
          <ShareResult spec={{ kind: "mmf_month", month: m.complete ? m.month : null }} text={`Best money market fund in Kenya, ${m.label}: ${mmfMonthSentence(m)}. The full ranking:`} />
          <p className="mt-3 max-w-3xl text-xs leading-5 text-muted">
            A fund’s published yield is its recent return annualised, not a promise of what it will pay; fees may be taken before or after it depending on
            the fund. A yield far above the Treasury bill usually means the fund holds longer or riskier paper. Check the fund’s own documents before you
            invest. This is information, not advice.
          </p>
        </section>
      )}

      <section className="mt-12 grid gap-6 rounded-2xl border border-rule bg-surface px-5 py-6 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl text-ink">Get the ranking every month</h2>
          <p className="mt-2 text-sm text-ink-soft">
            One email when each month’s ranking is final, with the top five funds after tax. Nothing else; stop with one click.
          </p>
        </div>
        <RateAlertForm kinds={["mmf_month"]} compact />
      </section>

      <p className="mt-10 text-sm text-ink-soft">
        Today’s yields, fund by fund, with daily history:{" "}
        <Link href="/rates/kenya/money-market-funds" className="font-medium text-forest underline underline-offset-2">
          money market fund yields
        </Link>
        . Funds against T-bills, SACCOs and banks:{" "}
        <Link href="/guides/where-your-shilling-earns-most" className="font-medium text-forest underline underline-offset-2">
          where your shilling earns most
        </Link>
        .
      </p>
      {others.length ? (
        <p className="mt-3 text-sm text-ink-soft">
          Other months:{" "}
          {others.map((x, i) => (
            <span key={x.month}>
              {i ? " · " : ""}
              <Link href={x.complete ? `${BASE}/${x.month}` : BASE} className="text-forest underline underline-offset-2">
                {x.label}
                {x.complete ? "" : " (so far)"}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
      <Questions items={answers(m)} />
      <NewsletterBand />
    </PageShell>
  );
}
