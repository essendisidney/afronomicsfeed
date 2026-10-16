"use client";

import { useState } from "react";
import { grossForNet, keepOfRaise, netSalary, type PayrollRates } from "@/lib/salary-calc";
import { toolDefaults } from "@/lib/tool-defaults";

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;
const num = (s: string) => Math.max(0, Number(s.replace(/[^\d.]/g, "")) || 0);
const pct = (n: number) => `${n.toFixed(1).replace(/\.0$/, "")}%`;

/**
 * Gross to take-home (or the take-home you want back to the gross to ask for), with every deduction in KRA's order.
 * NSSF is the reader's own payslip figure: NSSF has not published the year-four limits in a form we could source.
 */
export function SalaryCalculator({ rates }: { rates: PayrollRates }) {
  const [mode, setMode] = useState<"gross" | "net">("gross");
  const [amount, setAmount] = useState(String(toolDefaults.salary.gross));
  const [nssf, setNssf] = useState("");
  const [more, setMore] = useState({ pension: "", mortgage: "", medical: "" });

  const rest = { nssf: num(nssf), pension: num(more.pension), mortgageInterest: num(more.mortgage), postRetirementMedical: num(more.medical) };
  const gross = mode === "gross" ? num(amount) : grossForNet(rates, num(amount), rest);
  const r = netSalary(rates, { ...rest, gross });
  const raise = keepOfRaise(rates, { ...rest, gross });
  const rows = [
    { label: "PAYE (income tax)", value: r.paye, note: `${kes(r.taxBeforeRelief)} less personal relief of ${kes(r.relief)}` },
    { label: "SHIF (health)", value: r.shif, note: `${rates.shif.rate_pct}% of gross, at least ${kes(rates.shif.minimum)}` },
    { label: "Housing Levy", value: r.housingLevy, note: `${rates.housing_levy.employee_pct}% of gross` },
    { label: "NSSF", value: r.nssf, note: r.nssf ? "as on your payslip" : "enter it from your payslip" },
    ...(r.pension ? [{ label: "Other pension", value: r.pension, note: "your contribution" }] : []),
  ];

  const share =
    `On ${kes(r.gross)} gross a month in Kenya, take-home is ${kes(r.net)}: PAYE ${kes(r.paye)}, SHIF ${kes(r.shif)}, Housing Levy ${kes(r.housingLevy)}` +
    `${r.nssf ? `, NSSF ${kes(r.nssf)}` : ""}. Work out yours with KRA's own rates: https://www.afronomicsfeed.com/rates/kenya/net-salary?utm_source=whatsapp&utm_medium=share&utm_campaign=salary-calc`;

  const field = "mt-1 w-full rounded-lg border border-rule bg-surface px-3 py-2 text-[15px] text-ink";
  const setMoreField = (k: keyof typeof more) => (e: React.ChangeEvent<HTMLInputElement>) => setMore({ ...more, [k]: e.target.value });

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <section aria-labelledby="pay-in" className="rounded-2xl border border-rule bg-surface px-5 py-5 lg:col-span-2">
        <h2 id="pay-in" className="t-h2 text-ink">
          Your pay
        </h2>
        <div className="no-print mt-3 inline-flex rounded-full border border-rule p-1 text-[13px]" role="group" aria-label="What you are entering">
          {(
            [
              ["gross", "I know my gross"],
              ["net", "I want this take-home"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`min-h-11 rounded-full px-3 font-semibold ${mode === m ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="mt-4 block text-[13px] text-ink-soft">
          {mode === "gross" ? "Gross pay a month, before deductions (KES)" : "Take-home you want a month (KES)"}
          <input className={field} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label className="mt-3 block text-[13px] text-ink-soft">
          NSSF a month, from your payslip (KES)
          <input className={field} inputMode="numeric" placeholder="0" value={nssf} onChange={(e) => setNssf(e.target.value)} aria-describedby="nssf-note" />
        </label>
        <p id="nssf-note" className="mt-1 text-[12px] text-muted">
          Your share only (Tier I and Tier II together). NSSF says contributions stay at the Act’s “year four” rates; it does not list the limits, so we use
          your payslip rather than guess.
        </p>
        <details className="mt-4 text-[13px] text-ink-soft">
          <summary className="cursor-pointer font-semibold text-ink">More deductions that lower your tax</summary>
          <label className="mt-3 block">
            Other pension contributions a month (KES)
            <input className={field} inputMode="numeric" placeholder="0" value={more.pension} onChange={setMoreField("pension")} />
          </label>
          <label className="mt-3 block">
            Mortgage interest a month (KES)
            <input className={field} inputMode="numeric" placeholder="0" value={more.mortgage} onChange={setMoreField("mortgage")} />
          </label>
          <label className="mt-3 block">
            Post-retirement medical fund a month (KES)
            <input className={field} inputMode="numeric" placeholder="0" value={more.medical} onChange={setMoreField("medical")} />
          </label>
          <p className="mt-2 text-[12px] text-muted">
            KRA caps these: pension and NSSF together {kes(rates.paye.pension_cap)}, mortgage interest {kes(rates.paye.mortgage_interest_cap)}, the medical
            fund {kes(rates.paye.post_retirement_medical_cap)} a month. Mortgage interest and the medical fund lower your tax but are not taken from your pay.
          </p>
        </details>
      </section>

      <section aria-labelledby="pay-out" className="rounded-2xl border border-rule bg-surface px-5 py-5 lg:col-span-3">
        <h2 id="pay-out" className="sr-only">
          Your take-home
        </h2>
        {mode === "net" ? (
          <>
            <p className="text-[13px] text-muted">Gross to ask for</p>
            <p data-num className="tabular text-[2rem] font-semibold leading-tight text-ink">{kes(r.gross)}</p>
            <p className="mt-1 text-[13px] text-ink-soft">for a take-home of {kes(r.net)} a month</p>
          </>
        ) : (
          <>
            <p className="text-[13px] text-muted">Take-home a month</p>
            <p data-num className="tabular text-[2rem] font-semibold leading-tight text-ink">{kes(r.net)}</p>
            <p className="mt-1 text-[13px] text-ink-soft">
              {r.gross ? `${pct((r.net / r.gross) * 100)} of ${kes(r.gross)} gross · ${kes(r.net * 12)} a year` : "Enter your gross pay"}
            </p>
          </>
        )}

        <ul className="mt-4 divide-y divide-rule text-[14px]">
          {rows.map((x) => (
            <li key={x.label} className="flex items-baseline justify-between gap-4 py-2">
              <span>
                <span className="text-ink">{x.label}</span>
                <span className="block text-[11.5px] text-muted">{x.note}</span>
              </span>
              <span data-num className="tabular shrink-0 whitespace-nowrap text-ink">
                − {kes(x.value)}
              </span>
            </li>
          ))}
          <li className="flex items-baseline justify-between gap-4 py-2 font-semibold">
            <span className="text-ink">Total deductions</span>
            <span data-num className="tabular text-ink">
              {kes(r.totalDeductions)}
            </span>
          </li>
        </ul>

        <dl className="mt-4 grid gap-3 text-[13px] sm:grid-cols-2">
          <div className="rounded-xl border border-rule px-3 py-2">
            <dt className="text-muted">Of your next KES 1,000 raise, you keep</dt>
            <dd data-num className="tabular text-[1.1rem] font-semibold text-ink">
              {kes(raise)}
            </dd>
          </div>
          <div className="rounded-xl border border-rule px-3 py-2">
            <dt className="text-muted">Your employer also pays</dt>
            <dd data-num className="tabular text-[1.1rem] font-semibold text-ink">
              {kes(r.employerHousingLevy)} Housing Levy
            </dd>
            <dd className="text-[11.5px] text-muted">plus its NSSF share, matching yours</dd>
          </div>
        </dl>
        <p className="mt-3 text-[12px] text-muted">
          Tax is worked out on {kes(r.taxable)}: gross less SHIF, the Housing Levy{r.pension ? ", NSSF and pension" : r.nssf ? " and NSSF" : ""}
          {r.otherAllowed ? ", and the other deductions you entered" : ""}. A payslip can differ by a shilling or two from rounding, and benefits in kind
          (a car, housing) add to taxable pay.
        </p>

        <div className="no-print mt-4 flex flex-wrap gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(share)}`}
            target="_blank"
            rel="noopener noreferrer"
            data-track="share"
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-[13px] font-semibold text-paper hover:bg-forest"
          >
            Share on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(share)}
            className="inline-flex min-h-11 items-center rounded-full border border-rule px-4 text-[13px] font-semibold text-ink hover:border-accent"
          >
            Copy the result
          </button>
        </div>
      </section>
    </div>
  );
}
