import type { NextRequest } from "next/server";
import { receiptCard } from "@/lib/brand/receipt-card";
import { getReceipt, visibleReceipts } from "@/lib/receipts";

/**
 * Preview of the Laterite Receipt share card (lib/brand/receipt-card.tsx):
 * /preview/receipt-card?slug=2026-10-15-tbill-returns-collapse. The per-page Open Graph cards are wired on their own
 * branch and draw from the same module. Not served in production unless SIGNATURE_LOOK_PREVIEW=1.
 */
export function GET(request: NextRequest) {
  if (process.env.VERCEL_ENV === "production" && process.env.SIGNATURE_LOOK_PREVIEW !== "1") return new Response("Not found", { status: 404 });
  const r = getReceipt(request.nextUrl.searchParams.get("slug") ?? "") ?? visibleReceipts()[0];
  if (!r) return new Response("No Receipt to draw.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return receiptCard(r);
}
