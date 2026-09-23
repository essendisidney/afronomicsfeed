import { NextResponse } from "next/server";
import { surfacesByState, systemSurfaces } from "@/lib/demo/status-board";

/** Honest status JSON. Offline stays offline. */
export function GET() {
  return NextResponse.json({
    product: "Afronomics Feed",
    surfaces: systemSurfaces.length,
    live: surfacesByState("live").length,
    scaffold: surfacesByState("scaffold").length,
    offline: surfacesByState("offline").length,
    board: "/status",
    note: "No synthetic uptime. Keys are not issued.",
  });
}
