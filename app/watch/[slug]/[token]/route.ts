import { renderTime } from "@/lib/data/fetcher";
import { watchHtml } from "@/lib/editions/watch-html";
import { buildWatch } from "@/lib/watch";
import { checkWatchToken } from "@/lib/watch-link";

export const dynamic = "force-dynamic";

const PRIVATE = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" };

/** One SACCO's Watch pack, for a link signed for that SACCO (lib/watch-link.ts). Anything else is a plain 404. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; token: string }> }) {
  const { slug, token } = await params;
  const notFound = () => new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", ...PRIVATE } });
  if (!checkWatchToken(slug, token)) return notFound();
  const w = await buildWatch(slug, renderTime());
  if (!w) return notFound();
  return new Response(watchHtml(w), { headers: { "Content-Type": "text/html; charset=utf-8", ...PRIVATE } });
}
