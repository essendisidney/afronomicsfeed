import { graphNodes, type GraphNode } from "@/lib/demo/graph";
import { slugCandidate } from "./index";

export type ResolveHit = {
  query: string;
  slug: string;
  node: GraphNode | null;
  confidence: "exact" | "slug" | "none";
  note: string;
};

/** Demo resolver only. Does not invent entities or write to the store. */
export function resolveEntityName(name: string): ResolveHit {
  const query = name.trim();
  const slug = slugCandidate(query);
  if (!query) {
    return {
      query,
      slug,
      node: null,
      confidence: "none",
      note: "Empty query. Nothing to resolve.",
    };
  }

  const exact = graphNodes.find((node) => node.label.toLowerCase() === query.toLowerCase());
  if (exact) {
    return {
      query,
      slug,
      node: exact,
      confidence: "exact",
      note: "Matched a known graph node. No upsert ran.",
    };
  }

  const bySlug = graphNodes.find((node) => node.id === slug);
  if (bySlug) {
    return {
      query,
      slug,
      node: bySlug,
      confidence: "slug",
      note: "Matched by slug candidate. No upsert ran.",
    };
  }

  return {
    query,
    slug,
    node: null,
    confidence: "none",
    note: "No known node. Entity resolution will not invent a row.",
  };
}

export function knownEntityCatalog() {
  return graphNodes.map((node) => ({
    id: node.id,
    label: node.label,
    kind: node.kind,
    href: node.href ?? null,
  }));
}
