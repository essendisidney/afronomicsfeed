import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { rpcRead } from "@/lib/store";
import { site } from "@/lib/site";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Jobs — treasury, risk, research and analyst roles across African finance",
  description:
    "Roles at the banks, funds, SACCOs, insurers and DFIs that read Afronomics: treasury, ALM, fixed income, risk, research and data. Listed by the institutions themselves; KES 10,000 for 30 days.",
  alternates: { canonical: `${site.url}/jobs` },
};

type Job = { id: number; title: string; institution: string; location: string | null; role_type: string | null; closes: string | null; apply_url: string | null; description: string | null; published_at: string };

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default async function JobsPage() {
  const r = await rpcRead("af_jobs", {}, 600);
  const jobs = r.ok && Array.isArray(r.value) ? (r.value as Job[]) : [];
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Jobs" }]}
      kicker="Jobs"
      title="Roles for people who read the numbers"
      lede={
        <p>
          Treasury, asset–liability, fixed income, risk, research and data roles at the institutions that use Afronomics. Listed by the
          institutions themselves, never scraped; free to read and apply, always with the original application link.
        </p>
      }
      aside={
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5 text-sm text-ink-soft">
          <p className="text-[14px] font-semibold text-ink">Hiring?</p>
          <p className="mt-1 leading-6">KES 10,000 for 30 days, in front of treasurers, analysts and investment committees across ten markets. Live within a day.</p>
          <Link href="/jobs/post" className="mt-4 inline-block rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-paper hover:bg-forest">
            Post a role
          </Link>
        </div>
      }
    >
      <SectionTitle kicker="Open" title={jobs.length ? `${jobs.length} role${jobs.length === 1 ? "" : "s"}` : "No roles listed yet"} />
      <ul className="mt-4 divide-y divide-rule">
        {jobs.map((j) => (
          <li key={j.id} className="py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-[17px] font-semibold text-ink">{j.title}</h3>
              <span className="text-[12px] text-muted">Posted {fmt.format(new Date(j.published_at))}{j.closes ? ` · closes ${fmt.format(new Date(j.closes))}` : ""}</span>
            </div>
            <p className="mt-0.5 text-sm text-ink-soft">
              {j.institution}
              {j.location ? ` · ${j.location}` : ""}
              {j.role_type ? ` · ${j.role_type}` : ""}
            </p>
            {j.description ? <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-ink-soft">{j.description}</p> : null}
            {j.apply_url ? (
              <p className="mt-3">
                <a
                  href={j.apply_url.includes("@") && !j.apply_url.startsWith("http") ? `mailto:${j.apply_url}` : j.apply_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-block rounded-full border border-ink/20 px-4 py-2 text-[13px] font-semibold text-ink hover:border-accent"
                >
                  Apply
                </a>
              </p>
            ) : null}
          </li>
        ))}
        {!jobs.length ? (
          <li className="py-5 text-sm text-ink-soft">
            The first listings appear here as institutions post them. If you are hiring,{" "}
            <Link href="/jobs/post" className="underline underline-offset-2">
              post the role
            </Link>
            .
          </li>
        ) : null}
      </ul>
      <p className="mt-8 text-xs text-muted">Afronomics verifies that each listing comes from the named institution before it goes live, and never charges applicants. Report a listing: desk@afronomicsfeed.com.</p>
    </PageShell>
  );
}
