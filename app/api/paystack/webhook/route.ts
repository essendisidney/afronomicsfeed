import { verifyPaystackSignature } from "@/lib/billing/paystack";

export const runtime = "nodejs";

/** Verifies the Paystack signature. A charge does not open a seat. */
export async function POST(request: Request) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return Response.json({ ok: false, reason: "Paystack is not connected." }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  if (!verifyPaystackSignature(rawBody, signature)) {
    return Response.json({ ok: false, reason: "Signature did not match." }, { status: 401 });
  }

  return Response.json({
    ok: true,
    granted: false,
    reason: "Charge signature matched. A seat stays closed until the payer has an account.",
  });
}
