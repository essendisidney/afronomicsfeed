import { rpc } from "@/lib/store";

export const runtime = "nodejs";

/** One-question page feedback. Anonymous: path, yes/no, free text, optional role, country from the host. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { path?: string; found?: boolean; text?: string; role?: string } | null;
  if (!body?.path) return Response.json({ ok: false }, { status: 400 });
  await rpc("af_feedback", {
    p_path: body.path.split("?")[0].slice(0, 200),
    p_found: typeof body.found === "boolean" ? body.found : null,
    p_text: (body.text ?? "").slice(0, 600),
    p_role: body.role ?? null,
    p_country: request.headers.get("x-vercel-ip-country") ?? "",
  });
  return Response.json({ ok: true });
}
