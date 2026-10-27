/**
 * The WhatsApp Channel (docs/rebuild/upgrade-U6-plan.md, item D). The founder creates the channel in the WhatsApp app
 * and sets its invite link as WHATSAPP_CHANNEL_URL on the deployment; until then every "Join on WhatsApp" slot renders
 * nothing. Only a real channel link is accepted, so a typo or a personal chat link (wa.me/<number>) can never appear
 * on the site. No imports: tests/site/test_channels.py runs this file directly.
 */

const CHANNEL = /^https:\/\/(?:www\.)?whatsapp\.com\/channel\/[A-Za-z0-9_-]{8,64}\/?$/;

/** The channel's invite link, or null when it is unset or not a WhatsApp Channel link. */
export function whatsappChannelUrl(value: string | undefined = process.env.WHATSAPP_CHANNEL_URL): string | null {
  const v = (value ?? "").trim();
  return CHANNEL.test(v) ? v.replace(/\/$/, "") : null;
}

export type ChannelLang = "en" | "sw";

const CLOSE: Record<ChannelLang, { sources: string; advice: string }> = {
  en: { sources: "Sources", advice: "Information, not advice." },
  sw: { sources: "Vyanzo", advice: "Taarifa, si ushauri." },
};

/**
 * The Morning as a WhatsApp Channel post: the WhatsApp text the site already builds (lib/editions/morning.ts,
 * morning-sw.ts), its link tagged for the channel, then one line naming every publisher the figures came from and the
 * house line. Publishers are listed once each, in the order given. Pure: the caller passes the text and the names.
 */
export function channelPost(text: string, sources: string[], lang: ChannelLang = "en") {
  const body = text.replace(/utm_source=whatsapp&utm_medium=share/g, "utm_source=whatsapp_channel&utm_medium=channel");
  const names = [...new Set(sources.map((s) => s.trim()).filter(Boolean))];
  const close = CLOSE[lang];
  return [body, names.length ? `${close.sources}: ${names.join("; ")}.` : "", `_${close.advice}_`].filter(Boolean).join("\n\n");
}
