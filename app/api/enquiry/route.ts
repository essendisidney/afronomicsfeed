import { rpc } from "@/lib/store";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const interests = new Set(["sponsorship", "licensing", "pack", "research", "access", "widgets", "other"]);

/** Commercial enquiries (sponsorship, data licensing, research, access). Stored in `leads` (migration 0008). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, string | undefined> | null;
  if (body?.website) return Response.json({ ok: true }); // honeypot
  const email = body?.email?.trim().toLowerCase() ?? "";
  const interest = body?.interest && interests.has(body.interest) ? body.interest : "other";
  if (!emailPattern.test(email) || email.length > 200) {
    return Response.json({ ok: false, reason: "Please enter a valid email address." }, { status: 400 });
  }
  const args = {
    p_email: email,
    p_name: (body?.name ?? "").trim().slice(0, 120),
    p_org: (body?.organisation ?? "").trim().slice(0, 160),
    p_interest: interest,
    p_message: (body?.message ?? "").trim().slice(0, 4000),
    p_source: (body?.source ?? "").slice(0, 200),
  };
  const result = await rpc("af_lead", args);
  if (!result.ok) {
    console.log(`[enquiry] ${JSON.stringify({ ...args, at: new Date().toISOString(), reason: result.reason })}`);
  }
  return Response.json({ ok: true });
}
