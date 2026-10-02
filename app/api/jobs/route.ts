import { rpc } from "@/lib/store";

export const runtime = "nodejs";

/** A listing submission. Stored unpublished; it goes live when the KES 10,000 listing fee is paid from the same email. */
export async function POST(request: Request) {
  const b = (await request.json().catch(() => null)) as Record<string, string> | null;
  if (!b) return Response.json({ ok: false, reason: "Bad request" }, { status: 400 });
  if (b.website) return Response.json({ ok: true, id: 0 }); // honeypot
  const str = (k: string, max: number) => (b[k] ?? "").toString().trim().slice(0, max) || null;
  const result = await rpc("af_job_submit", {
    p_title: str("title", 120),
    p_institution: str("institution", 120),
    p_location: str("location", 80),
    p_role_type: str("role_type", 40),
    p_closes: /^\d{4}-\d{2}-\d{2}$/.test(b.closes ?? "") ? b.closes : null,
    p_apply_url: str("apply_url", 500),
    p_description: str("description", 4000),
    p_email: str("email", 200)?.toLowerCase() ?? null,
  });
  if (!result.ok) {
    const reason = /title|institution|email|length|limit/.exec(result.reason)?.[0];
    return Response.json({ ok: false, reason: reason ? `Check the ${reason === "limit" ? "number of submissions today" : reason}.` : "Could not save the listing." }, { status: 400 });
  }
  return Response.json({ ok: true, id: result.value });
}
