import type { Metadata } from "next";
import Link from "next/link";
import { DemoMark } from "@/components/ui/DemoMark";
import { capitalBookByName, capitalFileHref, capitalRows } from "@/lib/demo/capital";
import { climateFileHref } from "@/lib/demo/climate";
import { companies } from "@/lib/demo/companies";
import { featuredCountrySlugs, getCountry } from "@/lib/demo/countries";
import { instruments } from "@/lib/demo/markets";
import { pulseComponents } from "@/lib/demo/pulse";
import { signals } from "@/lib/demo/signals";
import { techLenses } from "@/lib/demo/tech";
import { askQuestions } from "@/lib/demo/ask";
import { datasets } from "@/lib/demo/datasets";
import { corridors, ports } from "@/lib/demo/trade";
import { industries } from "@/lib/demo/industries";
import { agencyKinds } from "@/lib/demo/agencies";
import { cities } from "@/lib/demo/cities";
import { investors } from "@/lib/demo/investors";
import { personRoles } from "@/lib/demo/people";

export const metadata: Metadata = {
  title: "Afronomics Terminal",
  description: "Professional intelligence dashboard — markets, Pulse, signals, capital and country watch.",
};

const side = [
  { href: "/terminal", label: "Overview" },
  { href: "/markets", label: "Markets" },
  { href: "/economy", label: "Economy" },
  { href: "/countries", label: "Countries" },
  { href: "/capital", label: "Capital" },
  { href: "/climate", label: "Climate" },
  { href: "/technology", label: "Technology" },
  { href: "/trade", label: "Trade" },
  { href: "/projects", label: "Projects" },
  { href: "/companies", label: "Companies" },
  { href: "/signals", label: "Signals" },
  { href: "/ask", label: "Ask" },
  { href: "/data", label: "Data" },
  { href: "/industries", label: "Industries" },
  { href: "/agencies", label: "Agencies" },
  { href: "/cities", label: "Cities" },
  { href: "/investors", label: "Investors" },
  { href: "/people", label: "People" },
  { href: "/graph", label: "Graph" },
  { href: "/watchlists", label: "Watchlists" },
  { href: "/alerts", label: "Alerts" },
  { href: "/exports", label: "Exports" },
  { href: "/packs", label: "Packs" },
  { href: "/sources", label: "Sources" },
  { href: "/compare", label: "Compare" },
  { href: "/feeds", label: "Feeds" },
  { href: "/status", label: "Status" },
  { href: "/searches", label: "Searches" },
  { href: "/licensing", label: "Licensing" },
  { href: "/reports", label: "Reports" },
  { href: "/changelog", label: "Changelog" },
  { href: "/calendar", label: "Calendar" },
  { href: "/partners", label: "Partners" },
  { href: "/coverage", label: "Coverage" },
  { href: "/glossary", label: "Glossary" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/webhooks", label: "Webhooks" },
  { href: "/regions", label: "Regions" },
  { href: "/runbooks", label: "Runbooks" },
  { href: "/layers", label: "Layers" },
  { href: "/press", label: "Press" },
  { href: "/golive", label: "Go live" },
  { href: "/social", label: "Social" },
  { href: "/embeds", label: "Embeds" },
  { href: "/security", label: "Security" },
  { href: "/integrations", label: "Integrations" },
  { href: "/sla", label: "SLA" },
  { href: "/brand", label: "Brand" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/sdk", label: "SDK" },
  { href: "/developers", label: "Developers" },
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

        <section className="mt-8">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-xl">Market files</h2>
            <Link href="/markets" className="font-mono text-[10px] uppercase tracking-[0.12em] text-forest">
              All instruments →
            </Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Print</th>
                  <th>Demo</th>
                  <th>File</th>
                </tr>
              </thead>
              <tbody>
                {instruments.slice(0, 10).map((row) => (
                  <tr key={row.slug}>
                    <td className="font-mono text-xs">{row.label}</td>
                    <td>{row.value}</td>
                    <td>
                      <Link href={row.fileHref} className="text-forest underline underline-offset-2">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="font-serif text-xl">Latest signals</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {signals.map((signal) => (
                <li key={signal.slug} className="border-b border-rule pb-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                    {signal.category} · {signal.country}
                  </p>
                  <Link href={`/signals/${signal.slug}`} className="hover:text-forest">
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
              {capitalRows.map((row) => {
                const book = capitalBookByName(row.type);
                const href = book ? capitalFileHref(book.slug, row.countrySlug) : "/capital";
                return (
                  <li key={row.id} className="border-b border-rule pb-3">
                    <Link href={href} className="hover:text-forest">
                      {row.investor} → {row.target}
                    </Link>
                    <p className="text-xs text-muted">
                      {row.amount} {row.currency} · {row.type} · {row.country}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <section className="mt-8">
          <h2 className="font-serif text-xl">Country watch</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCountrySlugs.map((slug) => {
              const country = getCountry(slug);
              if (!country) return null;
              return (
                <article key={slug} className="border border-rule px-3 py-3">
                  <p className="font-mono text-[10px] uppercase text-gold">{country.iso}</p>
                  <p className="mt-1 font-serif text-lg">
                    <Link href={`/economy/${slug}`} className="hover:text-forest">
                      {country.name}
                    </Link>
                  </p>
                  <p className="mt-2 flex flex-wrap gap-2 text-xs">
                    <Link href={`/countries/${slug}`} className="text-forest underline underline-offset-2">
                      Terminal
                    </Link>
                    <Link href={climateFileHref(slug)} className="text-forest underline underline-offset-2">
                      Climate
                    </Link>
                    <Link href={`/technology/fintech/${slug}`} className="text-forest underline underline-offset-2">
                      Fintech
                    </Link>
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-xl">Technology lenses</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {techLenses.map((lens) => (
                <li key={lens.slug}>
                  <Link href={`/technology/${lens.slug}`} className="hover:text-forest">
                    {lens.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-xl">Companies</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {companies.map((company) => (
                <li key={company.slug}>
                  <Link href={`/companies/${company.slug}`} className="hover:text-forest">
                    {company.name}
                  </Link>
                  <span className="text-muted"> · {company.country}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-xl">Trade</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {corridors.map((corridor) => (
                <li key={corridor.slug}>
                  <Link href={`/trade/${corridor.slug}`} className="hover:text-forest">
                    {corridor.name}
                  </Link>
                </li>
              ))}
              {ports.slice(0, 6).map((port) => (
                <li key={port.slug}>
                  <Link href={`/trade/ports/${port.slug}`} className="hover:text-forest">
                    {port.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-xl">Ask files</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {askQuestions.map((item) => (
                <li key={item.slug}>
                  <Link href={`/ask/${item.slug}`} className="hover:text-forest">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-xl">Data files</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {datasets.map((item) => (
                <li key={item.slug}>
                  <Link href={`/data/${item.slug}`} className="hover:text-forest">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-xl">Watchlist news</h2>
            <p className="mt-2 text-sm text-muted">No signed-in watchlist. Saved searches require a seat.</p>
            <p className="mt-3 text-sm">
              <Link href="/watchlists" className="text-forest underline underline-offset-2">
                Watchlists
              </Link>
              {" · "}
              <Link href="/alerts" className="text-forest underline underline-offset-2">
                Alerts
              </Link>
              {" · "}
              <Link href="/exports" className="text-forest underline underline-offset-2">
                Exports
              </Link>
              {" · "}
              <Link href="/ask/corpus" className="text-forest underline underline-offset-2">
                Corpus
              </Link>
              {" · "}
              <Link href="/packs" className="text-forest underline underline-offset-2">
                Packs
              </Link>
              {" · "}
              <Link href="/compare" className="text-forest underline underline-offset-2">
                Compare
              </Link>
              {" · "}
              <Link href="/feeds" className="text-forest underline underline-offset-2">
                Feeds
              </Link>
              {" · "}
              <Link href="/graph/northern-corridor" className="text-forest underline underline-offset-2">
                Corridor graph
              </Link>
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-xl">Graph files</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {industries.slice(0, 6).map((item) => (
                <li key={item.slug}>
                  <Link href={`/industries/${item.slug}`} className="hover:text-forest">
                    {item.label}
                  </Link>
                </li>
              ))}
              {agencyKinds.map((kind) => (
                <li key={kind.slug}>
                  <Link href={`/agencies/${kind.slug}`} className="hover:text-forest">
                    {kind.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-xl">Desks</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {cities.slice(0, 8).map((city) => (
                <li key={city.slug}>
                  <Link href={`/cities/${city.slug}`} className="hover:text-forest">
                    {city.name}
                  </Link>
                </li>
              ))}
              {investors.map((investor) => (
                <li key={investor.slug}>
                  <Link href={`/investors/${investor.slug}`} className="hover:text-forest">
                    {investor.name}
                  </Link>
                </li>
              ))}
              {personRoles.map((role) => (
                <li key={role.slug}>
                  <Link href={`/people/${role.slug}`} className="hover:text-forest">
                    {role.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/graph/kenya" className="hover:text-forest">
                  Kenya graph
                </Link>
              </li>
              <li>
                <Link href="/exports" className="hover:text-forest">
                  Exports
                </Link>
              </li>
              <li>
                <Link href="/ask/corpus" className="hover:text-forest">
                  Ask corpus
                </Link>
              </li>
              <li>
                <Link href="/packs" className="hover:text-forest">
                  Packs
                </Link>
              </li>
              <li>
                <Link href="/sources" className="hover:text-forest">
                  Sources
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-forest">
                  Compare
                </Link>
              </li>
              <li>
                <Link href="/ingestion" className="hover:text-forest">
                  Ingestion
                </Link>
              </li>
              <li>
                <Link href="/feeds" className="hover:text-forest">
                  Feeds
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-forest">
                  Status
                </Link>
              </li>
              <li>
                <Link href="/searches" className="hover:text-forest">
                  Searches
                </Link>
              </li>
              <li>
                <Link href="/licensing" className="hover:text-forest">
                  Licensing
                </Link>
              </li>
              <li>
                <Link href="/notifications" className="hover:text-forest">
                  Notifications
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-forest">
                  Reports
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-forest">
                  Changelog
                </Link>
              </li>
              <li>
                <Link href="/audit" className="hover:text-forest">
                  Audit
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-forest">
                  Calendar
                </Link>
              </li>
              <li>
                <Link href="/partners" className="hover:text-forest">
                  Partners
                </Link>
              </li>
              <li>
                <Link href="/coverage" className="hover:text-forest">
                  Coverage
                </Link>
              </li>
              <li>
                <Link href="/glossary" className="hover:text-forest">
                  Glossary
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-forest">
                  Onboarding
                </Link>
              </li>
              <li>
                <Link href="/webhooks" className="hover:text-forest">
                  Webhooks
                </Link>
              </li>
              <li>
                <Link href="/regions" className="hover:text-forest">
                  Regions
                </Link>
              </li>
              <li>
                <Link href="/runbooks" className="hover:text-forest">
                  Runbooks
                </Link>
              </li>
              <li>
                <Link href="/layers" className="hover:text-forest">
                  Layers
                </Link>
              </li>
              <li>
                <Link href="/press" className="hover:text-forest">
                  Press
                </Link>
              </li>
              <li>
                <Link href="/golive" className="hover:text-forest">
                  Go live
                </Link>
              </li>
              <li>
                <Link href="/social" className="hover:text-forest">
                  Social
                </Link>
              </li>
              <li>
                <Link href="/embeds" className="hover:text-forest">
                  Embeds
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-forest">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="hover:text-forest">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="/sla" className="hover:text-forest">
                  SLA
                </Link>
              </li>
              <li>
                <Link href="/brand" className="hover:text-forest">
                  Brand
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="hover:text-forest">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:text-forest">
                  Accessibility
                </Link>
              </li>
              <li>
                <Link href="/sdk" className="hover:text-forest">
                  SDK
                </Link>
              </li>
              <li>
                <Link href="/method/registry" className="hover:text-forest">
                  Method registry
                </Link>
              </li>
              <li>
                <Link href="/account/usage" className="hover:text-forest">
                  Usage
                </Link>
              </li>
              <li>
                <Link href="/developers" className="hover:text-forest">
                  Developers
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
