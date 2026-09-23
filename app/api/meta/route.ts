import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    product: "Afronomics Feed",
    keys: "not issued",
    routes: [
      { method: "GET", path: "/api/countries", note: "Country metadata only." },
      { method: "GET", path: "/api/signals", note: "Signal methodology." },
      { method: "GET", path: "/api/capital-flows", note: "Empty book. Demo rows are not served." },
      { method: "GET", path: "/api/graph", note: "Desk, node and edge counts. No invented upserts." },
      { method: "GET", path: "/api/status", note: "Honest live / scaffold / offline counts." },
      { method: "GET", path: "/api/meta", note: "This catalogue." },
    ],
  });
}
