import { renderTime } from "@/lib/data/fetcher";
import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { ProjectTable } from "@/components/data/ProjectTable";
import { WireList } from "@/components/data/WireList";
import { IndicatorSource, RankBars, SectionTitle, SourceLine, usd } from "@/components/data/parts";
import { getIndicatorDef } from "@/lib/data/indicators";
import { groupBy, loadAfricaProjects, projectsSource, sumAmounts } from "@/lib/data/projects";
import { coveredTotal, loadIndicators, ranked } from "@/lib/data/series";
import { loadWire, wireFor } from "@/lib/data/wire";
import { site } from "@/lib/site";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Capital flows into Africa: DFI pipeline, FDI and remittances",
  description:
    "Every World Bank project heading to an African Board, recent approvals by country and theme, FDI and remittance inflows for 54 economies, and the day’s deal headlines.",
  alternates: { canonical: `${site.url}/capital` },
};

export default async function CapitalPage() {
  const now = renderTime();
  const [projects, files, wire] = await Promise.all([loadAfricaProjects(), loadIndicators(["fdi", "remittances"]), loadWire()]);
  const pipeline = projects.filter((project) => project.status === "Pipeline");
  const approved = projects.filter((project) => project.status !== "Pipeline");

  const byCountry = [...groupBy(projects, (project) => project.country.slug).values()]
    .map((list) => ({ country: list[0].country, amount: sumAmounts(list), count: list.length }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 12);
  const maxCountry = Math.max(1, ...byCountry.map((row) => row.amount));

  const byTheme = [...groupBy(projects, (project) => project.theme).entries()]
    .map(([theme, list]) => ({ theme, amount: sumAmounts(list), count: list.length }))
    .sort((a, b) => b.amount - a.amount);
  const maxTheme = Math.max(1, ...byTheme.map((row) => row.amount));

  const fdi = files.find((file) => file.def.slug === "fdi");
  const remit = files.find((file) => file.def.slug === "remittances");
  const fdiTotal = fdi ? coveredTotal(fdi) : null;
  const remitTotal = remit ? coveredTotal(remit) : null;
  const headlines = wireFor(wire, { desk: "capital" }, 14);

  const stats = [
    { label: "WB pipeline", value: usd(sumAmounts(pipeline)), note: `${pipeline.length} projects to the Board` },
    { label: "WB approvals, recent", value: usd(sumAmounts(approved)), note: `${approved.length} active projects` },
    fdiTotal ? { label: `FDI inflows · ${fdiTotal.year}`, value: usd(fdiTotal.sum), note: `${fdiTotal.reporting} countries` } : null,
    remitTotal ? { label: `Remittances · ${remitTotal.year}`, value: usd(remitTotal.sum), note: `${remitTotal.reporting} countries` } : null,
  ].filter((item): item is { label: string; value: string; note: string } => item !== null);

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Capital" }]}
      kicker="Capital"
      title="Where the money into Africa is going"
      lede={
        <p>
          Development-finance commitments by country and theme, the projects heading to a Board vote, and the private flows — FDI and
          remittances — that dwarf them. Amounts are as the publisher prints them.
        </p>
      }
    >
      <div className="grid grid-cols-2 gap-px bg-rule lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-paper-2 px-4 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{stat.label}</p>
            <p className="mt-1 font-serif text-3xl tracking-[-0.02em] text-ink">{stat.value}</p>
            <p className="text-[11px] text-muted">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <section>
          <SectionTitle kicker="By country" title="Largest World Bank books, pipeline + recent" />
          <ol className="mt-4 space-y-1.5">
            {byCountry.map((row, index) => (
              <li key={row.country.slug} className="grid grid-cols-[1.5rem_9rem_1fr_4.5rem] items-center gap-2 text-sm">
                <span className="font-mono text-[10px] text-muted">{index + 1}</span>
                <Link href={`/countries/${row.country.slug}#capital`} className="truncate text-ink-soft hover:text-forest">
                  {row.country.name}
                </Link>
                <span className="h-2 bg-paper-3" title={`${row.count} projects`}>
                  <span className="block h-2 rounded-r bg-forest" style={{ width: `${Math.max(2, (row.amount / maxCountry) * 100)}%` }} />
                </span>
                <span className="text-right font-mono text-xs">{usd(row.amount)}</span>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <SectionTitle kicker="By theme" title="What the money is for" note="Themes are assigned from each project’s title and abstract." />
          <ol className="mt-4 space-y-1.5">
            {byTheme.map((row) => (
              <li key={row.theme} className="grid grid-cols-[10rem_1fr_4.5rem] items-center gap-2 text-sm">
                <span className="text-ink-soft">{row.theme}</span>
                <span className="h-2 bg-paper-3" title={`${row.count} projects`}>
                  <span className="block h-2 rounded-r bg-forest" style={{ width: `${Math.max(2, (row.amount / maxTheme) * 100)}%` }} />
                </span>
                <span className="text-right font-mono text-xs">{usd(row.amount)}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <SourceLine name={projectsSource.name} href={projectsSource.url} detail="IBRD + IDA commitments; co-financing not included" />

      <section className="mt-16">
        <SectionTitle kicker="Pipeline" title="Projects heading to a Board vote" note="Expected Board dates as scheduled by the Bank; dates move." />
        <div className="mt-4">
          <ProjectTable projects={pipeline.slice(0, 40)} />
        </div>
      </section>

      <div className="mt-16 grid gap-10 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <SectionTitle kicker="The Wire" title="Deals, funds and financing" href="/news" hrefLabel="All headlines →" />
          <WireList items={headlines} now={now} showSummary />
        </section>
        <aside className="space-y-10 lg:col-span-5">
          {[fdi, remit].map((file) =>
            file ? (
              <div key={file.def.slug}>
                <SectionTitle kicker="League table" title={`Largest ${file.def.short.toLowerCase()}`} href={`/data/${file.def.slug}`} />
                <div className="mt-4">
                  <RankBars def={getIndicatorDef(file.def.slug)!} readings={ranked(file, 2)} limit={8} />
                </div>
                <IndicatorSource def={file.def} />
              </div>
            ) : null,
          )}
        </aside>
      </div>

      <section className="mt-16">
        <SectionTitle kicker="Approved" title="Recently approved and active" />
        <div className="mt-4">
          <ProjectTable projects={approved.slice(0, 30)} />
        </div>
      </section>

      <NewsletterBand />
    </PageShell>
  );
}
