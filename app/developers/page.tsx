import { bondCoverageText } from "@/lib/data/sovereign-bonds";
import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { DataTerms } from "@/components/billing/DataTerms";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { billMarkets } from "@/lib/data/sovereign-bills";
import { site } from "@/lib/site";
import { fitDescription } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Data API: African bond and T-bill auctions as JSON",
  description: fitDescription("A free JSON API for African government bond and Treasury bill auction results and the Afronomics borrowing-cost measures, every row linked to its source. The latest 12 months are free with no key; full history and commercial use need a pilot or paid key."),
  alternates: { canonical: `${site.url}/developers` },
};

const endpoints = [
  {
    path: "/api/v1/tbills",
    what: "Every market with its latest 91-, 182- and 364-day result, the previous rate, the source document and where the history starts.",
  },
  {
    path: "/api/v1/tbills/{market}",
    what: "One market’s auction history. Optional: tenor=91|182|364, from and to (YYYY-MM-DD), limit. Newest first. No key: the latest 12 months, up to 100 rows a call. With a key: full history, limit default 500, up to 5,000.",
  },
  {
    path: "/api/v1/bonds",
    what: `Government bond auctions: each market with data (${bondCoverageText()}), where its history starts, whether its dates are auction or settlement dates (date_kind), and its latest results.`,
  },
  {
    path: "/api/v1/bonds/{market}",
    what: "One market’s bond auction history: ISIN, tenor, amounts offered, bid and accepted, bid-to-cover, rate and coupon, with the source. Optional: isin, issue (the WAEMU country, e.g. issue=senegal), from and to (YYYY-MM-DD), limit. Newest first. Same free and keyed limits as bills.",
  },
  {
    path: "/api/v1/index",
    what: "The Afronomics African Sovereign Bill Index: latest weekly reading, changes, each market’s contribution and the weekly series (the latest 12 months without a key, the full series with one). tenor=91 for the three-month version.",
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

# Kenya's 91-day rate over the last 12 months (free), into pandas
import pandas as pd
rows = requests.get(f"{base}/tbills/kenya", params={"tenor": 91}).json()["rows"]
df = pd.DataFrame(rows).set_index("date").sort_index()

# Full history: send your pilot or licence key
key = {"Authorization": "Bearer afk_YOUR_KEY"}
rows = requests.get(f"{base}/tbills/kenya", params={"tenor": 91, "from": "2010-01-01"}, headers=key).json()["rows"]`;

const curl = `curl "${site.url}/api/v1/tbills/nigeria?tenor=364&limit=10"

# With a key: full history, up to 5,000 rows a call
curl -H "Authorization: Bearer afk_YOUR_KEY" \\
  "${site.url}/api/v1/tbills/nigeria?tenor=364&from=2010-01-01"`;

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
          , open to any script or spreadsheet. The latest 12 months, up to 100 rows a call, need no key and no sign-up: call it, keep the credit
          line, and link back. Full history, larger calls and any commercial use, including internal use at a fund, bank or firm, need a{" "}
          <Link href="/pricing#pilot" className="font-semibold text-forest underline underline-offset-2">
            pilot or paid key
          </Link>
          ; see the{" "}
          <a href="#terms" className="underline underline-offset-2">
            terms
          </a>{" "}
          and{" "}
          <Link href="/data-api" className="underline underline-offset-2">
            Afronomics Data
          </Link>
          .
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
        <div className="min-w-0">
          <SectionTitle kicker="Python" title="From Python" />
          <pre className="mt-4 max-w-full overflow-x-auto rounded-2xl bg-night p-5 text-[13px] leading-6 text-night-ink">
            <code>{python}</code>
          </pre>
        </div>
        <div className="min-w-0">
          <SectionTitle kicker="Shell" title="From the command line" />
          <pre className="mt-4 max-w-full overflow-x-auto rounded-2xl bg-night p-5 text-[13px] leading-6 text-night-ink">
            <code>{curl}</code>
          </pre>
          <p className="mt-4 text-sm leading-6 text-ink-soft">
            Responses are cached for five minutes and allow calls from any website (CORS open), so you can fetch them straight from a browser page. Every response
            carries an <code className="text-[13px]">attribution</code> line; show it wherever the numbers appear.
          </p>
        </div>
      </section>

      <section className="mt-14 max-w-3xl" id="free-tier">
        <SectionTitle kicker="Free tier and keys" title="What a call without a key returns" />
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-soft">
          <li>
            History calls (<code className="text-[13px]">/tbills/&#123;market&#125;</code>, <code className="text-[13px]">/bonds/&#123;market&#125;</code> and the
            CSV files under <code className="text-[13px]">/api/data/</code>) return rows dated in the latest 12 months, by auction or settlement date, up to 100 a
            call. Nothing is cut silently: whenever a key would have returned more, the response says{" "}
            <code className="text-[13px]">&quot;truncated&quot;: true</code> with an <code className="text-[13px]">upgrade</code> link. It also carries a{" "}
            <code className="text-[13px]">free_tier</code> note, with <code className="text-[13px]">free_tier.next</code> for the next page inside the free
            window, and every keyless response has the header <code className="text-[13px]">X-Afronomics-Free-Tier: true</code>. CSV files say the same in the{" "}
            <code className="text-[13px]">#</code> lines at the top.
          </li>
          <li>
            Send a key as <code className="text-[13px]">Authorization: Bearer afk_…</code> (or <code className="text-[13px]">X-API-Key: afk_…</code>) for the full
            history and up to 5,000 rows a call; a CSV file with a key is the whole file. Keyed calls are served fresh and counted per key.
          </li>
          <li>
            A key that is unknown, revoked or expired is not an error: the call gets the free tier, with{" "}
            <code className="text-[13px]">&quot;key_status&quot;: &quot;not_recognised&quot;</code> and the header{" "}
            <code className="text-[13px]">X-Afronomics-Key: not-recognised</code>.
          </li>
        </ul>
      </section>

      <section className="mt-14" id="terms">
        <SectionTitle kicker="Terms" title="Free to read and cite; a key for history and commercial use" />
        <DataTerms />
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          Fair use: please cache on your side rather than calling on every page view. Plans and prices are on the{" "}
          <Link href="/licensing" className="underline underline-offset-2">
            licensing page
          </Link>
          .
        </p>
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
