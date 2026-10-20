import { joinMorning } from "@/lib/morning-signup";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const roles = new Set(["investor", "bank", "dfi", "corporate", "research", "founder", "other"]);


// Best-effort, per-instance limit on sign-ups from one address (in memory only); the database caps welcome emails.
const WINDOW_MS = 10 * 60 * 1000;
const recent = new Map<string, number[]>();
function throttled(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) for (const [k, v] of recent) if (now - (v.at(-1) ?? 0) > WINDOW_MS) recent.delete(k);
  return hits.length > 5;
}

/** Newsletter sign-up. Writes to the `subscribers` table and sends a new subscriber one welcome email with the guide. */
export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (throttled(ip)) return Response.json({ ok: false, reason: "Too many sign-ups from here. Please try again in a few minutes." }, { status: 429 });
  const body = (await request.json().catch(() => null)) as { email?: string; role?: string; source?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const role = body?.role && roles.has(body.role) ? body.role : "other";
  const source = (body?.source ?? "").slice(0, 120);

  if (!emailPattern.test(email) || email.length > 200) {
    return Response.json({ ok: false, reason: "Please enter a valid email address." }, { status: 400 });
  }

  const joined = await joinMorning(email, role, source);
  if (!joined.ok) {
    // Say so rather than promise a guide that will not come: the reader can try again or write to the desk.
    return Response.json({ ok: false, reason: `We could not save your sign-up just now. Please try again in a minute, or write to ${site.contactEmail}.` }, { status: 503 });
  }
  return Response.json({ ok: true, stored: true });
}
