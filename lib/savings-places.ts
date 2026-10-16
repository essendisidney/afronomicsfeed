import { rateOptions } from "@/lib/data/kenya-rates";
import type { Place } from "@/lib/savings-goal";

/**
 * The savings goal planner's inputs, shared by its page and its share card so both work from the same places and the
 * same target month: the places a monthly saver can use (from the same sources as the Kenya rates table), and the
 * month the planner opens on.
 */
export function savingsPlaces(): Place[] {
  const { options } = rateOptions();
  const funds = options.filter((o) => o.group === "Money market funds").sort((a, b) => b.net - a.net);
  const out: Place[] = [];
  if (funds.length) {
    out.push({ name: `Best money market fund we track (${funds[0].name})`, short: "the best money market fund we track", net: funds[0].net, effective: true, note: "withdraw in 2 to 3 days", href: "/rates/kenya/money-market-funds" });
    const mid = funds[Math.floor(funds.length / 2)];
    if (funds.length > 2) out.push({ name: `A typical money market fund (${mid.name})`, short: "a typical money market fund", net: mid.net, effective: true, note: "the middle of the funds we track", href: "/rates/kenya/money-market-funds" });
  }
  const fd = options.find((o) => o.name === "Bank fixed deposit, industry average");
  if (fd) out.push({ name: "Bank fixed deposit, average", short: "an average bank fixed deposit", net: fd.net, effective: false, note: `CBK average, ${fd.asOf}; money locked for the term` });
  const sav = options.find((o) => o.name === "Bank savings account, industry average");
  if (sav) out.push({ name: "Bank savings account, average", short: "an average bank savings account", net: sav.net, effective: false, note: `CBK average, ${sav.asOf}` });
  out.push({ name: "Cash or M-PESA", short: "cash or M-PESA", net: 0, effective: false, note: "no interest" });
  return out;
}

/** Today (UTC date) and the month the planner opens on: three months ahead, or January once October has come. */
export function savingsDates(now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const [y, m] = today.split("-").map(Number);
  const defaultBy = `${m >= 10 ? y + 1 : y}-${m >= 10 ? "01" : String(Math.min(12, m + 3)).padStart(2, "0")}`;
  return { today, defaultBy };
}
