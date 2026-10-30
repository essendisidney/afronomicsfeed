import { provenance } from "@/lib/provenance";
import { site } from "@/lib/site";

export const dynamic = "force-static";

/** Provenance of every auction dataset, computed at build time (lib/provenance.ts). Open, no key. */
export function GET() {
  const files = provenance();
  return Response.json(
    {
      generated_at: new Date().toISOString(),
      deployment: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      method: `${site.url}/method`,
      quality_gate: "scripts/quality_check.py: every row needs a source link, a date and a rate in range; accepted is checked against bids.",
      files,
      totals: { files: files.length, rows: files.reduce((n, f) => n + f.rows, 0), rows_with_source: files.reduce((n, f) => n + f.rows_with_source, 0) },
    },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}
