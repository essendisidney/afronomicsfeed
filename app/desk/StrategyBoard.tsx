import fs from "node:fs";
import path from "node:path";
import { SectionTitle } from "@/components/data/parts";
import { billMarkets, loadBillMarket } from "@/lib/data/sovereign-bills";
import { BOARD, BOARD_UPDATED, DECISIONS, type Status } from "@/lib/strategy/board";

/**
 * The rest of the founder's command centre: model vs reality, the moat, the status board and decisions waiting.
 * Model figures are assumptions from scripts/financial_model.py (data/strategy/model.json), shown beside what was
 * actually collected and never mixed with it.
 */

type Model = { start: string; scenarios: Record<string, number[]>; institutions: Record<string, number[]> };
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const LABEL: Record<Status, string> = { live: "Live", build: "In build", parked: "Parked", idea: "Idea" };
const TONE: Record<Status, string> = { live: "text-forest", build: "text-ink", parked: "text-muted", idea: "text-accent" };

function readJson<T>(rel: string): T | null {
  const f = path.join(process.cwd(), rel);
  return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, "utf8")) as T) : null;
}

export function StrategyBoard({
  collectedThisMonthUsd,
  payingInstitutions,
  pilots,
  prospects,
  apiCalls7d,
  now,
}: {
  collectedThisMonthUsd: number;
  payingInstitutions: number;
  pilots: number;
  prospects: number;
  apiCalls7d: number;
  now: number;
}) {
  const model = readJson<Model>("data/strategy/model.json");
  const [y0, m0] = (model?.start ?? "2026-10").split("-").map(Number);
  const d = new Date(now);
  const month = (d.getUTCFullYear() - y0) * 12 + (d.getUTCMonth() + 1 - m0) + 1; // 1 = the model's first month
  const bondMarkets = ["kenya", "zambia", "egypt"].filter((c) =>
    c === "kenya" ? fs.existsSync(path.join(process.cwd(), "data/kenya/bond_auctions.json")) : fs.existsSync(path.join(process.cwd(), `data/${c}/bond_auctions.json`)),
  );
  const firstYear = Math.min(...billMarkets.map((m) => Number((loadBillMarket(m.slug).rows.at(-1)?.date ?? "9999").slice(0, 4))));
  const groups: Status[] = ["live", "build", "parked", "idea"];

  return (
    <section className="mt-8 grid gap-8 rounded-2xl border border-rule bg-surface px-5 py-5 lg:grid-cols-2">
      <div>
        <SectionTitle kicker="Model vs reality" title={`Month ${month} of the model`} note="Model = assumptions (scripts/financial_model.py). Reality = money collected. Never added together." />
        {model && month >= 1 && month <= 36 ? (
          <table className="data-table mt-3">
            <thead>
              <tr>
                <th>Scenario</th>
                <th className="text-right">Model revenue</th>
                <th className="text-right">Model institutions</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(model.scenarios).map((k) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td className="text-right">{usd(model.scenarios[k][month - 1] ?? 0)}</td>
                  <td className="text-right">{(model.institutions[k][month - 1] ?? 0).toFixed(1)}</td>
                </tr>
              ))}
              <tr>
                <td className="font-semibold text-ink">Reality</td>
                <td className="text-right font-semibold text-ink">{usd(collectedThisMonthUsd)}</td>
                <td className="text-right font-semibold text-ink">{payingInstitutions}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="mt-3 text-sm text-muted">Model data not found or out of range; run scripts/financial_model.py.</p>
        )}

        <p className="mt-6 text-[13px] font-semibold text-ink">The moat</p>
        <ul className="mt-2 space-y-1 text-sm text-ink-soft">
          <li>Proprietary data: bill auctions in {billMarkets.length} markets since {firstYear}; bond auctions in {bondMarkets.length} ({bondMarkets.join(", ")})</li>
          <li>Embeddedness: {pilots} pilot key{pilots === 1 ? "" : "s"} active; {apiCalls7d.toLocaleString("en-US")} API calls in 7 days</li>
          <li>Pipeline: {prospects} prospect{prospects === 1 ? "" : "s"} researched, none contacted until the founder sends the note</li>
          <li>Margins and net revenue retention: not measurable until there is revenue</li>
        </ul>
      </div>

      <div>
        <SectionTitle kicker={`Status board · updated ${BOARD_UPDATED}`} title="What is live, in build, parked, or an idea" />
        <div className="mt-3 space-y-4">
          {groups.map((g) => (
            <div key={g}>
              <p className={`text-[12px] font-semibold uppercase tracking-wide ${TONE[g]}`}>{LABEL[g]}</p>
              <ul className="mt-1 divide-y divide-rule text-sm">
                {BOARD.filter((b) => b.status === g).map((b) => (
                  <li key={b.name} className="py-1.5">
                    {b.href ? (
                      <a href={b.href} className="text-ink hover:text-forest">
                        {b.name}
                      </a>
                    ) : (
                      <span className="text-ink">{b.name}</span>
                    )}
                    <span className="block text-[12px] text-muted">{b.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[13px] font-semibold text-ink">Decisions waiting on you</p>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-ink-soft">
          {DECISIONS.map((x) => (
            <li key={x.ask}>
              <span className="text-ink">{x.ask}</span>
              <span className="block text-[12px] text-muted">{x.why}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
