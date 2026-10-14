import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/data/PageShell";
import { EvidenceTag, asOfLabel } from "@/components/evidence/EvidenceTag";
import { loadCases } from "@/lib/cases";
import { figureEvidence, formatFigure, getInstitution, growth, institutions, kindLabels, matchKey, metricLabels, regulatorOf, type Figure, type Institution } from "@/lib/registry";
import { fitDescription, fitTitle } from "@/lib/seo";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return institutions().map((i) => ({ slug: i.slug }));
}

const SIZE = ["assets", "deposits", "gross_loans", "net_loans", "gross_npl", "total_income", "profit_before_tax", "shareholders_funds"];
const RATIOS = [
  "npl_ratio",
  "core_capital_to_assets",
  "core_capital_to_deposits",
  "institutional_capital_to_assets",
  "retained_earnings_to_core_capital",
  "external_borrowing_to_assets",
  "core_capital_to_rwa",
  "total_capital_to_rwa",
  "roa",
  "roe",
];
const statusText: Record<string, string> = {
  licensed: "Licensed",
  authorised: "Authorised",
  restricted: "Restricted to credit only",
  revoked: "Licence revoked",
  expired: "Authorisation expired",
};

function summary(i: Institution) {
  const where = i.county ? ` in ${i.county} County` : "";
  const label = kindLabels[i.kind];
  return `${i.name}: ${label.charAt(0).toLowerCase()}${label.slice(1)}${where}. Licence status and the figures ${regulatorOf(i.kind)} publishes for it, each linked to the source.`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const i = getInstitution((await params).slug);
  if (!i) return {};
  return {
    title: fitTitle(`${i.name}: licence and published figures`),
    description: fitDescription(summary(i)),
    alternates: { canonical: `${site.url}/registry/${i.slug}` },
  };
}

function FigureTable({ inst, metrics, title }: { inst: Institution; metrics: string[]; title: string }) {
  const present = metrics.filter((m) => inst.figures.some((f) => f.metric === m));
  if (!present.length) return null;
  const years = [...new Set(inst.figures.filter((f) => present.includes(f.metric)).map((f) => f.year))].sort();
  const cell = (f: Figure | undefined) =>
    f ? (
      <span className="inline-flex flex-col items-end gap-1">
        <span>{formatFigure(f)}</span>
        {f.value != null ? <EvidenceTag {...figureEvidence(f)} /> : <span className="max-w-[16rem] text-right text-[12px] leading-4 text-muted">{f.note}</span>}
      </span>
    ) : (
      <span className="text-muted">—</span>
    );
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl text-ink">{title}</h2>
      <div className="table-box mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label={`${title} (scrolls sideways)`}>
        <table className="data-table min-w-[560px]">
          <thead>
            <tr>
              <th scope="col">Measure</th>
              {years.map((y) => (
                <th key={y} scope="col" className="text-right">
                  {y}
                </th>
              ))}
              {years.length > 1 ? (
                <th scope="col" className="text-right">
                  Change
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {present.map((m) => {
              const g = growth(inst, m);
              const unit = inst.figures.find((f) => f.metric === m)?.unit;
              const ratio = unit === "%";
              const first = inst.figures.find((f) => f.metric === m && f.year === years[0]);
              const last = inst.figures.find((f) => f.metric === m && f.year === years.at(-1));
              const pts = ratio && first?.value != null && last?.value != null ? last.value - first.value : null;
              return (
                <tr key={m}>
                  <th scope="row" className="row-label">
                    {metricLabels[m] ?? m}
                  </th>
                  {years.map((y) => (
                    <td key={y} className="text-right" data-num>
                      {cell(inst.figures.find((f) => f.metric === m && f.year === y))}
                    </td>
                  ))}
                  {years.length > 1 ? (
                    <td className="text-right text-ink-soft" data-num>
                      {ratio
                        ? pts != null
                          ? `${pts >= 0 ? "+" : "−"}${Math.abs(pts).toFixed(2)} pts`
                          : "—"
                        : g
                          ? `${g.pct >= 0 ? "+" : "−"}${Math.abs(g.pct).toFixed(1)}%`
                          : "—"}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function InstitutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const i = getInstitution((await params).slug);
  if (!i) notFound();
  const cases = loadCases().filter((c) => c.status === "published" && c.signed_off && c.institutions.some((n) => matchKey(n) === i.key));
  const notes = [...new Set(i.figures.map((f) => f.note).filter(Boolean))] as string[];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Today" }, { href: "/registry", label: "Registry" }, { label: i.name }]}
      kicker={kindLabels[i.kind]}
      title={i.name}
      lede={summary(i)}
    >
      <dl className="grid gap-x-8 gap-y-3 text-[15px] sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">Status</dt>
          <dd className="mt-1 text-ink">{i.status ? (statusText[i.status] ?? i.status) : `Not on ${regulatorOf(i.kind)}'s latest list`}</dd>
        </div>
        {i.county ? (
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">County</dt>
            <dd className="mt-1 text-ink">{i.county}</dd>
          </div>
        ) : null}
        {i.tier ? (
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">SASRA size tier</dt>
            <dd className="mt-1 capitalize text-ink">{i.tier}</dd>
          </div>
        ) : null}
        {i.directory?.peerGroup ? (
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">CBK peer group</dt>
            <dd className="mt-1 capitalize text-ink">{i.directory.peerGroup}</dd>
          </div>
        ) : null}
        {i.directory?.licensedOn ? (
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">Licensed</dt>
            <dd className="mt-1 text-ink">{i.directory.licensedOn.length === 4 ? i.directory.licensedOn : asOfLabel(i.directory.licensedOn)}</dd>
          </div>
        ) : null}
        {i.directory?.branches != null ? (
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">Branches</dt>
            <dd className="tabular mt-1 text-ink">{i.directory.branches}</dd>
          </div>
        ) : null}
      </dl>
      {i.directory ? (
        <EvidenceTag source={`CBK ${i.kind === "mfb" ? "microfinance" : "bank"} directory`} href={i.directory.source} asOf={`${i.directory.edition}-01`} className="mt-3" />
      ) : null}

      {i.licences.length ? (
        <section className="mt-10">
          <h2 className="font-serif text-2xl text-ink">Licence record</h2>
          <ul className="mt-3 space-y-2 text-[15px]">
            {i.licences.map((l) => (
              <li key={`${l.year}-${l.schedule}`} className="flex flex-wrap items-center gap-3">
                <span className="tabular font-semibold text-ink">{l.year}</span>
                <span className="text-ink-soft">
                  {statusText[l.status] ?? l.status} (SASRA list, schedule {l.schedule})
                </span>
                <EvidenceTag source="SASRA licensed list" href={l.source} asOf={l.asOf} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {i.figures.length ? (
        <>
          <FigureTable inst={i} metrics={SIZE} title="Size and results" />
          <FigureTable inst={i} metrics={RATIOS} title="Ratios as published" />
          <p className="mt-3 max-w-3xl text-[13px] leading-5 text-muted">
            Figures as {regulatorOf(i.kind)} published them, for the year to 31 December. The change column is worked out by code from the two
            published figures (per cent for amounts, percentage points for ratios). {i.kind.startsWith("sacco") ? "SASRA's prescribed minimums for each ratio are in its annual report." : ""}
          </p>
          {notes.length ? (
            <ul className="mt-3 list-disc pl-5 text-[13px] leading-5 text-muted">
              {notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          ) : null}
        </>
      ) : (
        <p className="mt-10 max-w-2xl rounded-2xl border border-rule bg-surface px-5 py-4 text-[15px] text-ink-soft">
          {regulatorOf(i.kind)}&rsquo;s latest annual report gives no figures for {i.name}.
        </p>
      )}

      {cases.length ? (
        <section className="mt-10">
          <h2 className="font-serif text-2xl text-ink">In the casebook</h2>
          <ul className="mt-3 space-y-2">
            {cases.map((c) => (
              <li key={c.id}>
                <Link href={`/casebook/${c.id}`} className="font-semibold text-forest underline underline-offset-2">
                  {c.id}: {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-10 text-[13px] text-muted">
        <Link href="/registry" className="underline underline-offset-2">
          All licensed institutions
        </Link>{" "}
        ·{" "}
        <Link href="/compare" className="underline underline-offset-2">
          Compare with peers
        </Link>{" "}
        · Information, not advice.
      </p>
    </PageShell>
  );
}
