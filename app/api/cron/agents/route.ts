import { revalidatePath } from "next/cache";
import { runAgents } from "@/lib/agents/run";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/** Daily desk run. Stores a print only when the publisher response parses. */
export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const report = await runAgents({ includeDoors: true });
  revalidatePath("/agents");
  revalidatePath("/observations");
  revalidatePath("/ingestion");
  revalidatePath("/indicators", "layout");

  const doors = report.doors ?? [];
  return Response.json({
    ok: true,
    ranAt: report.ranAt,
    prints: report.prints.length,
    written: report.store.written,
    storeSkipped: report.store.skipped,
    storeReason: report.store.reason,
    doorsChecked: doors.length,
    doorsReachable: doors.filter((door) => door.reachable).length,
    emptySlots: report.desk.emptySlots,
  });
}
