import type { Metadata } from "next";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { AdviceDisclaimer } from "@/components/legal/AdviceDisclaimer";
import { KINDS, TEMPLATE_HEADER } from "@/lib/benchmark";
import { verifyOrgLink } from "@/lib/org-links";
import { rpc } from "@/lib/store";
import { UploadForm } from "./UploadForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your treasury benchmark", robots: { index: false, follow: false } };

/** The current quarter and the three before it, newest first ("2026-Q4", "2026-Q3", …). */
function recentQuarters(now = new Date()) {
  const out: string[] = [];
  let y = now.getUTCFullYear();
  let q = Math.floor(now.getUTCMonth() / 3) + 1;
  for (let i = 0; i < 4; i++) {
    out.push(`${y}-Q${q}`);
    q -= 1;
    if (q === 0) {
      q = 4;
      y -= 1;
    }
  }
  return out;
}

/**
 * An institution's private benchmarking page (lib/org-links.ts): send a quarter's holdings, and open each released
 * quarter's page. Shared by the founder personally; nothing is emailed.
 */
export default async function BenchmarkClientPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const link = verifyOrgLink(token, "benchmark");
  const secret = process.env.AF_CRON_SECRET ?? "";
  const quarters = recentQuarters();
  const org = link ? await rpc("af_desk_org_get", { p_secret: secret, p_org: link.org }) : null;
  const name = org?.ok ? (org.value as { name?: string } | null)?.name : undefined;
  if (!link || !name) {
    return (
      <PageShell share={false} crumbs={[{ href: "/benchmarking", label: "Treasury benchmarking" }, { label: "Private page" }]} kicker="Private" title="This link has expired">
        <p className="max-w-xl text-sm text-ink-soft">Ask the Afronomics desk for a new link to your institution&rsquo;s benchmarking page.</p>
      </PageShell>
    );
  }
  const released = await Promise.all(quarters.map((q) => rpc("af_benchmark_released", { p_secret: secret, p_org: link.org, p_quarter: q })));
  const ready = quarters.filter((_, i) => released[i].ok && released[i].value);
  return (
    <PageShell share={false} crumbs={[{ href: "/benchmarking", label: "Treasury benchmarking" }, { label: name }]} kicker="Private to your institution" title={`Treasury benchmark: ${name}`}>
      <section>
        <SectionTitle kicker="Your pages" title="Released quarters" />
        {ready.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {ready.map((q) => (
              <li key={q}>
                <a href={`/benchmarking/client/${token}/report?q=${q}`} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center rounded-full border border-rule bg-surface px-4 py-1.5 text-[13px] font-medium text-ink hover:border-accent">
                  {q.replace("-", " ")}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink-soft">None yet. Once you send a quarter&rsquo;s holdings, the desk checks the page and releases it here within five working days.</p>
        )}
      </section>
      <section className="mt-12">
        <SectionTitle kicker="Send a quarter" title="Your holdings, one line each" />
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">
          Columns: <code>{TEMPLATE_HEADER}</code>. Kind is one of {KINDS.join(", ")}; dates as YYYY-MM-DD; the rate is the annual rate the holding earns,
          before tax. No member or personal data, please. <a href="/documents/benchmark-template.csv" className="underline underline-offset-2">Download the template</a>.
        </p>
        <div className="mt-4">
          <UploadForm token={token} quarters={quarters} />
        </div>
      </section>
      <AdviceDisclaimer />
    </PageShell>
  );
}
