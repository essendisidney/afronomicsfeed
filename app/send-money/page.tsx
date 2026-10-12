import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { byDestination, countryName, destSlug, loadRemittances, periodLabel } from "@/lib/data/remittances";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Cheapest way to send money to Africa",
  description: "Every money-transfer service the World Bank surveyed into African countries, ranked by the total cost of sending $200. Pick a country.",
  alternates: { canonical: `${site.url}/send-money` },
};

const usd = (pct: number) => `$${((200 * pct) / 100).toFixed(2)}`;

export default function SendMoneyIndex() {
  const file = loadRemittances();
  const dests = byDestination();
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Send money home" }]}
      kicker="Afronomics comparison · sending money"
      title="Cheapest way to send money home"
      lede={<p>Choose the country you&rsquo;re sending to. Each page ranks every surveyed service by the real cost of sending $200, fee and exchange-rate margin together.</p>}
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {dests.map((d) => {
          const best = [...d.corridors].sort((a, b) => a.cheapest.cost_pct - b.cheapest.cost_pct)[0];
          return (
            <li key={d.dst}>
              <Link href={`/send-money/${destSlug(d.name)}`} className="block rounded-xl border border-rule bg-surface px-4 py-3 hover:border-accent">
                <span className="font-medium text-ink">{countryName(d.name)}</span>
                <span className="block text-[12px] text-muted">
                  from {usd(best.cheapest.cost_pct)} with {best.cheapest.firm} · {d.corridors.length} sending countr{d.corridors.length === 1 ? "y" : "ies"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-8 text-[12px] text-muted">
        World Bank, Remittance Prices Worldwide{file ? `, ${periodLabel(file.period)}` : ""}. Afronomics may earn a fee when you send through some buttons; it
        never changes the order. The averages by corridor are on <Link href="/rates/remittances" className="underline">what it costs to send money home</Link>.
      </p>
    </PageShell>
  );
}
