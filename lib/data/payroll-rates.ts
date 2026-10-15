import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { PayrollRates } from "@/lib/salary-calc";

/** KRA's PAYE bands and reliefs, SHA's SHIF rate and the Housing Levy, copied by hand into data/kenya/payroll_rates.json. */
export const loadPayrollRates = cache((): PayrollRates => JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "kenya", "payroll_rates.json"), "utf8")) as PayrollRates);
