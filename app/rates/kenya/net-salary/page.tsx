import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SalaryCalculator } from "@/components/data/SalaryCalculator";
import { SectionTitle } from "@/components/data/parts";
import { Questions } from "@/components/seo/Questions";
import { FollowUp } from "@/components/ui/FollowUp";
import { loadPayrollRates } from "@/lib/data/payroll-rates";
import { netSalary } from "@/lib/salary-calc";
import { site } from "@/lib/site";
import { fitDescription, fitTitle, withSocial } from "@/lib/seo";

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;
const longDate = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

export const metadata: Metadata = withSocial(
  {
    title: fitTitle("Net salary calculator Kenya: PAYE, SHIF, Housing Levy and take-home pay"),
    description: fitDescription(
      "From gross pay to take-home in Kenya, with KRA's PAYE bands, SHIF at 2.75%, the 1.5% Housing Levy and your NSSF. Or enter the take-home you want and see the gross to ask for. Free, no sign-up.",
    ),
    alternates: { canonical: `${site.url}/rates/kenya/net-salary` },
  },
  "/rates/kenya/net-salary",
);

export default function NetSalaryPage() {
  const r = loadPayrollRates();
  const at = (g: number) => netSalary(r, { gross: g, nssf: 0 });
  const examples = [20000, 30000, 50000, 75000, 100000, 150000, 250000, 500000];
  const items = [
    {
      q: "How is PAYE calculated in Kenya?",
      a: `On monthly taxable pay: 10% on the first KES 24,000, 25% on the next KES 8,333, 30% on the next KES 467,667, 32.5% on the next KES 300,000 and 35% above KES 800,000, less personal relief of ${kes(r.paye.personal_relief)} a month. Taxable pay is gross pay less SHIF, the Housing Levy and pension contributions including NSSF (up to ${kes(r.paye.pension_cap)} a month). These are KRA's rules, checked on ${longDate(r.checked)}.`,
    },
    {
      q: "How much is SHIF and the Housing Levy?",
      a: `SHIF is ${r.shif.rate_pct}% of gross pay, at least ${kes(r.shif.minimum)} a month. The Housing Levy is ${r.housing_levy.employee_pct}% of gross pay from you, and your employer pays another ${r.housing_levy.employer_pct}%. Both come off before PAYE is worked out.`,
    },
    {
      q: "What is the take-home on KES 50,000 in Kenya?",
      a: `About ${kes(at(50000).net)} before NSSF: PAYE ${kes(at(50000).paye)}, SHIF ${kes(at(50000).shif)} and Housing Levy ${kes(at(50000).housingLevy)}. NSSF then comes off and also lowers the PAYE a little; enter your payslip's NSSF figure in the calculator for your exact number.`,
    },
  ];

  return (
    <PageShell
      share={{ path: "/rates/kenya/net-salary", campaign: "tool" }}
      crumbs={[{ href: "/", label: "Today" }, { href: "/rates/kenya", label: "Kenya rates" }, { label: "Net salary calculator" }]}
      kicker="Pay and tax · Kenya"
      title="What will you actually take home?"
      lede={
        <p>
          Your gross pay, less PAYE, SHIF, the Housing Levy and NSSF, worked out with KRA’s own bands. Weighing a job offer? Enter the take-home you want and
          see the gross to ask for.
        </p>
      }
    >
      <SalaryCalculator rates={r} />

      <section aria-labelledby="table" className="mt-12">
        <SectionTitle kicker="Before NSSF" title="Take-home at common salaries" />
        <div className="table-box mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="Take-home at common salaries (scrolls sideways)">
          <table className="data-table">
            <thead>
              <tr>
                <th>Gross a month</th>
                <th className="text-right">PAYE</th>
                <th className="text-right">SHIF</th>
                <th className="text-right">Housing Levy</th>
                <th className="text-right">Take-home</th>
              </tr>
            </thead>
            <tbody>
              {examples.map((g) => {
                const x = at(g);
                return (
                  <tr key={g}>
                    <th scope="row" className="tabular">
                      {g.toLocaleString("en-US")}
                    </th>
                    <td data-num className="text-right">{Math.round(x.paye).toLocaleString("en-US")}</td>
                    <td data-num className="text-right">{Math.round(x.shif).toLocaleString("en-US")}</td>
                    <td data-num className="text-right">{Math.round(x.housingLevy).toLocaleString("en-US")}</td>
                    <td data-num className="text-right font-semibold">{Math.round(x.net).toLocaleString("en-US")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-muted">
          KES, before NSSF, which depends on your payslip. Rates checked by us on {longDate(r.checked)}:{" "}
          <a href={r.sources.paye} className="underline underline-offset-2">
            KRA PAYE
          </a>
          ,{" "}
          <a href={r.sources.shif} className="underline underline-offset-2">
            SHA premium rates
          </a>
          ,{" "}
          <a href={r.sources.housing_levy} className="underline underline-offset-2">
            KRA Housing Levy notice
          </a>
          ,{" "}
          <a href={r.sources.nssf} className="underline underline-offset-2">
            NSSF statement on contributions
          </a>
          .
        </p>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <SectionTitle kicker="KRA’s order" title="How your payslip is worked out" />
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-[14px] leading-6 text-ink-soft">
            <li>SHIF ({r.shif.rate_pct}%) and the Housing Levy ({r.housing_levy.employee_pct}%) are taken from gross pay.</li>
            <li>NSSF and other pension contributions, up to {kes(r.paye.pension_cap)} a month together, are taken off too.</li>
            <li>PAYE is worked out on what is left, band by band, then personal relief of {kes(r.paye.personal_relief)} comes off the tax.</li>
            <li>Take-home is gross pay less all of these. Loans, SACCO savings and union dues on a payslip come off after.</li>
          </ol>
        </div>
        <div>
          <SectionTitle kicker="Also see" title="More money tools" />
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            <li>
              <Link href="/markets/kenya-tbills/calculator" className="font-semibold text-forest underline underline-offset-2">
                Treasury bill calculator
              </Link>
            </li>
            <li>
              <Link href="/rates/kenya/mpesa-charges" className="font-semibold text-forest underline underline-offset-2">
                M-PESA and Fuliza charges
              </Link>
            </li>
            <li>
              <Link href="/rates/kenya/money-market-funds" className="font-semibold text-forest underline underline-offset-2">
                Where your savings earn most
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <FollowUp heading="Get the Morning: what money costs, every weekday" />
      <p className="mt-6 text-sm text-ink-soft">
        <em>Information, not advice.</em> Your employer’s payroll and KRA decide what you actually pay.
      </p>
      <Questions items={items} />
    </PageShell>
  );
}
