import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { publishedReports, researchReports } from "@/lib/demo/reports";

export const metadata: Metadata = {
  title: "Reports",
  description: "Research report shells on Afronomics. Empty until a cited brief is filed.",
};

export default function ReportsPage() {
  const published = publishedReports();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Reports" }]}
      kicker="Reports"
      title="Memos before volume"
      lede="Each row is a research shape. Outline means a related brief exists. Empty means the memo is not written. Published stays zero until filed."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Slots</p>
          <p className="mt-1 font-serif text-xl">{researchReports.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Published</p>
          <p className="mt-1 font-serif text-xl">{published.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Seat gate</p>
          <p className="mt-1 font-serif text-xl">Not live</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/brief" className="text-forest underline underline-offset-2">
          Brief
        </Link>
        {" · "}
        <Link href="/packs" className="text-forest underline underline-offset-2">
          Packs
        </Link>
        {" · "}
        <Link href="/method" className="text-forest underline underline-offset-2">
          Method
        </Link>
        {" · "}
        <Link href="/licensing" className="text-forest underline underline-offset-2">
          Licensing
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {researchReports.map((report) => (
          <li key={report.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {report.desk} · {report.seat} · {report.status}
            </p>
            <p className="mt-1 font-serif text-xl">{report.title}</p>
            <p className="mt-1 text-sm text-ink-soft">{report.lede}</p>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {report.hrefs.map((href) => (
                <li key={href}>
                  <Link href={href} className="text-forest underline underline-offset-2">
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <Provenance source="No report store" methodology="Slots only. No invented research PDF." />
    </LayerPage>
  );
}
