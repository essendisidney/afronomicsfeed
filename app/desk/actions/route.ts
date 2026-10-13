import { POST as deskAction } from "@/app/api/desk/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Desk actions, under /desk so the desk cookie (scoped to path /desk) is sent with them. The handler is the one at
 * /api/desk, which stays for compatibility; that path never received a /desk-scoped cookie, so actions sent there
 * were refused with "No desk key."
 */
export const POST = deskAction;
