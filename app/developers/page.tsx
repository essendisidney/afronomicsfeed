import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { billMarkets } from "@/lib/data/sovereign-bills";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Afronomics data API — African Treasury bill auctions as JSON",
  description:
    "A free JSON API for Treasury bill auction results in ten African markets and the Afronomics borrowing-cost measures. No key needed; licences for commercial use and alerts.",
  alternates: { canonical: `${site.url}/developers` },
};

const endpoints = [
  {
    path: "/api/v1/tbills",
    what: "Every market with its latest 91-, 182- and 364-day result, the previous rate, the source document and where the history starts.",
  },
  {
    path: "/api/v1/tbills/{market}",
    what: "One market’s auction history. Optional: tenor=91|182|364, from and to (YYYY-MM-DD), limit (default 500, up to 5,000). Newest first.",
  },
  {
    path: "/api/v1/index",
    what: "The Afronomics African Sovereign Bill Index: latest weekly reading, changes, each market’s contribution and the full series. tenor=91 for the three-month version.",
  },
  {
    path: "/api/v1/measures",
    what: "Real yields on one-year bills, bids-to-offer demand over the last 90 days, and each market’s expected next result.",
  },
];

const python = `import requests

base = "${site.url}/api/v1"

# Latest one-year rate in every market
for m in requests.get(f"{base}/tbills").json()["markets"]:
    one_year = m["latest"].get("364")
    if one_year:
        print(m["country"], one_year["rate"], one_year["date"])

# Kenya's 91-day history since 2024, into pandas
import pandas as pd
rows = requests.get(f"{base}/tbills/kenya", params={"tenor": 91, "from": "2024-01-01"}).json()["rows"]
df = pd.DataFrame(rows).set_index("date").sort_index()`;

const curl = `curl "${site.url}/api/v1/tbills/nigeria?tenor=364&limit=10"`;

export default function DevelopersPage() {
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/data", label: "Data" }, { label: "Developers" }]}
      kicker="Data API"
      title="African government auctions, as JSON"
      lede={
        <p>
          The datasets behind the{" "}
          <Link href="/markets/tbills" className="underline underline-offset-2">
            T-bill monitor
          </Link>{" "}
          and{" "}
          <Link href="/markets/borrowing-costs" className="underline underline-offset-2">
            borrowing-cost measures
          </Link>
          , open to any script or spreadsheet. No key and no sign-up: call it, keep the credit line, and link back.
        </p>
      }
    >
      <SectionTitle kicker="Endpoints" title="Four calls cover everything" />
      <div className="overflow-x-auto">
        <table className="data-table mt-2">
          <thead>
            <tr>
              <th>Request</th>
              <th>Returns</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((e) => (
              <tr key={e.path}>
                <td className="whitespace-nowrap">
                  <code className="rounded-md bg-paper-2 px-1.5 py-0.5 text-[13px]">GET {e.path}</code>
                </td>
                <td className="text-sm text-ink-soft">{e.what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-ink-soft">
        Markets:{" "}
        {billMarkets.map((m, i) => (
          <span key={m.slug}>
            <code className="text-[13px]">{m.slug}</code>
            {i < billMarkets.length - 1 ? ", " : "."}
          </span>
        ))}{" "}
        Rates are percent per annum as each central bank publishes them; amounts are in local currency, millions.
      </p>

      <section className="mt-14 grid gap-8 lg:grid-cols-2">
        <div>
          <SectionTitle kicker="Python" title="From Python" />
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-night p-5 text-[13px] leading-6 text-night-ink">
            <code>{python}</code>
          </pre>
        </div>
        <div>
          <SectionTitle kicker="Shell" title="From the command line" />
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-night p-5 text-[13px] leading-6 text-night-ink">
            <code>{curl}</code>
          </pre>
          <p className="mt-4 text-sm leading-6 text-ink-soft">
            Responses are cached for five minutes and allow calls from any website (CORS open), so you can fetch them straight from a browser page. Every response
            carries an <code className="text-[13px]">attribution</code> line; show it wherever the numbers appear.
          </p>
        </div>
      </section>

      <section className="mt-14" id="terms">
        <SectionTitle kicker="Terms" title="Free to build on, licensed to resell" />
        <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-2">
          <div className="bg-surface px-5 py-6">
            <p className="text-[13px] font-semibold text-gold">Open</p>
            <p className="mt-2 font-serif text-3xl text-ink">Free</p>
            <p className="mt-3 text-sm leading-6 text-ink-soft">
              Research, journalism, teaching, internal analysis and non-commercial apps. Keep the credit “Source: Afronomics” with a link. Fair use: please cache on
              your side rather than calling on every page view.
            </p>
          </div>
          <div className="bg-surface px-5 py-6">
            <p className="text-[13px] font-semibold text-gold">Licensed</p>
            <p className="mt-2 font-serif text-3xl text-ink">From KES 7,500 a month</p>
            <p className="mt-3 text-sm leading-6 text-ink-soft">
              About $59. Use inside a commercial product or client work, redistribution, a webhook or email the moment each market reports, the full field set for every
              auction, and a named contact. Details on the{" "}
              <Link href="/licensing" className="underline underline-offset-2">
                licensing page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14 max-w-2xl" id="enquiry">
        <SectionTitle kicker="Licence" title="Building something? Tell us" />
        <div className="mt-4">
          <EnquiryForm interest="licensing" cta="Send" />
        </div>
      </section>
    </PageShell>
  );
}
