import { renderTime } from "@/lib/data/fetcher";
import Link from "next/link";
import { formatValue, getIndicatorDef } from "@/lib/data/indicators";
import { loadAfricaProjects, projectsSource, type Project, type ProjectTheme } from "@/lib/data/projects";
import { continentalMedian, coveredTotal, loadIndicators, ranked } from "@/lib/data/series";
import { loadWire, wireFor, type WireDesk } from "@/lib/data/wire";
import { NewsletterBand } from "./NewsletterBand";
import { PageShell } from "./PageShell";
import { ProjectTable } from "./ProjectTable";
import { WireList } from "./WireList";
import { IndicatorSource, RankBars, SectionTitle, SourceLine } from "./parts";

export type DeskConfig = {
  slug: string;
  kicker: string;
  title: string;
  lede: string;
  wireDesk: WireDesk;
  /** Indicator panels, in order. `order: "asc"` ranks lowest first. */
  panels: Array<{ slug: string; title: string; order?: "asc" | "desc" }>;
  projectFilter?: (project: Project) => boolean;
  projectThemes?: ProjectTheme[];
  projectTitle?: string;
};

export async function DeskView({ config }: { config: DeskConfig }) {
  const now = renderTime();
  const needsProjects = Boolean(config.projectFilter || config.projectThemes);
  const [files, wire, projects] = await Promise.all([
    loadIndicators([...new Set(config.panels.map((panel) => panel.slug))]),
    loadWire(),
    needsProjects ? loadAfricaProjects() : Promise.resolve([] as Project[]),
  ]);
  const headlines = wireFor(wire, { desk: config.wireDesk }, 16);
  const deskProjects = projects
    .filter((project) => (config.projectThemes ? config.projectThemes.includes(project.theme) : true))
    .filter((project) => (config.projectFilter ? config.projectFilter(project) : true))
    .slice(0, 15);

  const keyStats = config.panels.slice(0, 4).flatMap((panel) => {
    const file = files.find((item) => item.def.slug === panel.slug);
    if (!file) return [];
    const total = file.def.summable ? coveredTotal(file) : null;
    const median = continentalMedian(file);
    const value = total ? formatValue(file.def, total.sum) : median != null ? formatValue(file.def, median) : null;
    if (!value) return [];
    return [{ slug: panel.slug, label: total ? `${file.def.short} · Africa ${total.year}` : `${file.def.short} · median`, value }];
  });

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: config.kicker }]}
      kicker={config.kicker}
      title={config.title}
      lede={<p>{config.lede}</p>}
    >
      {keyStats.length ? (
        <div className="grid grid-cols-2 gap-px bg-rule lg:grid-cols-4">
          {keyStats.map((stat) => (
            <Link key={stat.slug} href={`/data/${stat.slug}`} className="bg-paper-2 px-4 py-4 hover:bg-paper-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{stat.label}</p>
              <p className="mt-1 font-serif text-3xl tracking-[-0.02em] text-ink">{stat.value}</p>
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <SectionTitle kicker="The Wire" title={`${config.kicker} headlines`} href="/news" hrefLabel="All headlines →" />
          <WireList items={headlines} now={now} showSummary />
        </section>
        <aside className="space-y-10 lg:col-span-5">
          {config.panels.map((panel) => {
            const file = files.find((item) => item.def.slug === panel.slug);
            const def = getIndicatorDef(panel.slug);
            if (!file || !def) return null;
            const rows = ranked(file, 2);
            const ordered = panel.order === "asc" ? [...rows].reverse() : rows;
            return (
              <div key={`${panel.slug}-${panel.order ?? "desc"}`}>
                <SectionTitle kicker="League table" title={panel.title} href={`/data/${panel.slug}`} />
                <div className="mt-4">
                  {ordered.length ? <RankBars def={def} readings={ordered} limit={8} /> : <p className="text-sm text-muted">Series did not load this hour.</p>}
                </div>
                <IndicatorSource def={def} />
              </div>
            );
          })}
        </aside>
      </div>

      {needsProjects ? (
        <section className="mt-16">
          <SectionTitle kicker="Capital" title={config.projectTitle ?? "World Bank projects"} href="/capital" hrefLabel="Full pipeline →" />
          <div className="mt-4">
            <ProjectTable projects={deskProjects} />
          </div>
          <SourceLine name={projectsSource.name} href={projectsSource.url} />
        </section>
      ) : null}

      <NewsletterBand />
    </PageShell>
  );
}
