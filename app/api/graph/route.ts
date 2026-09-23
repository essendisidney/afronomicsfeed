import { NextResponse } from "next/server";
import { graphDesks, graphEdges, graphNodes } from "@/lib/demo/graph";

/** Catalogue shape only. No invented edge payloads beyond editorial scaffolds. */
export function GET() {
  return NextResponse.json({
    product: "Afronomics Feed",
    keys: "not issued",
    desks: graphDesks.length,
    nodes: graphNodes.length,
    edges: graphEdges.length,
    note: "Counts only. Resolve and upsert jobs are not scheduled.",
    resolve: "/graph/resolve",
  });
}
