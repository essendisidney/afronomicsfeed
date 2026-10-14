import { apiAccess, apiCsv, csvError, UPGRADE_URL } from "@/lib/api";
import { institutions, kindLabels } from "@/lib/registry";

export const dynamic = "force-dynamic";

type Row = { slug: string; name: string; kind: string; county: string; status: string; metric: string; year: number; value: number | null; unit: string; asOf: string; source: string; page: number | null; note: string };

const q = (v: unknown) => {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * The institutions registry as CSV: one row per institution per published figure, with its source and page.
 * Without a key, every figure for the latest year (docs/rebuild/phase-3-plan.md: "the latest year is free"); the
 * regulators publish a whole year's figures under one date, so the per-call row cap of the dated series does not
 * apply here. With a key, every year.
 */
export async function GET(request: Request) {
  const rows: Row[] = institutions().flatMap((i) =>
    i.figures.map((f) => ({
      slug: i.slug,
      name: i.name,
      kind: kindLabels[i.kind],
      county: i.county ?? "",
      status: i.status ?? "",
      metric: f.metric,
      year: f.year,
      value: f.value,
      unit: f.unit,
      asOf: f.asOf,
      source: f.source,
      page: f.page,
      note: f.note ?? "",
    })),
  );
  if (!rows.length) return csvError("Dataset not yet published", 404);
  rows.sort((a, b) => b.asOf.localeCompare(a.asOf) || a.name.localeCompare(b.name) || a.metric.localeCompare(b.metric));
  const access = await apiAccess(request, "/registry", { csv: true });
  const latestYear = Math.max(...rows.map((r) => r.year));
  const picked = access.plan ? rows : rows.filter((r) => r.year === latestYear);
  const freeLine = access.plan
    ? []
    : [`# Free: every figure for ${latestYear}, the latest year the regulators have published. Earlier years need a pilot or paid key (${UPGRADE_URL}).`];
  const header = ["institution", "registry_slug", "kind", "county", "licence_status", "metric", "year", "value", "unit", "as_of", "source", "page", "note"];
  const body = [
    ...freeLine,
    "# Kenya's licensed SACCOs, microfinance banks and banks: figures as SASRA and CBK publish them, one row per figure",
    "# Sources: SASRA Sacco Supervision Annual Report and licensed list; CBK Bank Supervision Annual Report and directories. Compiled by Afronomics (afronomicsfeed.com/registry).",
    header.join(","),
    ...picked.map((r) => [r.name, r.slug, r.kind, r.county, r.status, r.metric, r.year, r.value, r.unit, r.asOf, r.source, r.page, r.note].map(q).join(",")),
  ].join("\n");
  return apiCsv(body, "afronomics-kenya-registry.csv", access, null);
}
