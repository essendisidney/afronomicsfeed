import { safeEqual } from "@/lib/security";
import { COMMANDS, reply } from "@/lib/telegram-bot";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Telegram webhook for @AfronomicsFeedBot. Telegram posts each message here with the secret set by
 * scripts/telegram_post.py (setWebhook); anything without it is refused. The bot answers from the site's own data
 * (lib/telegram-bot.ts). Each request is counted as one 'bot_query' by command; no message text or user is kept.
 */

type Config = { token: string; channel: string; webhook_secret: string };
let cached: { at: number; value: Config | null } | null = null;

async function config(): Promise<Config | null> {
  if (cached && Date.now() - cached.at < 10 * 60_000) return cached.value;
  const r = await rpc("af_telegram_config", { p_secret: process.env.AF_CRON_SECRET ?? "" });
  const value = r.ok && r.value && (r.value as Config).token ? (r.value as Config) : null;
  cached = { at: Date.now(), value };
  return value;
}

export async function POST(request: Request) {
  const cfg = await config();
  if (!cfg?.webhook_secret || !safeEqual(request.headers.get("x-telegram-bot-api-secret-token"), cfg.webhook_secret)) {
    return new Response("forbidden", { status: 403 });
  }
  const update = (await request.json().catch(() => null)) as { message?: { chat?: { id?: number; type?: string }; text?: string } } | null;
  const chat = update?.message?.chat;
  const text = update?.message?.text;
  // Answer private chats only: in the channel or a group the bot stays quiet.
  if (!chat?.id || chat.type !== "private" || !text) return Response.json({ ok: true });
  const { text: answer, name } = reply(text);
  await fetch(`https://api.telegram.org/bot${cfg.token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat.id, text: answer, parse_mode: "HTML", disable_web_page_preview: true }),
  }).catch(() => null);
  await rpc("af_event", { p_name: "bot_query", p_path: `/bot/${name}`, p_country: "" }).catch(() => null);
  return Response.json({ ok: true });
}

/** The command list, for scripts/telegram_post.py to register with Telegram (setMyCommands). Public, not secret. */
export function GET() {
  return Response.json({ commands: COMMANDS });
}
