import type { NextRequest } from "next/server";
import { renderCard } from "@/lib/og-card";
import { parseShare } from "@/lib/share";
import { shareView } from "@/lib/share-card";

/**
 * The 1200×630 card a shared result shows in WhatsApp, LinkedIn and X: /share/card?kind=fair&mode=save&mine=3.5&place=bank.
 * Kept outside /api/ because robots.txt closes /api/ and X and LinkedIn honour it when fetching preview images.
 * Published figures move with each auction and month, so the card is cached for an hour, not forever.
 */
export async function GET(request: NextRequest) {
  const spec = parseShare(request.nextUrl.searchParams);
  const view = spec ? shareView(spec) : null;
  if (!view) return new Response("Not a valid share card.", { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return renderCard(view.card, { "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" });
}
