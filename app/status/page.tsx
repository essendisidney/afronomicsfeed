import type { Metadata } from "next";
import Link from "next/link";
import { HealthList } from "@/components/data/HealthList";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { loadHealth } from "@/lib/data/health";
import { hoursText, latencyDate, loadLatency } from "@/lib/data/latency";
import { site } from "@/lib/site";
import { fitDescription } from "@/lib/seo";
import { TableScroll } from "@/components/ui/DataTable";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Data status: is every figure up to date?",
  description: fitDescription("Whether each rate, auction and yield on Afronomics is as fresh as its publisher’s own release rhythm, checked after every data run. Late or unreadable figures are listed, not hidden."),
  alternates: { canonical: `${site.url}/status` },
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default function StatusPage() {
  const health = loadHealth();
  const attention = health?.items.filter((x) => x.status !== "ok") ?? [];
  const fine = health?.items.filter((x) => x.status === "ok") ?? [];
  const latency = loadLatency();
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/method", label: "Sources & method" }, { label: "Data status" }]}
      kicker={health ? `Checked ${dateFmt.format(new Date(health.checked_on))}` : "Data status"}
      title="Is every figure up to date?"
      lede={
        <p>
          After every data run, Afronomics checks each figure against its publisher’s own rhythm: a market that auctions weekly should have a result from
          the last week or so, a fund that publishes daily should not show the same yield for a week. When something is late or cannot be read, it is
          listed here rather than left to look current.
        </p>
      }
      aside={
        health ? (
          <Card>
            <Stat
              label="Figures checked"
              value={health.items.length}
              detail={`${health.summary.ok} up to date · ${health.summary.late + health.summary.failed} late or not read · ${health.summary.gap} not available`}
              source={`Checked ${dateFmt.format(new Date(health.checked_on))}, after the latest data run`}
            />
          </Card>
        ) : null
      }
    >
      {!health ? (
        <p className="text-sm text-muted">The first check has not run yet.</p>
      ) : (
        <>
          <section>
            <SectionTitle kicker="Needs attention" title={attention.length ? "Late, not read or not available" : "Nothing late"} />
            {attention.length ? (
              <div className="mt-4">
                <HealthList items={attention} label="Figures late, not read or not available" />
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-soft">Every figure is as fresh as its publisher’s rhythm says it should be.</p>
            )}
          </section>
          <section className="mt-12">
            <SectionTitle kicker="Up to date" title="Everything else" />
            <div className="mt-4">
              <HealthList items={fine} label="Figures up to date" />
            </div>
          </section>
        </>
      )}
      <section id="latency" className="mt-12">
        <SectionTitle
          kicker="Publication delay"
          title="How long after the publisher do we carry each result?"
          note={
            latency
              ? `Measured since ${latencyDate(latency.since)}, for every new bill and bond auction result. Figures from ${latency.min_results} results with the publisher’s own release time; fewer, and no figure is shown.`
              : "Measuring starts with the next data run."
          }
        />
        <p className="mt-3 max-w-3xl text-sm text-ink-soft">
          For each new result we record when our reader first wrote it (the site and API carry it a few minutes later, once it deploys) and, only where
          the publisher exposes one, when the publisher released it: a time in its own listing, or the Last-Modified time of the result’s own
          document. Where a publisher gives no time, the market says “publisher time unknown”: we never estimate one. Readers run every two hours on
          weekdays and every four at weekends, so the delay includes that wait.
        </p>
        {latency ? (
          <TableScroll label="Publication delay by market" className="mt-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Market</th>
                  <th>Auctions</th>
                  <th className="text-right">New results</th>
                  <th className="text-right">With publisher time</th>
                  <th className="text-right">Median (p50)</th>
                  <th className="text-right">p90</th>
                  <th>Publisher time from</th>
                </tr>
              </thead>
              <tbody>
                {latency.summary.map((m) => (
                  <tr key={`${m.kind}:${m.market}`}>
                    <td className="font-medium text-ink">{m.name}</td>
                    <td>{m.kind === "bills" ? "T-bills" : "Bonds"}</td>
                    <td className="text-right">{m.results}</td>
                    <td className="text-right">{m.timed}</td>
                    <td className="text-right">{m.p50_h != null ? hoursText(m.p50_h) : "—"}</td>
                    <td className="text-right">{m.p90_h != null ? hoursText(m.p90_h) : "—"}</td>
                    <td className="text-[13px] text-ink-soft">{m.p50_h != null ? (m.publisher_time ?? "—") : m.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        ) : null}
      </section>

      <p className="mt-10 max-w-3xl text-sm text-ink-soft">
        Spotted a figure that looks wrong? Tell us at{" "}
        <a href={`mailto:${site.contactEmail}`} className="underline underline-offset-2">
          {site.contactEmail}
        </a>
        ; corrections are logged on{" "}
        <Link href="/reference" className="font-medium text-forest underline underline-offset-2">
          the reference
        </Link>
        . How each figure is read: <Link href="/method" className="font-medium text-forest underline underline-offset-2">sources and method</Link>.
      </p>
    </PageShell>
  );
}
