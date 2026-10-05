import Link from "next/link";
import { billIndexLatest, indexShort } from "@/lib/data/bill-index";
import { fairBench } from "@/lib/data/kenya-rates";
import { policyBoard } from "@/lib/data/policy-rates";
import { overnightFx } from "@/lib/editions/morning";

/**
 * "What do you need today?": four doors at the top of the homepage, one for each kind of visitor, each with
 * the live figures that person checks and the tool that answers their next question. Every figure comes from
 * the same published sources as the rest of the site; a door whose figures are missing says so rather than
 * guessing.
 */

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-GB")}`;
const pct = (n: number) => `${n.toFixed(2)}%`;

type Door = {
  id: string;
  who: string;
  question: string;
  lines: { k: string; v: string }[];
  links: { href: string; label: string }[];
};

export async function MoneyToday() {
  const bench = fairBench();
  const kenyaPolicy = policyBoard().rows.find((r) => r.market === "kenya");
  const index = billIndexLatest();
  const fx = await overnightFx();
  const kesMove = fx.moves.find((m) => m.code === "KES");
  const biggest = fx.moves.find((m) => m.code !== "KES");

  const doors: Door[] = [
    {
      id: "saving",
      who: "Saving",
      question: "Where does my money earn most?",
      lines: bench
        ? [
            { k: `Best after tax: ${bench.bestFundName}`, v: pct(bench.bestFundNet) },
            { k: "One-year Treasury bill, after tax", v: pct(bench.bill364Net) },
            { k: "Bank savings account, average, after tax", v: pct(bench.savingsAvg * 0.85) },
            {
              k: "KES 10,000 for a year, after tax: best option vs savings account",
              v: `${kes((10000 * bench.bestFundNet) / 100)} vs ${kes((10000 * bench.savingsAvg * 0.85) / 100)}`,
            },
          ]
        : [],
      links: [
        { href: "/rates/kenya/money-market-funds", label: "Money market funds ranked" },
        { href: "/rates/kenya/check", label: "Is my savings rate fair?" },
      ],
    },
    {
      id: "borrowing",
      who: "Borrowing",
      question: "Is the loan I was offered fair?",
      lines: bench
        ? [
            { k: "Bank lending rate, average", v: pct(bench.lendingAvg) },
            ...(kenyaPolicy ? [{ k: "Central Bank Rate", v: pct(kenyaPolicy.rate) }] : []),
            { k: "Simple interest on KES 50,000 for a year at the bank average", v: kes((50000 * bench.lendingAvg) / 100) },
          ]
        : [],
      links: [
        { href: "/rates/kenya/check", label: "Check a loan offer in shillings" },
        { href: "/rates/kenya", label: "What banks pay and charge" },
      ],
    },
    {
      id: "business",
      who: "Business & trade",
      question: "What did my currency do overnight?",
      lines: [
        ...(kesMove ? [{ k: "Shillings per US dollar (overnight change; + means the shilling gained)", v: `${kesMove.now.toFixed(2)} (${kesMove.changePct >= 0 ? "+" : "−"}${Math.abs(kesMove.changePct).toFixed(2)}%)` }] : []),
        ...(biggest ? [{ k: `Biggest overnight move against the dollar: ${biggest.name}`, v: `${biggest.changePct >= 0 ? "+" : "−"}${Math.abs(biggest.changePct).toFixed(2)}%` }] : []),
      ],
      links: [
        { href: "/markets", label: "Every African currency, converter" },
        { href: "/rates/policy", label: "Central-bank rates" },
      ],
    },
    {
      id: "institutions",
      who: "Institutions",
      question: "Where are African rates heading?",
      lines: [
        ...(index
          ? [{ k: `${indexShort}: ten-market one-year bill index`, v: `${index.latest.value.toFixed(2)}%${index.bpsWeek != null ? ` (${index.bpsWeek > 0 ? "+" : index.bpsWeek < 0 ? "−" : "±"}${Math.abs(index.bpsWeek)} bp on the week)` : ""}` }]
          : []),
        ...(index?.contributions.length
          ? [{ k: `Highest / lowest one-year bill`, v: `${index.contributions[0].market.country} ${pct(index.contributions[0].rate)} / ${index.contributions.at(-1)!.market.country} ${pct(index.contributions.at(-1)!.rate)}` }]
          : []),
      ],
      links: [
        { href: "/rates/policy", label: "Policy rate vs bill, eight markets" },
        { href: "/developers", label: "Data API and CSV downloads" },
        { href: "/pack", label: "Committee pack" },
      ],
    },
  ];

  return (
    <section aria-labelledby="money-today" className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="money-today" className="font-serif text-3xl text-ink">
          What do you need today?
        </h2>
        <p className="text-[13px] text-muted">Saving and borrowing figures are for Kenya; more countries are being added.</p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {doors.map((door) => (
          <div key={door.who} id={door.id} className="flex scroll-mt-24 flex-col rounded-2xl border border-rule bg-surface px-5 py-5">
            <p className="text-[13px] font-semibold text-forest">{door.who}</p>
            <h3 className="mt-1 text-[17px] font-semibold leading-snug text-ink">{door.question}</h3>
            {door.lines.length ? (
              <dl className="mt-4 space-y-3">
                {door.lines.map((line) => (
                  <div key={line.k}>
                    <dt className="text-[12px] leading-4 text-muted">{line.k}</dt>
                    <dd className="mt-0.5 font-serif text-xl leading-tight text-ink">{line.v}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-muted">Today’s figures did not load; the tools below still work.</p>
            )}
            <ul className="mt-auto space-y-1.5 pt-5 text-[14px] font-medium">
              {door.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-forest hover:text-gold">
                    {link.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
