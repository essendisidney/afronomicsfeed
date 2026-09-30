export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const roles = new Set(["investor", "bank", "dfi", "corporate", "research", "founder", "other"]);

function store() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

/** Newsletter sign-up. Writes to the `subscribers` table (migration 0003). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; role?: string; source?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const role = body?.role && roles.has(body.role) ? body.role : "other";
  const source = (body?.source ?? "").slice(0, 120);

  if (!emailPattern.test(email) || email.length > 200) {
    return Response.json({ ok: false, reason: "Please enter a valid email address." }, { status: 400 });
  }

  const cfg = store();
  if (!cfg) {
    // Still visible in the deployment's function logs so no sign-up is lost.
    console.log(`[subscribe] ${JSON.stringify({ email, role, source, at: new Date().toISOString() })}`);
    return Response.json({ ok: true, stored: false });
  }

  const response = await fetch(`${cfg.url}/rest/v1/subscribers?on_conflict=email`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ email, role, source }),
  }).catch(() => null);

  if (!response || !response.ok) {
    console.log(`[subscribe:fallback] ${JSON.stringify({ email, role, source, status: response?.status ?? "network" })}`);
    return Response.json({ ok: true, stored: false });
  }
  return Response.json({ ok: true, stored: true });
}
