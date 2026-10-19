import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Card } from "@/components/ui/Card";
import { TableScroll } from "@/components/ui/DataTable";
import { Stat, StatGroup } from "@/components/ui/Stat";
import { loadHealth } from "@/lib/data/health";
import { hoursText, loadLatency } from "@/lib/data/latency";
import { billMarkets, loadBillMarket } from "@/lib/data/sovereign-bills";
import { bondMarkets, loadBondMarket } from "@/lib/data/sovereign-bonds";
import { site } from "@/lib/site";
import { fitDescription, fitTitle } from "@/lib/seo";
import { SITE_CARD_ALT, shareImage } from "@/lib/share-image";

export const revalidate = 3600;

const title = "Trust and data security: how Afronomics data is collected and kept";
const description =
  "For institutions doing due diligence: where each auction dataset comes from, how often it is read, how freshness and delay are measured, how errors are corrected, and the security practices behind the site and API.";

export const metadata: Metadata = {
  title: fitTitle(title),
  description: fitDescription(description),
  alternates: { canonical: `${site.url}/trust` },
  openGraph: { title, description, url: `${site.url}/trust`, images: shareImage("", SITE_CARD_ALT) },
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const fmt = (d: string | null | undefined) => (d ? dateFmt.format(new Date(`${d.slice(0, 10)}T12:00:00Z`)) : "—");

type Row = { name: string; kind: string; publisher: string; href: string; results: number; from: string | null; latest: string | null; page: string };

function datasets(): Row[] {
  const bills: Row[] = billMarkets.map((m) => {
    const rows = loadBillMarket(m.slug).rows;
    const dates = rows.map((r) => r.date).sort();
    return { name: m.country, kind: "T-bills", publisher: m.publisher, href: m.sourcePage, results: rows.length, from: dates[0] ?? null, latest: dates.at(-1) ?? null, page: m.href };
  });
  const bonds: Row[] = bondMarkets.map((m) => {
    const rows = loadBondMarket(m.slug).rows;
    const dates = rows.map((r) => r.date).sort();
    return {
      name: m.slug === "waemu" ? "WAEMU (8 treasuries)" : m.country,
      kind: "Bonds",
      publisher: m.publisher,
      href: m.sourcePage,
      results: rows.length,
      from: dates[0] ?? null,
      latest: dates.at(-1) ?? null,
      page: m.slug === "kenya" ? "/markets/kenya-bonds" : `/markets/bonds/${m.slug}`,
    };
  });
  return [...bills, ...bonds].filter((r) => r.results > 0);
}

/** Security practices, each one true in the code or the database as checked in the 13 October 2026 security review. */
const practices: [string, string][] = [
  ["Encrypted in transit", "The site and API are served only over HTTPS, with HTTP Strict Transport Security (two years, subdomains included)."],
  ["Browser hardening", "Every page sends nosniff, a strict referrer policy and a permissions policy that turns off camera, microphone and location. Pages cannot be framed by other sites, except the widgets made for embedding. A Content-Security-Policy runs in report-only mode while it is tuned."],
  ["API keys", "Keys are accepted only in a request header (Authorization or X-API-Key), never in a URL. We store only a one-way SHA-256 hash of each key, never the key itself, and never write keys to logs. Keyed responses are marked private and are not cached."],
  ["Pilot keys", "A pilot key is sent only to the work email address that asked for it; it is not shown on screen. Pilot keys expire after 30 days."],
  ["Database access", "Row-level security is on for every table. Tables that hold personal data (leads, subscribers, payments, keys) have no public read policy; only server functions holding a secret can reach them."],
  ["Payments", "Card and mobile-money payments are taken by Paystack. Afronomics receives the email, plan and payment status, never full card details. Payment notifications are verified by signature before anything is recorded."],
  ["No advertising trackers", "No third-party analytics or ad networks. Page counts are kept without cookies and without storing IP addresses (see the privacy notice)."],
  ["Logs", "Server logs and error messages are written without email addresses: requests are logged by domain or payment reference."],
  ["Dependencies", "Framework security advisories are tracked and patched; the last full review (13 October 2026) upgraded the web framework to a patched release and found no secrets in the code or its history."],
];

/** Third parties that process data for Afronomics, as wired in the code. Named so a vendor questionnaire can be answered. */
const processors: [string, string][] = [
  ["Vercel", "Hosts the website and API."],
  ["Supabase", "Database for leads, subscribers, API keys, payments records and usage counts."],
  ["Paystack", "Takes payments (card, M-Pesa, bank transfer)."],
  ["Resend", "Sends transactional and newsletter email."],
  ["GitHub", "Holds the code and the published data files, and runs the scheduled data readers."],
];

export default function TrustPage() {
  const rows = datasets();
  const health = loadHealth();
  const latency = loadLatency();
  const total = rows.reduce((n, r) => n + r.results, 0);
  const contact = (subject: string) => `mailto:${site.contactEmail}?subject=${encodeURIComponent(subject)}`;

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/for-institutions", label: "For institutions" }, { label: "Trust & data security" }]}
      kicker="Due diligence"
      title="Trust and data security"
      lede={
        <p>
          What a risk, compliance or data team needs to check before relying on Afronomics: where each dataset comes from, how and how often it is read, how
          we know it is current, how errors are corrected, and how the site and API are secured. Everything below is generated from the data files or describes
          what the code does today. Where something is not in place yet, it says so.
        </p>
      }
      aside={
        <Card tone="muted">
          <p className="text-[14px] font-semibold text-ink">Security questionnaire?</p>
          <p className="mt-1 text-[13px] leading-5 text-ink-soft">
            Send your vendor or data-security questionnaire and we complete it. Buying process, invoices and licence terms are on{" "}
            <Link href="/buying" className="underline underline-offset-2">
              buying for an institution
            </Link>
            .
          </p>
          <a href={contact("Security questionnaire")} className="mt-3 inline-block text-[13px] font-semibold text-forest underline underline-offset-2">
            {site.contactEmail}
          </a>
        </Card>
      }
    >
      <StatGroup>
        <Stat label="Auction results held" value={total.toLocaleString("en-US")} detail={`${rows.length} bill and bond datasets`} source="Counted from the data files at build" />
        <Stat
          label="Figures checked for freshness"
          value={health ? health.items.length : "—"}
          detail={health ? `${health.summary.ok} up to date · ${health.summary.late + health.summary.failed} late · ${health.summary.gap} not available` : "First check pending"}
          source={health ? `Last check ${fmt(health.checked_on)}` : undefined}
        />
        <Stat
          label="Median delay after publisher"
          value={latency?.overall.p50_h != null ? hoursText(latency.overall.p50_h) : "Measuring"}
          detail={latency ? `${latency.overall.timed} of ${latency.overall.results} new results carry a publisher time` : "Starts with the next data run"}
          source="Publication delay, on the data status page"
        />
        <Stat label="Reading schedule" value="Every 2 h" detail="07:17–21:17 Nairobi on weekdays; four times a day at weekends" source="Scheduled data run" />
      </StatGroup>

      <section className="mt-14" id="datasets">
        <SectionTitle
          kicker="Provenance"
          title="Where each auction dataset comes from"
          note="One row per dataset. The publisher link goes to the official results page we read; every row inside a dataset links to its own notice or document."
        />
        <TableScroll label="Auction datasets and their official sources" className="mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Dataset</th>
                <th>Official source</th>
                <th className="text-right">Results</th>
                <th className="text-right">From</th>
                <th className="text-right">Latest</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.kind}:${r.name}`}>
                  <td className="text-sm">
                    <Link href={r.page} className="font-medium hover:text-forest">
                      {r.name}
                    </Link>
                    <span className="ml-2 text-[11px] text-muted">{r.kind}</span>
                  </td>
                  <td className="min-w-[14rem] text-[13px]">
                    <a href={r.href} target="_blank" rel="noopener noreferrer" data-track="source_click" className="underline underline-offset-2 hover:text-forest">
                      {r.publisher}
                    </a>
                  </td>
                  <td className="text-right text-sm tabular-nums">{r.results.toLocaleString("en-US")}</td>
                  <td className="whitespace-nowrap text-right text-sm">{r.from ? r.from.slice(0, 4) : "—"}</td>
                  <td className="whitespace-nowrap text-right text-sm">{fmt(r.latest)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
        <p className="mt-2 text-xs text-muted">
          Some publishers date results by settlement rather than auction day; each market page says which. Macro series, currencies and the Wire are sourced as
          described on <Link href="/method" className="underline underline-offset-2">sources and method</Link>.
        </p>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-2" id="collection">
        <div>
          <SectionTitle kicker="Collection" title="How the data is read" />
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-ink-soft">
            <li>
              One reader per publisher downloads the publisher&rsquo;s own published results (a web page, a PDF or a spreadsheet) on a schedule: every two hours
              from 07:17 to 21:17 Nairobi time on weekdays and four times a day at weekends, plus every 20 minutes on Thursday afternoons, when Kenya&rsquo;s
              bill results are due.
            </li>
            <li>
              The reader extracts each result into one shape (rate, tenor, amounts offered, received and accepted, and the source document&rsquo;s address) and
              adds it to the market&rsquo;s data file. Figures are never typed in by hand, estimated or written by a language model.
            </li>
            <li>
              Data files are kept under version control, so every change to every figure has a dated record of what changed. Readers have automated tests
              against publisher documents.
            </li>
            <li>
              After each run, a freshness check compares every dataset with its publisher&rsquo;s own rhythm and lists anything late or unreadable on the{" "}
              <Link href="/status" className="underline underline-offset-2">
                data status page
              </Link>
              , and the delay between the publisher&rsquo;s release and our first record is measured per result (
              <Link href="/status#latency" className="underline underline-offset-2">
                publication delay
              </Link>
              ).
            </li>
          </ol>
        </div>
        <div>
          <SectionTitle kicker="Changes and errors" title="Corrections and change history" />
          <ul className="mt-4 space-y-3 text-sm leading-6 text-ink-soft">
            <li>
              A figure that changes after publication (a restatement, a misread document, a duplicated row) is logged with what was wrong, what changed and why
              in the{" "}
              <Link href="/reference#corrections" className="underline underline-offset-2">
                data corrections log
              </Link>
              . Corrections to articles are on the{" "}
              <Link href="/corrections" className="underline underline-offset-2">
                corrections page
              </Link>
              .
            </li>
            <li>
              Definitions of each market&rsquo;s rate, the index method and the record of when each result was first seen are on{" "}
              <Link href="/reference" className="underline underline-offset-2">
                the reference
              </Link>
              .
            </li>
            <li>
              Report a data issue:{" "}
              <a href={contact("Data issue")} className="underline underline-offset-2">
                {site.contactEmail}
              </a>{" "}
              with the subject &ldquo;Data issue&rdquo;, the page and the figure.
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-14" id="security">
        <SectionTitle kicker="Security" title="How the site, API and your data are protected" note="As checked in our security review of 13 October 2026." />
        <ul className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {practices.map(([t, d]) => (
            <li key={t}>
              <h3 className="font-serif text-xl text-ink">{t}</h3>
              <p className="mt-1 text-sm leading-6 text-ink-soft">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-2" id="processors">
        <div>
          <SectionTitle kicker="Sub-processors" title="Who processes data for us" />
          <TableScroll label="Sub-processors" className="mt-4">
            <table className="data-table">
              <tbody>
                {processors.map(([n, d]) => (
                  <tr key={n}>
                    <th scope="row" className="text-sm font-medium text-ink">
                      {n}
                    </th>
                    <td className="text-sm text-ink-soft">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
          <p className="mt-2 text-xs text-muted">
            Personal data is handled under Kenya&rsquo;s Data Protection Act, 2019; see the{" "}
            <Link href="/legal/privacy" className="underline underline-offset-2">
              privacy notice
            </Link>
            .
          </p>
        </div>
        <div>
          <SectionTitle kicker="Not yet in place" title="What we do not have today" />
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-soft">
            <li>No SOC 2 or ISO 27001 certification.</li>
            <li>No published uptime figure or uptime commitment for the open site and API. Service levels are agreed per contract on Enterprise.</li>
            <li>No written data-retention schedule yet; you can ask us to delete your data at any time.</li>
            <li>The Content-Security-Policy is in report-only mode, not yet enforced.</li>
          </ul>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            We list these so your review does not have to find them. Ask about any of them at{" "}
            <a href={contact("Security")} className="underline underline-offset-2">
              {site.contactEmail}
            </a>
            .
          </p>
        </div>
      </section>
    </PageShell>
  );
}
