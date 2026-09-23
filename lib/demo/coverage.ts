import { countries } from "@/lib/demo/countries";
import { graphDesks, edgesForDesk } from "@/lib/demo/graph";
import { officialSources } from "@/lib/demo/sources";
import { corpusDocs, indexedCorpusCount } from "@/lib/demo/corpus";

export type CoverageRow = {
  id: string;
  label: string;
  covered: number;
  total: number;
  note: string;
  href: string;
};

/** Honest coverage board. Denominators are scaffolds; numerators stay low until sourced. */
export function coverageRows(): CoverageRow[] {
  const deskCount = graphDesks.length;
  const desksWithEdges = graphDesks.filter((desk) => edgesForDesk(desk.slug).length > 0).length;
  const linkedSources = officialSources.filter((item) => item.status === "linked").length;
  const indexed = indexedCorpusCount();

  return [
    {
      id: "country-terminals",
      label: "Country terminals",
      covered: countries.length,
      total: countries.length,
      note: "Shells exist. Observation cells stay blank until cited.",
      href: "/countries",
    },
    {
      id: "graph-desks",
      label: "Graph desks with edges",
      covered: desksWithEdges,
      total: deskCount,
      note: "Editorial edges only. No invented prints.",
      href: "/graph",
    },
    {
      id: "official-sources",
      label: "Linked official sources",
      covered: linkedSources,
      total: officialSources.length,
      note: "Pending rows are not production citations.",
      href: "/sources",
    },
    {
      id: "ask-corpus",
      label: "Indexed corpus slots",
      covered: indexed,
      total: corpusDocs.length,
      note: "RAG offline. Indexed stays at zero.",
      href: "/ask/corpus",
    },
  ];
}
