import type { Metadata } from "next";
import Link from "next/link";
import { DemoMark } from "@/components/ui/DemoMark";
import { capitalRows } from "@/lib/demo/capital";
import { featuredCountrySlugs, getCountry } from "@/lib/demo/countries";
import { pulseComponents } from "@/lib/demo/pulse";
import { signals } from "@/lib/demo/signals";

export const metadata: Metadata = {
  title: "Afronomics Terminal",
  description: "Professional intelligence dashboard — markets, Pulse, signals, capital and country watch.",
};

const side = [
  { href: "/terminal", label: "Overview" },
  { href: "/markets", label: "Markets" },
  { href: "/countries", label: "Countries" },
  { href: "/capital", label: "Capital" },
  { href: "/climate", label: "Climate" },
  { href: "/trade", label: "Trade" },
  { href: "/companies", label: "Companies" },
  { href: "/signals", label: "Signals" },
  { href: "/ask", label: "Ask" },
  { href: "/data", label: "Data" },
];

export default function TerminalPage() {
  return (
    <div className="mx-auto grid max-w-[1400px] gap-0 lg:grid-cols-[13rem_1fr]">
      <aside className="border-b border-rule px-4 py-4 lg:border-b-0 lg:border-r">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Terminal</p>
        <nav className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-1">
          {side.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft hover:text-forest"
            >
              {item.label}
            </Link>
          ))}
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Watchlists — auth required</p>
        </nav>
      </aside>
      <div className="px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-3xl">Market monitor</h1>
          <DemoMark kind="methodology" />
        </div>

        <section className="mt-6">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Afronomics Pulse</h2>
          <div className="mt-2 grid grid-cols-2 gap-px bg-rule sm:grid-cols-5">
            {pulseComponents.map((item) => (
              <div key={item.key} className="bg-paper px-2 py-2">
                <p className="font-mono text-[9px] uppercase text-muted">{item.label}</p>
                <p className="font-serif text-xl">{item.reading}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="font-serif text-xl">Latest signals</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {signals.map((signal) => (
                <li key={signal.title} className="border-b border-rule pb-3">
                  <Link href="/signals" className="hover:text-forest">
                    {signal.title}
                  </Link>
                  <p className="text-xs text-muted">{signal.confidence}</p>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-serif text-xl">Capital flows</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {capitalRows.map((row) => (
                <li key={row.id} className="border-b border-rule pb-3">
                  {row.investor} → {row.target}
                  <p className="text-xs text-muted">
                    {row.amount} {row.currency} · {row.type}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-8">
          <h2 className="font-serif text-xl">Country watch</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {featuredCountrySlugs.map((slug) => {
              const country = getCountry(slug);
              return (
                <Link key={slug} href={`/countries/${slug}`} className="border border-rule px-3 py-2 text-sm hover:border-gold">
                  {country?.name}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-xl">Climate capital</h2>
            <p className="mt-2 text-sm text-muted">
              Gap cells empty. Open <Link href="/climate" className="text-forest underline underline-offset-2">Climate Capital</Link>.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl">Watchlist news</h2>
            <p className="mt-2 text-sm text-muted">No signed-in watchlist. Saved searches require a seat.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
