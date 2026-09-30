import { upsertRows } from "@/lib/store";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const roles = new Set(["investor", "bank", "dfi", "corporate", "research", "founder", "other"]);


/** Newsletter sign-up. Writes to the `subscribers` table (migration 0003). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; role?: string; source?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const role = body?.role && roles.has(body.role) ? body.role : "other";
  const source = (body?.source ?? "").slice(0, 120);

  if (!emailPattern.test(email) || email.length > 200) {
    return Response.json({ ok: false, reason: "Please enter a valid email address." }, { status: 400 });
  }

  const result = await upsertRows("subscribers", [{ email, role, source }], "email");
  if (!result.ok) {
    // Still visible in the deployment's function logs so no sign-up is lost.
    console.log(`[subscribe] ${JSON.stringify({ email, role, source, at: new Date().toISOString(), reason: result.reason })}`);
    return Response.json({ ok: true, stored: false });
  }
  return Response.json({ ok: true, stored: true });
}
