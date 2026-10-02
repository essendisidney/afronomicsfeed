import Link from "next/link";
import { yearsToMaturity, type BondAuction } from "@/lib/data/kenya-bonds";

/**
 * A bond result as money in a saver's pocket: the coupon paid twice a year on KES 100,000, the price paid per
 * 100, what the yield means, and the tax it carries. Kenya: 15% withholding on bonds under ten years, 10% at
 * ten years and over, none on infrastructure bonds.
 */
const fmt = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));

function taxFor(row: BondAuction) {
  if (/IFB|infrastructure/i.test(row.issue) || /IFB|infrastructure/i.test(row.type)) return 0;
  return yearsToMaturity(row) >= 10 ? 0.1 : 0.15;
}

export function BondMeaning({ rows }: { rows: BondAuction[] }) {
  const row = [...rows].sort((a, b) => (b.accepted_kes_m ?? 0) - (a.accepted_kes_m ?? 0))[0];
  if (!row) return null;
  const years = yearsToMaturity(row);
  const tax = taxFor(row);
  const amount = 100_000;
  const price = row.price_per_100 ?? null;
  const cost = price ? (amount * price) / 100 : amount;
  const coupon = row.coupon ?? row.weighted_avg_rate;
  const yearly = (amount * coupon) / 100;
  const yearlyNet = yearly * (1 - tax);
  const half = yearlyNet / 2;
  const totalNet = yearlyNet * years + (amount - cost);
  return (
    <section className="mt-10 rounded-2xl border border-rule bg-surface px-5 py-5 sm:px-6" aria-labelledby="bond-meaning">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="bond-meaning" className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
          What this means for KES {fmt(amount)} of {row.issue}
        </h2>
        <p className="text-[12px] text-muted">Worked from the published result · information, not advice</p>
      </div>
      <p className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
        KES {fmt(half)} <span className="text-base text-muted">every six months{tax ? ", after tax" : ", tax-free"}, for {years.toFixed(1)} years</span>
      </p>
      <div className="mt-3 space-y-2 text-[15px] leading-7 text-ink-soft">
        <p>
          {price
            ? `At this auction KES ${fmt(amount)} of face value cost about KES ${fmt(cost)} (price ${price.toFixed(3)} per 100), and the yield that implies is ${row.weighted_avg_rate.toFixed(2)}% a year.`
            : `The bond cleared at a yield of ${row.weighted_avg_rate.toFixed(2)}% a year.`}{" "}
          The coupon is {coupon.toFixed(2)}%: KES {fmt(yearly)} a year on KES {fmt(amount)} of face value, paid in two halves,{" "}
          {tax ? `KES ${fmt(yearlyNet)} after ${Math.round(tax * 100)}% withholding tax` : "with no withholding tax on an infrastructure bond"}.
        </p>
        <p>
          Held to maturity{row.maturity ? ` (${row.maturity})` : ""}, that is about KES {fmt(yearlyNet * years)} in coupons
          {price ? `, plus KES ${fmt(amount - cost)} ${amount - cost >= 0 ? "gain" : "loss"} between what you paid and the KES ${fmt(amount)} repaid` : ""}; roughly KES {fmt(totalNet)} in all
          {tax ? " after tax" : ""}.
        </p>
        <p>
          Sold before maturity, the price moves with rates: if yields rise, the bond is worth less; if they fall, more. The Central Bank’s minimum bid is KES 50,000.
          {" "}
          <Link href="/rates/kenya" className="underline underline-offset-2">
            Compare with bills, funds and deposits after tax →
          </Link>
        </p>
      </div>
    </section>
  );
}
