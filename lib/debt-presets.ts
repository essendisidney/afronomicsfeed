import { loadKenyaRates } from "@/lib/data/kenya-rates";
import { loadMobileLoans } from "@/lib/data/mobile-loans";
import { loadMpesaTariffs } from "@/lib/data/mpesa-tariffs";
import type { Charge } from "@/lib/debt-plan";

/**
 * The kinds of debt the debt plan (/rates/kenya/debt-plan) offers, each with its charge from our own data: Fuliza's
 * daily fee bands (data/kenya/mpesa_tariffs.json), the mobile loans as their providers publish them
 * (data/kenya/mobile_loans.json, a 30-day charge taken as a month's) and the banks' average lending rate from the CBK
 * (data/kenya/rates.json). The last two kinds take the reader's own rate. Shared by the page and its share card.
 */
export type DebtPreset = { id: string; label: string; charge: Charge | null; note: string; source?: string };

const day = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
const monthName = (ym: string) => new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${ym}-01T00:00:00Z`));

export function debtPresets(): DebtPreset[] {
  const t = loadMpesaTariffs();
  const out: DebtPreset[] = [
    {
      id: "fuliza",
      label: "Fuliza",
      charge: { kind: "fuliza", bands: t.fuliza.daily },
      note: `Safaricom's daily fee for your balance band, for 30 days (checked ${day(t.checked)}). The one-off 1% access fee is left out.`,
      source: t.sources.fuliza,
    },
  ];
  for (const r of loadMobileLoans()) {
    if (r.basis === "access_plus_daily") continue; // Fuliza, above, by its bands
    const id = /m-shwari/i.test(r.product) ? "mshwari" : r.product.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-loan$/, "");
    const pct = r.basis === "per_day" ? r.pct * 30 : (r.pct * 30) / r.days;
    out.push({
      id,
      label: r.product.replace(/ loan$/, ""),
      charge: { kind: "monthly", pct },
      note: `${r.basis === "per_day" ? `${r.from ? "From " : ""}${r.pct}% a day` : `${r.pct}% for ${r.days} days`}, as ${r.provider} publishes it (read ${day(r.read_on)})${r.from ? "; your offer may cost more" : ""}.`,
      source: r.source,
    });
  }
  const rows = loadKenyaRates().bank_rates?.rows ?? [];
  const latest = rows.length ? rows.reduce((a, b) => (b.month > a.month ? b : a)) : null;
  if (latest) {
    out.push({
      id: "bank",
      label: "Bank loan (average rate)",
      charge: { kind: "monthly", pct: latest.lending / 12 },
      note: `${latest.lending.toFixed(2)}% a year, the banks' average lending rate in ${monthName(latest.month)} (CBK). For your own rate, pick "Other loan, % a year".`,
      source: loadKenyaRates().bank_rates!.source,
    });
  }
  out.push(
    { id: "year", label: "Other loan, % a year (bank, SACCO)", charge: null, note: "Interest on the reducing balance, as banks and most SACCOs charge it." },
    { id: "month", label: "Other loan, % a month (app, chama, shop)", charge: null, note: "The percentage charged each month on what you still owe." },
  );
  return out;
}
