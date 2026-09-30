import { revalidatePath } from "next/cache";
import { runArchive } from "@/lib/agents/archive";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/** Daily: archive FX and headlines, then refresh the data pages. */
export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const report = await runArchive();
  for (const path of ["/", "/news", "/markets", "/capital", "/signals", "/data", "/countries"]) revalidatePath(path);
  revalidatePath("/countries/[slug]", "page");
  revalidatePath("/data/[indicator]", "page");
  return Response.json({ ok: report.errors.length === 0, ...report });
}
