import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Stat, StatGroup } from "@/components/ui/Stat";
import { shortDate } from "@/lib/data/auction-week";
import { renderTime } from "@/lib/data/fetcher";
import { citationSummary, standing, type Citation } from "@/lib/citations-core";
import { loadCitations } from "@/lib/citations";
import { rpc } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Citation log", robots: { index: false, follow: false } };

const link = "font-medium text-forest underline underline-offset-2 hover:text-gold";

/**
 * Where Afronomics has been cited (docs/rebuild/upgrade-U6-plan.md, item C; UPGRADE §4 "Outside citations"). Reads
 * data/citations.json; entries are added with scripts/log_citation.py, never typed into a page. Behind the desk key;
 * anyone else gets a 404. In local development the key "preview-empty" opens it.
 */
export default async function DeskCitationsPage() {
  const key = (await cookies()).get("af_desk")?.value ?? "";
  const preview = process.env.NODE_ENV === "development" && key === "preview-empty";
  if (!preview) {
    const check = key ? await rpc("af_desk", { p_secret: key }) : null;
    if (!check?.ok || check.value == null) notFound();
  }
  const today = new Date(renderTime() + 3 * 3600000).toISOString().slice(0, 10);
  const { entries, updatedAt } = loadCitations();
  const list = standing(entries);
  const sum = citationSummary(entries, today);
  const withdrawn = entries.filter((e) => e.corrects).length;

  return (
    <PageShell share={false} crumbs={[{ href: "/desk", label: "Desk" }, { label: "Citation log" }]} kicker="Private · Distribution" title="Where we have been cited">
      <p className="max-w-2xl text-[15px] leading-7 text-ink-soft">
        Every article, report or post outside Afronomics that quoted or linked one of our figures, with its link. The log is{" "}
        <code className="font-mono text-[13px]">data/citations.json</code>
        {updatedAt ? `, last added to on ${shortDate(updatedAt)}` : ""}. Once it holds an entry, the newest twenty also show on{" "}
        <Link href="/press" className={link}>
          /press
        </Link>
        .
      </p>

      <StatGroup className="mt-6">
        <Stat label="Citations logged" value={sum.total} detail={withdrawn ? `${withdrawn} withdrawn, not counted` : "None withdrawn"} />
        <Stat label="Last 7 days" value={sum.last7} detail="By the date the piece ran" />
        <Stat label="Last 30 days" value={sum.last30} />
        <Stat label="Linked back" value={sum.linked} detail={`${sum.outlets} ${sum.outlets === 1 ? "outlet" : "outlets"}`} />
      </StatGroup>

      <section className="mt-10">
        <SectionTitle kicker="Log" title={list.length ? `${list.length} ${list.length === 1 ? "citation" : "citations"}, newest first` : "Nothing logged yet"} />
        {list.length ? (
          <DataTable<Citation>
            className="mt-3"
            label="Citation log"
            mobile="cards"
            rows={list}
            rowKey={(c) => c.id}
            columns={[
              {
                key: "t",
                header: "Piece",
                cell: (c) => (
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className={link}>
                    {c.title}
                  </a>
                ),
              },
              { key: "o", header: "Outlet", cell: (c) => `${c.outlet} (${c.kind})` },
              { key: "d", header: "Ran", cell: (c) => shortDate(c.date) },
              { key: "w", header: "Used", cell: (c) => (c.our_path ? <Link href={c.our_path} className={link}>{c.what}</Link> : c.what) },
              { key: "l", header: "Links to us", cell: (c) => (c.linked ? "Yes" : "No") },
              { key: "b", header: "Logged", cell: (c) => `${shortDate(c.logged_on)}, ${c.logged_by}` },
            ]}
          />
        ) : (
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-ink-soft">
            The first one goes here. Search for “Afronomics” and “afronomicsfeed” in news search, LinkedIn and X once a week, and log each piece
            that uses a figure of ours.
          </p>
        )}
      </section>

      <Card tone="muted" className="mt-10 max-w-3xl">
        <p className="text-[14px] font-semibold text-ink">Add one</p>
        <p className="mt-1 text-[13.5px] leading-6 text-ink-soft">On a branch, then a pull request as for any data change. The script checks every field and refuses a duplicate link.</p>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-surface p-3 font-mono text-[12px] leading-5 text-ink">
          {`python scripts/log_citation.py --date YYYY-MM-DD --outlet "Outlet" \\
  --title "Headline of the piece" --url https://... \\
  --kind news --what "Kenya 364-day T-bill rate" \\
  --our-path /markets/kenya-tbills --linked yes`}
        </pre>
        <p className="mt-2 text-[13px] leading-6 text-muted">
          Wrong entry: <code className="font-mono">--withdraw &lt;id&gt; --reason &quot;…&quot;</code>. Rows are never edited or deleted. No people’s names or
          contact details.
        </p>
      </Card>
    </PageShell>
  );
}
