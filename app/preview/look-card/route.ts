import type { NextRequest } from "next/server";
import { isLook } from "@/lib/look";
import { lookReceiptCard } from "@/lib/og-look";
import { getReceipt, visibleReceipts } from "@/lib/receipts";

/**
 * Signature-look preview only (lib/look.ts): /preview/look-card?look=a&slug=2026-10-15-tbill-returns-collapse draws
 * that Receipt's share card in one of the three looks. Not served in production unless SIGNATURE_LOOK_PREVIEW=1.
 */
export function GET(request: NextRequest) {
  if (process.env.VERCEL_ENV === "production" && process.env.SIGNATURE_LOOK_PREVIEW !== "1") return new Response("Not found", { status: 404 });
  const q = request.nextUrl.searchParams;
  const look = q.get("look");
  const r = getReceipt(q.get("slug") ?? "") ?? visibleReceipts()[0];
  if (!isLook(look) || !r) return new Response("Pass look=a|b|c and a Receipt slug.", { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return lookReceiptCard(look, r);
}
