import { startCheckout } from "@/lib/billing/paystack";
import { getCheckoutPlan } from "@/lib/billing/plans";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { plan?: string; email?: string } | null;
  const plan = payload?.plan ? getCheckoutPlan(payload.plan) : null;
  const email = payload?.email?.trim().toLowerCase() ?? "";

  if (!plan || !emailPattern.test(email) || email.length > 200) {
    return Response.json({ ok: false, reason: "Choose a listed plan and a valid email." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const result = await startCheckout({
    plan: plan.id,
    email,
    callbackUrl: `${origin}/${plan.id.startsWith("pack") ? "pack" : "pricing"}?checkout=returned`,
  });

  if (!result.ok) {
    return Response.json(result, { status: result.reason === "Paystack is not connected." ? 503 : 502 });
  }

  return Response.json({ ok: true, authorizationUrl: result.authorizationUrl });
}
