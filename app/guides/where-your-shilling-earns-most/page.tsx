import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { rateOptions, type RateOption } from "@/lib/data/kenya-rates";
import { saccoLatest } from "@/lib/data/saccos";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Where your shilling earns most: Kenya's savings options compared, after tax",
  description:
    "Treasury bills and bonds, money market funds, SACCOs and bank accounts side by side: the rate after tax and what KES 100,000 earns in a year, from each publisher's latest figure. Free guide, updated automatically.",
  alternates: { canonical: `${site.url}/guides/where-your-shilling-earns-most` },
};

const AMOUNT = 100_000;
const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-GB")}`;
const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const asOf = (s: string) => (s.length === 7 ? new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${s}-01`)) : dayFmt.format(new Date(s)));

type Row = { name: string; net: number | null; gross: number; note: string; lockIn: string; publisher: string; source: string; when: string };

function fromOption(o: RateOption): Row {
  return { name: o.name, net: o.net, gross: o.gross, note: o.tax ? `${(o.tax * 100).toFixed(0)}% withholding tax deducted` : "tax-free", lockIn: o.lockIn, publisher: o.publisher, source: o.source, when: asOf(o.asOf) };
}

function Table({ rows }: { rows: Row[] }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Option</th>
            <th className="text-right">Rate after tax</th>
            <th className="text-right">KES 100,000 earns in a year</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td className="text-sm">
                {r.name}
                <span className="block text-[11px] text-muted">
                  {r.lockIn} ·{" "}
                  <a href={r.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    {r.publisher}
                  </a>
                  , {r.when}
                </span>
              </td>
              <td className="text-right text-sm font-semibold">
                {r.net != null ? `${r.net.toFixed(2)}%` : `${r.gross.toFixed(2)}%*`}
                <span className="block text-[11px] font-normal text-muted">{r.note}</span>
              </td>
              <td className="text-right text-sm">{kes((AMOUNT * (r.net ?? r.gross)) / 100)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ShillingGuidePage() {
  const { options } = rateOptions();
  const sacco = saccoLatest();
  const byNet = (a: Row, b: Row) => (b.net ?? b.gross) - (a.net ?? a.gross);
  const anyTime = options.filter((o) => o.group === "Money market funds" || o.name.startsWith("Bank savings")).map(fromOption).sort(byNet);
  const months: Row[] = options.filter((o) => o.name.includes("Treasury bill") || o.name.startsWith("Bank fixed")).map(fromOption);
  if (sacco) {
    months.push({
      name: "SACCO deposits, industry average interest",
      net: null,
      gross: sacco.deposit_interest_pct,
      note: "before tax, as reported",
      lockIn: "held while you are a member; notice to withdraw",
      publisher: sacco.industry.publisher,
      source: sacco.industry.source,
      when: String(sacco.year),
    });
  }
  months.sort(byNet);
  const years = options.filter((o) => o.name.includes("bond")).map(fromOption).sort(byNet);
  const best = [...anyTime, ...months].sort(byNet)[0];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/rates/kenya", label: "Savings & loans" }, { label: "Where your shilling earns most" }]}
      kicker="Free guide · Kenya · updated automatically"
      title="Where your shilling earns most"
      lede={
        <p>
          Every place a Kenyan can put savings, side by side: the rate after tax and what {kes(AMOUNT)} would earn in a year at today&rsquo;s
          published rates. Each figure is the publisher&rsquo;s own latest, with the link. Information, not advice.
        </p>
      }
      aside={
        best ? (
          <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
            <p className="text-[13px] font-medium text-muted">Highest published, after tax</p>
            <p className="mt-1 font-serif text-3xl text-ink">{(best.net ?? best.gross).toFixed(2)}%</p>
            <p className="mt-1 text-[14px] text-ink">{best.name}</p>
            <p className="mt-1 text-[12px] text-muted">
              {kes((AMOUNT * (best.net ?? best.gross)) / 100)} a year on {kes(AMOUNT)} · {best.when}
            </p>
          </div>
        ) : null
      }
    >
      <section>
        <SectionTitle kicker="1" title="Money you may need any time" note="You can withdraw within days. Fund yields change daily; past yields are not a promise." />
        <Table rows={anyTime} />
      </section>
      <section className="mt-12">
        <SectionTitle kicker="2" title="Money you can leave for months" note="Higher rates for leaving it: a bill is held to maturity and needs at least KES 50,000." />
        <Table rows={months} />
        {sacco ? <p className="mt-2 text-[12px] text-muted">* SACCO deposit interest is the industry average for {sacco.year}, before tax; SACCOs also pay a dividend on share capital (industry average {sacco.dividend_pct.toFixed(2)}%). Individual SACCOs pay more or less.</p> : null}
      </section>
      {years.length ? (
        <section className="mt-12">
          <SectionTitle kicker="3" title="Money for years" note="Treasury bonds pay more for longer. Selling before maturity can mean a lower price." />
          <Table rows={years} />
        </section>
      ) : null}

      <section className="mt-14 grid gap-8 md:grid-cols-3">
        {[
          ["Compare after tax", "Banks, bills and funds have 15% withholding tax deducted from interest; infrastructure bonds are tax-free. A quoted 10% is about 8.5% in your hand."],
          ["Match the money to the wait", "Money for emergencies belongs where you can reach it in days. Only money you will not need for months should be locked in a bill or a fixed deposit."],
          ["Check what you are offered", "If a bank or SACCO quotes you a rate, check it in seconds against these figures."],
        ].map(([t, d]) => (
          <div key={t}>
            <h3 className="font-serif text-xl text-ink">{t}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-soft">{d}</p>
          </div>
        ))}
      </section>
      <p className="mt-6 text-sm">
        <Link href="/rates/kenya/check" className="font-semibold text-forest underline underline-offset-2">
          Is my rate fair? Check yours →
        </Link>
      </p>
      <p className="mt-8 max-w-3xl text-xs leading-5 text-muted">
        KES 100,000 for one year at the rate shown, simple interest, after the stated tax; bills and bonds earn their yield only if held to maturity.
        Rates are each publisher&rsquo;s latest and change; this page updates on its own. Information, not advice: Afronomics does not recommend any
        product or provider. Full comparison:{" "}
        <Link href="/rates/kenya" className="underline underline-offset-2">
          where the shilling earns most
        </Link>
        .
      </p>
      <NewsletterBand />
    </PageShell>
  );
}
