import type { Metadata } from "next";
import Link from "next/link";
import { HealthList } from "@/components/data/HealthList";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { loadHealth } from "@/lib/data/health";
import { site } from "@/lib/site";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Data status: is every figure up to date?",
  description: "Whether each rate, auction and yield on Afronomics is as fresh as its publisher’s own release rhythm, checked after every data run. Late or unreadable figures are listed, not hidden.",
  alternates: { canonical: `${site.url}/status` },
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default function StatusPage() {
  const health = loadHealth();
  const attention = health?.items.filter((x) => x.status !== "ok") ?? [];
  const fine = health?.items.filter((x) => x.status === "ok") ?? [];
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
          <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
            <p className="text-[13px] font-medium text-muted">Figures checked</p>
            <p className="mt-1 font-serif text-3xl text-ink">{health.items.length}</p>
            <p className="mt-1 text-[12px] text-muted">
              {health.summary.ok} up to date · {health.summary.late + health.summary.failed} late or not read · {health.summary.gap} not available
            </p>
          </div>
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
                <HealthList items={attention} />
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-soft">Every figure is as fresh as its publisher’s rhythm says it should be.</p>
            )}
          </section>
          <section className="mt-12">
            <SectionTitle kicker="Up to date" title="Everything else" />
            <div className="mt-4">
              <HealthList items={fine} />
            </div>
          </section>
        </>
      )}
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
