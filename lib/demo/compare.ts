import { featuredCountrySlugs, getCountry } from "@/lib/demo/countries";
import { edgesForDesk, getGraphDesk } from "@/lib/demo/graph";

export type CompareRow = {
  slug: string;
  name: string;
  iso: string;
  currency: string;
  desk: string;
  edges: number;
  nodes: number;
  policyRate: string;
  fx: string;
  exchange: string;
};

/** Featured-desk matrix. Observation cells stay blank until a cited print exists. */
export function featuredCompareRows(): CompareRow[] {
  return featuredCountrySlugs.map((slug) => {
    const country = getCountry(slug);
    const desk = getGraphDesk(slug);
    const edges = edgesForDesk(slug);
    return {
      slug,
      name: country?.name ?? slug,
      iso: country?.iso ?? "—",
      currency: country?.currency ?? "—",
      desk: desk ? `/graph/${desk.slug}` : `/countries/${slug}`,
      edges: edges.length,
      nodes: desk?.nodeIds.length ?? 0,
      policyRate: "—",
      fx: "—",
      exchange: "—",
    };
  });
}

export const compareAxes = [
  { key: "policyRate", label: "Policy rate" },
  { key: "fx", label: "FX (vs USD)" },
  { key: "exchange", label: "Equity index" },
] as const;
