import fs from "node:fs";
import path from "node:path";
import { eurobondTable, loadEurobonds } from "./eurobonds";
import { fundLeague, WHT_INTEREST } from "./kenya-rates";
import { loadPolicyRates } from "./policy-rates";
import { getBillMarket, latestBills, loadBillMarket, type BillMarket, type BillRow, type BillTenor } from "./sovereign-bills";
import { getBondMarket, loadBondMarket, type BondMarket, type BondRow } from "./sovereign-bonds";

/**
 * The East Africa rates hub (/east-africa): Kenya, Uganda and Tanzania side by side, built only from the files the
 * deep pages already read (bills, bonds, policy rates, Eurobonds, money market funds). Everything here is computed
 * from those files at build time: no figure is typed in, and a figure the data does not hold is left out, not guessed.
 */

export type EaSlug = "kenya" | "uganda" | "tanzania";
export const eaSlugs: EaSlug[] = ["kenya", "uganda", "tanzania"];

export type EaPolicy =
  | { read: true; label: string; rate: number; dateAsPrinted: string | null; publisher: string; source: string; readAt: string }
  | { read: false; publisher: string; source: string; reason: string };

export type EaBill = { tenor: BillTenor; rate: number; date: string; source: string };

export type EaBondLine = { label: string; tenorYears: number | null; rate: number; bidCover: number | null; source: string };

export type EaBondAuction = {
  date: string;
  dateKind: "auction" | "settlement";
  kind: string | null; // Kenya only: primary / reopening / tap
  lines: EaBondLine[];
  publisher: string;
  sourcePage: string;
  /** A switch or buyback dated after the latest new-money auction (Kenya), named so the table does not hide it. */
  newerOther: { date: string; kind: string; label: string; rate: number; source: string } | null;
};

export type EaEurobond = {
  date: string;
  publisher: string;
  source: string; // the bulletin the yields were read from
  sourcePage: string;
  bonds: { label: string; yield: number; monthChange: number | null }[];
};

export type EaCountry = {
  slug: EaSlug;
  country: string;
  currency: string;
  bill: { market: BillMarket; rows: EaBill[] } | null;
  policy: EaPolicy;
  bond: EaBondAuction | null;
  bondHref: string | null;
  eurobond: EaEurobond | null;
  countryHref: string;
};

export type EaFund = { name: string; manager: string; source: string; gross: number; net: number; readOn: string; basis: string | null };

export type EaSavings = {
  funds: EaFund[];
  readOn: string; // newest reading among the funds shown
  fundsRead: number;
  bill91: { rate: number; net: number; date: string; source: string } | null;
  wht: number;
};

export type EaChange = { country: string; slug: EaSlug; text: string; source: string | null };

/* ---------- formatting shared by the sentences (the components format the same way) ---------- */

const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const eaDate = (iso: string) => dayFmt.format(new Date(`${iso.slice(0, 10)}T12:00:00Z`));
export const eaPct = (v: number) => `${v.toFixed(2)}%`;
/** Basis points, rounded to whole points. */
export const eaBps = (pp: number) => Math.round(pp * 100);
export const eaTenor = (years: number | null) => (years == null ? "bond" : `${Number.isInteger(years) ? years : years.toFixed(1)}-year`);

const daysBefore = (iso: string, days: number) => new Date(Date.parse(`${iso}T00:00:00Z`) - days * 86_400_000).toISOString().slice(0, 10);

function moveWords(pp: number) {
  const b = eaBps(pp);
  if (b === 0) return "unchanged from";
  return `${b > 0 ? "up" : "down"} ${Math.abs(b)} bp${Math.abs(b) === 1 ? "" : "s"} from`;
}

/* ---------- policy rates ---------- */

const POLICY_FALLBACK: Record<EaSlug, { publisher: string; source: string }> = {
  kenya: { publisher: "Central Bank of Kenya", source: "https://www.centralbank.go.ke/" },
  uganda: { publisher: "Bank of Uganda", source: "https://www.bou.or.ug/" },
  tanzania: { publisher: "Bank of Tanzania", source: "https://www.bot.go.tz/?lang=en" },
};

function policyFor(slug: EaSlug): EaPolicy {
  const file = loadPolicyRates();
  const row = (file.rows ?? []).find((r) => r.market === slug);
  if (row) return { read: true, label: row.label, rate: row.rate, dateAsPrinted: row.date_as_printed, publisher: row.publisher, source: row.source, readAt: row.read_at };
  const unread = (file.unread ?? []).find((u) => u.market === slug);
  return { ...POLICY_FALLBACK[slug], read: false, reason: unread?.status ?? "not yet read" };
}

type PolicyHistoryRow = { first_seen: string; market: string; rate: number };

function policyHistory(slug: EaSlug): PolicyHistoryRow[] {
  const file = path.join(process.cwd(), "data", "policy_rate_history.json");
  if (!fs.existsSync(file)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8")) as { rows?: PolicyHistoryRow[] };
    return (raw.rows ?? []).filter((r) => r.market === slug && Number.isFinite(r.rate)).sort((a, b) => a.first_seen.localeCompare(b.first_seen));
  } catch {
    return [];
  }
}

/* ---------- bonds ---------- */

const NOT_NEW_MONEY = new Set(["switch", "buyback"]);

function bondLabel(slug: EaSlug, r: BondRow) {
  const t = eaTenor(r.tenor_years);
  return slug === "kenya" && r.issue ? `${r.issue} (${t})` : t;
}

function bondAuction(slug: EaSlug): EaBondAuction | null {
  const market = getBondMarket(slug) as BondMarket | null;
  if (!market) return null;
  const { rows } = loadBondMarket(slug as BondMarket["slug"]);
  if (!rows.length) return null;
  // New-money auctions only (Kenya also publishes switches and buybacks, which refinance existing debt).
  const fresh = rows.filter((r) => !NOT_NEW_MONEY.has((r.type ?? "").toLowerCase()));
  const pool = fresh.length ? fresh : rows;
  const date = pool[0].date;
  const latest = pool.filter((r) => r.date === date).sort((a, b) => (a.tenor_years ?? 0) - (b.tenor_years ?? 0));
  const other = rows.find((r) => r.date > date && NOT_NEW_MONEY.has((r.type ?? "").toLowerCase()));
  const kinds = [...new Set(latest.map((r) => r.type).filter((k): k is string => Boolean(k)))];
  return {
    date,
    dateKind: market.dateKind ?? "auction",
    kind: slug === "kenya" && kinds.length ? kinds.join(" and ") : null,
    lines: latest.map((r) => ({ label: bondLabel(slug, r), tenorYears: r.tenor_years, rate: r.rate, bidCover: r.bid_cover, source: r.source })),
    publisher: market.publisher,
    sourcePage: market.sourcePage,
    newerOther: other ? { date: other.date, kind: other.type ?? "switch", label: bondLabel(slug, other), rate: other.rate, source: other.source } : null,
  };
}

/** The same bond (Kenya: same issue; elsewhere: same tenor) at its previous auction before `date`. */
function previousBond(slug: EaSlug, line: BondRow, date: string): BondRow | null {
  const { rows } = loadBondMarket(slug as BondMarket["slug"]);
  return (
    rows.find((r) => r.date < date && !NOT_NEW_MONEY.has((r.type ?? "").toLowerCase()) && (slug === "kenya" && line.issue ? r.issue === line.issue : r.tenor_years === line.tenor_years)) ??
    null
  );
}

/* ---------- Eurobonds ---------- */

function eurobondFor(slug: EaSlug): EaEurobond | null {
  const c = loadEurobonds()?.countries?.[slug];
  if (!c?.latest?.bonds?.length) return null;
  const table = eurobondTable(c);
  return {
    date: c.latest.date,
    publisher: c.publisher,
    source: c.latest.source,
    sourcePage: c.source_page,
    bonds: table.map((b) => ({ label: b.coupon != null ? `${b.coupon.toFixed(3)}% ${b.maturity}` : b.maturity, yield: b.yield, monthChange: b.monthChange })),
  };
}

/* ---------- the hub ---------- */

const BOND_PAGES: Partial<Record<EaSlug, string>> = { kenya: "/markets/bonds/kenya", uganda: "/markets/bonds/uganda" };

export function eastAfricaCountries(): EaCountry[] {
  return eaSlugs.map((slug) => {
    const market = getBillMarket(slug)!;
    const latest = latestBills(loadBillMarket(slug).rows);
    const rows: EaBill[] = [...latest.entries()].map(([tenor, { latest: r }]) => ({ tenor, rate: r.rate, date: r.date, source: r.source || market.sourcePage }));
    const bond = bondAuction(slug);
    return {
      slug,
      country: market.country,
      currency: market.currency,
      bill: rows.length ? { market, rows } : null,
      policy: policyFor(slug),
      bond,
      bondHref: bond ? (BOND_PAGES[slug] ?? null) : null,
      eurobond: eurobondFor(slug),
      countryHref: `/countries/${slug}`,
    };
  });
}

export function kenyaSavings(limit = 5): EaSavings | null {
  const league = fundLeague();
  if (!league.length) return null;
  const funds = league.slice(0, limit).map((f) => ({ name: f.name, manager: f.manager, source: f.source, gross: f.gross, net: f.net, readOn: f.readOn, basis: f.basis }));
  const b = latestBills(loadBillMarket("kenya").rows).get(91)?.latest;
  return {
    funds,
    readOn: funds.map((f) => f.readOn).sort().at(-1)!,
    fundsRead: league.length,
    bill91: b ? { rate: b.rate, net: b.rate * (1 - WHT_INTEREST), date: b.date, source: b.source } : null,
    wht: WHT_INTEREST,
  };
}

/** The newest data date anywhere on the page (auction, settlement, bulletin or fund reading), YYYY-MM-DD. */
export function newestDate(countries: EaCountry[], savings: EaSavings | null): string | null {
  const dates: string[] = [];
  for (const c of countries) {
    for (const b of c.bill?.rows ?? []) dates.push(b.date);
    if (c.bond) dates.push(c.bond.newerOther?.date ?? c.bond.date);
    if (c.eurobond) dates.push(c.eurobond.date);
  }
  if (savings) dates.push(savings.readOn);
  return dates.sort().at(-1) ?? null;
}

/** The latest bill of a tenor against the newest auction of that tenor at least 28 days earlier. */
function billMonthChange(rows: BillRow[], tenor: BillTenor) {
  const list = rows.filter((r) => r.tenor === tenor);
  const now = list[0];
  if (!now) return null;
  const cutoff = daysBefore(now.date, 28);
  const then = list.find((r) => r.date <= cutoff);
  return then ? { now, then } : null;
}

/**
 * "What changed this month": one plain sentence per fact, each computed from the files and each naming both
 * dates it compares. A comparison the data cannot make (no earlier reading) is left out rather than estimated.
 */
export function monthChanges(countries: EaCountry[] = eastAfricaCountries()): EaChange[] {
  const out: EaChange[] = [];
  for (const c of countries) {
    const rows = loadBillMarket(c.slug).rows;
    for (const tenor of [364, 91] as BillTenor[]) {
      const m = billMonthChange(rows, tenor);
      if (!m) continue;
      out.push({
        country: c.country,
        slug: c.slug,
        text: `${c.country}’s ${tenor}-day Treasury bill rate was ${eaPct(m.now.rate)} for bills dated ${eaDate(m.now.date)}, ${moveWords(m.now.rate - m.then.rate)} ${eaPct(m.then.rate)} on ${eaDate(m.then.date)}.`,
        source: m.now.source || null,
      });
    }

    if (c.policy.read) {
      const hist = policyHistory(c.slug);
      const since = hist[0]?.first_seen;
      let lastMove = -1;
      for (let i = 1; i < hist.length; i++) if (hist[i].rate !== hist[i - 1].rate) lastMove = i;
      if (since && lastMove < 0 && hist.every((h) => h.rate === (c.policy as { rate: number }).rate)) {
        out.push({
          country: c.country,
          slug: c.slug,
          text: `The ${c.policy.publisher}’s ${c.policy.label} was ${eaPct(c.policy.rate)} at every reading since Afronomics began recording it on ${eaDate(since)}.`,
          source: c.policy.source,
        });
      } else if (lastMove > 0) {
        const now = hist[lastMove];
        const prev = hist[lastMove - 1];
        out.push({
          country: c.country,
          slug: c.slug,
          text: `The ${c.policy.publisher}’s ${c.policy.label} moved to ${eaPct(now.rate)} from ${eaPct(prev.rate)}; Afronomics first read the new rate on ${eaDate(now.first_seen)}.`,
          source: c.policy.source,
        });
      }
    }

    if (c.bond) {
      const { rows: bondRows } = loadBondMarket(c.slug as BondMarket["slug"]);
      const latest = bondRows.filter((r) => r.date === c.bond!.date && !NOT_NEW_MONEY.has((r.type ?? "").toLowerCase()));
      for (const r of latest) {
        const prev = previousBond(c.slug, r, c.bond.date);
        if (!prev) continue;
        const what = c.slug === "kenya" && r.issue ? `${r.issue}` : `${eaTenor(r.tenor_years)} bond`;
        const when = c.bond.dateKind === "settlement" ? "settling" : "auctioned";
        out.push({
          country: c.country,
          slug: c.slug,
          text: `${c.country}’s ${what} ${when} ${eaDate(r.date)} cleared at ${eaPct(r.rate)}, ${moveWords(r.rate - prev.rate)} ${eaPct(prev.rate)} at its previous sale (${when} ${eaDate(prev.date)}).`,
          source: r.source || null,
        });
      }
    }

    if (c.eurobond) {
      const moved = c.eurobond.bonds.filter((b) => b.monthChange != null);
      if (moved.length) {
        const avg = moved.reduce((s, b) => s + b.monthChange!, 0) / moved.length;
        const up = moved.filter((b) => eaBps(b.monthChange!) > 0).length;
        const down = moved.filter((b) => eaBps(b.monthChange!) < 0).length;
        out.push({
          country: c.country,
          slug: c.slug,
          text: `${c.country}’s US-dollar Eurobond yields on ${eaDate(c.eurobond.date)} were on average ${Math.abs(eaBps(avg))} bps ${avg >= 0 ? "higher" : "lower"} than four weeks earlier (${up} of ${moved.length} bonds up, ${down} down).`,
          source: c.eurobond.source,
        });
      }
    }
  }
  return out;
}
