import { apiJson } from "@/lib/api";
import { SOURCES } from "@/lib/source-registry";

export const dynamic = "force-dynamic";

/** The source registry: every upstream publisher, what we take, and on what terms (lib/source-registry.ts). Open, no key. */
export async function GET(request: Request) {
  return apiJson(request, "/v1/sources", { sources: SOURCES, checked: "2026-10-28" });
}
