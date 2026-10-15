/**
 * The net salary calculator (/rates/kenya/net-salary): from gross monthly pay to take-home pay in Kenya, with every
 * deduction shown. Pure arithmetic with no imports, so it runs in the browser and in tests (tests/site/test_salary_calc.py).
 * Rates come from data/kenya/payroll_rates.json (KRA, SHA, NSSF). The order is KRA's: SHIF, the Housing Levy and
 * pension contributions (NSSF included, up to the cap) come off before PAYE; personal relief comes off the tax.
 */

export type PayrollRates = {
  checked: string;
  sources: { paye: string; shif: string; housing_levy: string; nssf: string };
  paye: {
    bands: { width: number | null; rate: number }[];
    personal_relief: number;
    pension_cap: number;
    mortgage_interest_cap: number;
    post_retirement_medical_cap: number;
  };
  shif: { rate_pct: number; minimum: number };
  housing_levy: { employee_pct: number; employer_pct: number };
};

export type SalaryInput = {
  gross: number;
  nssf: number; // from the payslip
  pension?: number; // other pension contributions (a registered scheme), on top of NSSF
  mortgageInterest?: number;
  postRetirementMedical?: number;
};

export type SalaryResult = {
  gross: number;
  shif: number;
  housingLevy: number;
  nssf: number;
  pension: number;
  pensionAllowed: number; // NSSF + pension that comes off before tax, after the cap
  otherAllowed: number; // mortgage interest and post-retirement medical, after their caps
  taxable: number;
  taxBeforeRelief: number;
  relief: number;
  paye: number;
  totalDeductions: number;
  net: number;
  employerHousingLevy: number;
  bands: { from: number; to: number | null; rate: number; taxed: number; tax: number }[];
};

const pos = (n: number | undefined) => (n && n > 0 ? n : 0);

export function shif(r: PayrollRates, gross: number) {
  return gross > 0 ? Math.max(r.shif.minimum, (gross * r.shif.rate_pct) / 100) : 0;
}

/** Tax on monthly taxable pay before personal relief, band by band. */
export function payeBands(r: PayrollRates, taxable: number) {
  let left = Math.max(0, taxable);
  let from = 0;
  return r.paye.bands.map((b) => {
    const taxed = b.width == null ? left : Math.min(left, b.width);
    left -= taxed;
    const row = { from, to: b.width == null ? null : from + b.width, rate: b.rate, taxed, tax: (taxed * b.rate) / 100 };
    if (b.width != null) from += b.width;
    return row;
  });
}

export function netSalary(r: PayrollRates, input: SalaryInput): SalaryResult {
  const gross = pos(input.gross);
  const s = shif(r, gross);
  const hl = (gross * r.housing_levy.employee_pct) / 100;
  const nssf = pos(input.nssf);
  const pension = pos(input.pension);
  const pensionAllowed = Math.min(nssf + pension, r.paye.pension_cap);
  const otherAllowed = Math.min(pos(input.mortgageInterest), r.paye.mortgage_interest_cap) + Math.min(pos(input.postRetirementMedical), r.paye.post_retirement_medical_cap);
  const taxable = Math.max(0, gross - s - hl - pensionAllowed - otherAllowed);
  const bands = payeBands(r, taxable);
  const taxBeforeRelief = bands.reduce((t, b) => t + b.tax, 0);
  const relief = Math.min(r.paye.personal_relief, taxBeforeRelief);
  const paye = taxBeforeRelief - relief;
  // Mortgage interest and the medical fund lower the tax but are not taken from pay, so they do not reduce take-home.
  const totalDeductions = s + hl + nssf + pension + paye;
  return {
    gross,
    shif: s,
    housingLevy: hl,
    nssf,
    pension,
    pensionAllowed,
    otherAllowed,
    taxable,
    taxBeforeRelief,
    relief,
    paye,
    totalDeductions,
    net: gross - totalDeductions,
    employerHousingLevy: (gross * r.housing_levy.employer_pct) / 100,
    bands,
  };
}

/** The gross pay that leaves `net` take-home, the other inputs held fixed (for weighing a job offer). */
export function grossForNet(r: PayrollRates, net: number, rest: Omit<SalaryInput, "gross"> = { nssf: 0 }) {
  if (net <= 0) return 0;
  let lo = 0;
  let hi = net * 2 + 100_000;
  while (netSalary(r, { ...rest, gross: hi }).net < net) hi *= 2;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (netSalary(r, { ...rest, gross: mid }).net < net) lo = mid;
    else hi = mid;
  }
  return hi;
}

/** Of a raise of `step` on gross pay, how much reaches take-home (NSSF held as entered). */
export function keepOfRaise(r: PayrollRates, input: SalaryInput, step = 1000) {
  return netSalary(r, { ...input, gross: pos(input.gross) + step }).net - netSalary(r, input).net;
}
