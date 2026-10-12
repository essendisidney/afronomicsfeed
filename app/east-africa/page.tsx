import type { Metadata } from "next";
import Link from "next/link";
import { CountryRates, Glance } from "@/components/eastafrica/CountryRates";
import { HubLinks } from "@/components/eastafrica/HubLinks";
import { KenyaSavings } from "@/components/eastafrica/KenyaSavings";
import { MonthChanges } from "@/components/eastafrica/MonthChanges";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { CiteBlock } from "@/components/ui/CiteBlock";
import { EmailAlertBox } from "@/components/ui/RateAlertForm";
import { eaDate, eastAfricaCountries, kenyaSavings, monthChanges, newestDate } from "@/lib/data/east-africa";
import { site } from "@/lib/site";

export const revalidate = 3600;

const title = "East Africa interest rates today: Kenya, Uganda, Tanzania";
const description =
  "Policy rates, 91-, 182- and 364-day Treasury bill rates, the latest government bond auctions and Eurobond yields for Kenya, Uganda and Tanzania, each linked to the central bank’s own notice — plus Kenya money market fund yields beside the 91-day bill.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${site.url}/east-africa` },
  openGraph: { title, description, url: `${site.url}/east-africa` },
};

export default function EastAfricaPage() {
  const countries = eastAfricaCountries();
  const savings = kenyaSavings();
  const changes = monthChanges(countries);
  const newest = newestDate(countries, savings);

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets", label: "Markets" }, { label: "East Africa" }]}
      kicker="Kenya · Uganda · Tanzania"
      title="East Africa rates today"
      lede={
        <p>
          What the governments of Kenya, Uganda and Tanzania pay to borrow, and what the central banks have set, from each bank’s own notices.
          {newest ? (
            <>
              {" "}
              Newest figure on this page: <strong className="font-semibold text-ink">{eaDate(newest)}</strong>.
            </>
          ) : null}{" "}
          Every number links to the document it was read from.
        </p>
      }
    >
      <section aria-labelledby="ea-today">
        <h2 id="ea-today" className="sr-only">
          Rates by country
        </h2>
        <Glance countries={countries} />
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {countries.map((c) => (
            <CountryRates key={c.slug} c={c} />
          ))}
        </div>
        <p className="mt-3 max-w-3xl text-xs leading-5 text-muted">
          Rates are percent per year, as each publisher states them, and are not directly comparable across countries: Kenya and Tanzania publish a
          weighted average of accepted bids, Uganda the yield at the cut-off price. Bill dates are value (issue) dates. Policy rates are read from each
          central bank’s website with the date the bank prints beside the rate, in its own format.
        </p>
      </section>

      {savings ? (
        <section className="mt-14" aria-labelledby="ea-savings">
          <div id="ea-savings">
            <SectionTitle
              kicker="Kenya savings"
              title="What a shilling earns: top funds against the 91-day bill"
              note="Money market and fixed-income fund yields as each manager publishes them, with the Treasury bill for comparison."
            />
          </div>
          <div className="mt-5">
            <KenyaSavings s={savings} />
          </div>
        </section>
      ) : null}

      {changes.length ? (
        <section className="mt-14" aria-labelledby="ea-changes">
          <div id="ea-changes">
            <SectionTitle
              kicker="Past four weeks"
              title="What changed this month"
              note="Computed from the auction notices and bulletins: each line compares the latest figure with the newest one at least four weeks earlier, or with the same bond’s previous sale. 1 bp = 0.01 percentage point."
            />
          </div>
          <div className="mt-5">
            <MonthChanges items={changes} />
          </div>
        </section>
      ) : null}

      <section className="mt-14 grid gap-6 lg:grid-cols-2" aria-label="Alerts and data access">
        <EmailAlertBox
          kinds={["auction", "policy_change", "mmf_month"]}
          title="Get the next result by email"
          note="Each Kenya T-bill result, any central-bank rate change, or the monthly Kenya fund ranking."
        />
        <aside className="mt-6 rounded-2xl border border-rule bg-surface px-5 py-5">
          <p className="text-[14px] font-semibold text-ink">For banks, funds and research teams</p>
          <p className="mt-1 text-[13px] leading-5 text-ink-soft">
            The full auction history behind this page, for Kenya, Uganda, Tanzania and the other frontier markets Afronomics covers, by API and CSV, with
            the source notice on every row.
          </p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
            <Link href="/data/frontier-local-debt#pilot" className="font-semibold text-forest underline underline-offset-2">
              Request a 30-day pilot
            </Link>
            <Link href="/alerts" className="text-forest underline underline-offset-2">
              Phone alerts for every market
            </Link>
          </p>
        </aside>
      </section>

      <section className="mt-14" aria-labelledby="ea-more">
        <div id="ea-more">
          <SectionTitle kicker="Go deeper" title="Every auction, every series" />
        </div>
        <div className="mt-5">
          <HubLinks />
        </div>
      </section>

      <p className="mt-10 max-w-3xl text-sm leading-6 text-ink-soft">
        Sources: Central Bank of Kenya, Bank of Uganda, Bank of Tanzania and the fund managers named above, each linked beside its figure. Afronomics
        compiles and checks; the publisher is the source. <em>Information, not advice.</em>
      </p>

      <CiteBlock title="East Africa interest rates today" path="/east-africa" publisher="the Central Bank of Kenya, Bank of Uganda and Bank of Tanzania" />
      <NewsletterBand />
    </PageShell>
  );
}
