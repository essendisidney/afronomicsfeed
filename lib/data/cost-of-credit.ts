import { computeKcci, type KcciReading } from "@/lib/cost-of-credit";
import { loadKenyaRates } from "@/lib/data/kenya-rates";
import { mobileLoanBoard } from "@/lib/data/mobile-loans";
import { renderTime } from "@/lib/data/fetcher";

/**
 * Feeds the Kenya Cost of Credit Index (lib/cost-of-credit.ts) from the files we hold: CBK's lending average
 * (data/kenya/rates.json) and the providers' published mobile-loan terms (data/kenya/mobile_loans.json). Nothing else.
 */
export function kcciLatest(asOf = new Date(renderTime()).toISOString().slice(0, 10)): { reading: KcciReading; bankSource: string | null } {
  const file = loadKenyaRates();
  const row = [...(file.bank_rates?.rows ?? [])].sort((a, b) => b.month.localeCompare(a.month))[0];
  const bankSource = file.bank_rates?.source ?? null;
  const reading = computeKcci({
    asOf,
    bank: row && bankSource ? { month: row.month, lending: row.lending, source: bankSource } : null,
    mobile: mobileLoanBoard().map((l) => ({
      product: l.product,
      provider: l.provider,
      source: l.source,
      readOn: l.read_on,
      termCostPct: l.termCostPct,
      days: l.days,
      from: l.from,
    })),
  });
  return { reading, bankSource };
}
