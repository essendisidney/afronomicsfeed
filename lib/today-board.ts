import type { Evidence } from "@/components/evidence/EvidenceTag";
import { fundLeague, WHT_INTEREST } from "@/lib/data/kenya-rates";
import { latestByTenor, loadTbills, type Tenor } from "@/lib/data/kenya-tbills";
import { loadPolicyRates } from "@/lib/data/policy-rates";

/**
 * "Numbers that moved" on Today (RECEIPTS.md, "One site, one journey"): four live figures from our own data files,
 * each with its change, a short trend and its evidence. Nothing here is estimated; a figure without a source is left out.
 */

export type BoardTile = {
  id: string;
  label: string;
  value: string;
  change?: string;
  direction: "up" | "down" | "flat";
  trend?: number[];
  evidence: Evidence;
  href: string;
};

const pct = (v: number) => `${v.toFixed(2)}%`;
const fmtDay = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const day = (iso: string) => fmtDay.format(new Date(`${iso}T00:00:00Z`));

function bill(tenor: Tenor, label: string): BoardTile | null {
  const rows = loadTbills().rows;
  const now = latestByTenor(rows).get(tenor);
  if (!now) return null;
  const bps = now.previous ? Math.round((now.latest.weighted_avg_rate - now.previous.weighted_avg_rate) * 100) : null;
  const trend = rows
    .filter((r) => r.tenor === tenor)
    .slice(0, 13)
    .reverse()
    .map((r) => r.weighted_avg_rate);
  return {
    id: `bill-${tenor}`,
    label,
    value: pct(now.latest.weighted_avg_rate),
    change: bps == null ? undefined : bps === 0 ? "unchanged on the last auction" : `${bps > 0 ? "+" : "−"}${Math.abs(bps)} bps on the last auction`,
    direction: bps == null || bps === 0 ? "flat" : bps > 0 ? "up" : "down",
    trend,
    evidence: { source: "Central Bank of Kenya", href: now.latest.source, asOf: now.latest.value_date, dateKind: "value" },
    href: "/markets/kenya-tbills",
  };
}

function cbr(): BoardTile | null {
  const row = (loadPolicyRates().rows ?? []).find((r) => r.market === "kenya");
  if (!row) return null;
  const printed = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(row.date_as_printed ?? "");
  const asOf = printed ? `${printed[3]}-${printed[2]}-${printed[1]}` : row.read_at.slice(0, 10);
  return {
    id: "cbr",
    label: "CBK policy rate",
    value: pct(row.rate),
    change: printed ? `set ${day(asOf)}` : undefined,
    direction: "flat",
    evidence: { source: "Central Bank of Kenya", href: row.source, asOf },
    href: "/rates/policy",
  };
}

function topFund(): BoardTile | null {
  const top = fundLeague()[0];
  if (!top) return null;
  return {
    id: "mmf",
    label: "Best money market fund, after tax",
    value: pct(top.net),
    change: `${top.name}`,
    direction: "flat",
    trend: top.points.slice(-14).map((p) => p.value * (1 - WHT_INTEREST)),
    evidence: { source: top.manager, href: top.source, asOf: top.readOn },
    href: "/rates/kenya/money-market-funds",
  };
}

export function numbersThatMoved(): BoardTile[] {
  return [bill(91, "Kenya 91-day bill"), bill(364, "Kenya one-year bill"), cbr(), topFund()].filter((t): t is BoardTile => t != null);
}
