import { cookies } from "next/headers";
import { sameOrigin } from "@/lib/security";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Desk sign-in (security review, 13 Oct 2026). The desk key is checked against the database once, then stored in an
 * HttpOnly, Secure, SameSite=Strict cookie scoped to /desk, so page scripts can never read it and it is never sent
 * cross-site. Before this, the browser set the cookie itself (readable by any script on the page) for a year.
 * A cookie set the old way keeps working: the desk page reads the same cookie name, so nobody is locked out, and the
 * next sign-in replaces it with the HttpOnly one.
 */
const COOKIE = "af_desk";
const MAX_AGE = 60 * 60 * 24 * 90;

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ ok: false, reason: "Cross-site request refused." }, { status: 403 });
  const body = (await request.json().catch(() => null)) as { key?: unknown } | null;
  const key = typeof body?.key === "string" ? body.key.trim() : "";
  if (key.length < 16 || key.length > 200) return Response.json({ ok: false, reason: "That key isn’t right." }, { status: 401 });
  const check = await rpc("af_desk", { p_secret: key });
  if (!check.ok) return Response.json({ ok: false, reason: "The database did not answer. Try again." }, { status: 502 });
  if (check.value == null) return Response.json({ ok: false, reason: "That key isn’t right." }, { status: 401 });
  (await cookies()).set(COOKIE, key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/desk",
    maxAge: MAX_AGE,
  });
  return Response.json({ ok: true });
}

/** Sign out on this device. */
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ ok: false }, { status: 403 });
  (await cookies()).set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/desk", maxAge: 0 });
  return Response.json({ ok: true });
}
