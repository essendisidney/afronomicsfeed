import { isAutomated } from "@/lib/bots";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";

/**
 * One-question surveys (components/ui/MicroSurvey.tsx). Anonymous: the page, the question, the chosen answer, an
 * optional short note when the answer is "other", and the country from the host. No email, IP or identifier.
 * Stored by af_survey in survey_answers (migration 0034). Until that migration is applied the answer is dropped;
 * nothing is logged, because a note is free text a person typed.
 */
export async function POST(request: Request) {
  if (isAutomated(request.headers.get("user-agent"))) return new Response(null, { status: 204 });
  const body = (await request.json().catch(() => null)) as { path?: string; question?: string; answer?: string; note?: string } | null;
  if (!body?.path || !body.question || !body.answer) return Response.json({ ok: false }, { status: 400 });
  await rpc("af_survey", {
    p_path: body.path.split("?")[0].slice(0, 200),
    p_question: body.question.slice(0, 20),
    p_answer: body.answer.slice(0, 40),
    p_note: (body.note ?? "").slice(0, 300),
    p_country: request.headers.get("x-vercel-ip-country") ?? "",
  });
  return Response.json({ ok: true });
}
