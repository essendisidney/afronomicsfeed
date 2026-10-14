import { cookies } from "next/headers";
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
  const result = await startCheckout({ plan: plan.id, email, callbackUrl: `${origin}/thank-you?checkout=returned` });

  if (!result.ok) {
    return Response.json(result, { status: result.reason === "Paystack is not connected." ? 503 : 502 });
  }

  // Ties the return page to the browser that started the checkout: /thank-you shows a new API key on screen only
  // when this cookie matches the reference, so a reference seen elsewhere (a receipt, a log, a shared screenshot)
  // cannot be used to reveal someone else's key. The key is always emailed regardless.
  if (result.reference) {
    (await cookies()).set("af_checkout", result.reference, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 3,
    });
  }
  return Response.json({ ok: true, authorizationUrl: result.authorizationUrl });
}
