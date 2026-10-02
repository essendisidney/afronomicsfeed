import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { CopyCitation } from "@/components/ui/CopyCitation";
import { ShareRow } from "@/components/ui/ShareRow";
import { indexName, indexShort } from "@/lib/data/bill-index";
import { buildIndexRelease, indexReleaseText } from "@/lib/editions/index-release";
import { site } from "@/lib/site";

export const revalidate = 900;

export const metadata: Metadata = {
  title: `${indexShort} weekly release — the Afronomics African Sovereign Bill Index`,
  description: "The Monday release of the Afronomics African Sovereign Bill Index in one fixed format: the reading, the change, the movers, and every market's contribution. Free to quote with attribution.",
  alternates: { canonical: `${site.url}/markets/bill-index/release` },
};

export default function ReleasePage() {
  const r = buildIndexRelease();
  if (!r) return null;
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets/bill-index", label: indexShort }, { label: "Weekly release" }]}
      kicker={`${indexName} · week of ${r.week}`}
      title={r.headline}
      lede={<p>{r.lead}</p>}
      aside={
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5 text-sm text-ink-soft">
          <p className="text-[14px] font-semibold text-ink">For editors</p>
          <p className="mt-1 leading-6">Published every Monday at 07:30 Nairobi in this format. Quote the number with “according to Afronomics”. Get it by email: {site.contactEmail}.</p>
          <div className="mt-3">
            <CopyCitation text={indexReleaseText(r)} />
          </div>
          <p className="mt-3 text-[13px]">
            <a href="/api/edition/index?format=text" className="underline underline-offset-2">Plain text</a> · <a href="/api/edition/index" className="underline underline-offset-2">JSON</a> ·{" "}
            <Link href="/reference" className="underline underline-offset-2">Method and definitions</Link>
          </p>
        </div>
      }
    >
      <p className="text-[16px] leading-7 text-ink-soft">{r.moversText}</p>
      <p className="mt-3 text-[16px] leading-7 text-ink-soft">{r.range}</p>
      <section className="mt-10">
        <SectionTitle kicker="By market" title="364-day Treasury bill, latest result" />
        <table className="data-table mt-2">
          <thead>
            <tr>
              <th>Market</th>
              <th className="text-right">Rate</th>
              <th className="text-right">Week</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {r.table.map((t) => (
              <tr key={t.country}>
                <td>
                  <a href={t.href} className="font-medium hover:text-accent">
                    {t.country}
                  </a>
                </td>
                <td className="text-right text-sm">{t.rate.toFixed(2)}%</td>
                <td className={`text-right text-sm ${t.bps == null || t.bps === 0 ? "text-muted" : t.bps > 0 ? "text-down" : "text-up"}`}>{t.bps == null ? "—" : `${t.bps >= 0 ? "+" : "−"}${Math.abs(t.bps)} bps`}</td>
                <td className="text-xs text-muted">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <ShareRow text={`${indexName}: ${r.headline}`} path="/markets/bill-index/release" label="Forward" />
      <p className="mt-8 text-xs text-muted">{r.boiler}</p>
    </PageShell>
  );
}
