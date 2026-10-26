import { ShareIcon } from "@/components/share/ShareIcon";
import { buttonClass } from "@/components/ui/Button";
import { whatsappChannelUrl } from "@/lib/channels";

const copy = {
  en: { join: "Join on WhatsApp", line: "The Morning on the Afronomics WhatsApp Channel, every weekday. Free." },
  sw: { join: "Jiunge kwenye WhatsApp", line: "Asubuhi kwenye chaneli ya WhatsApp ya Afronomics, kila siku ya kazi. Bure." },
} as const;

/**
 * "Join on WhatsApp" (docs/rebuild/upgrade-U6-plan.md, item D). Renders nothing until WHATSAPP_CHANNEL_URL holds a
 * real WhatsApp Channel link (lib/channels.ts), so the slot can ship before the channel exists. `button` sits in a
 * card under a sign-up form; `link` is a single line for tighter spots.
 */
export function WhatsAppChannel({ lang = "en", variant = "button", className = "" }: { lang?: "en" | "sw"; variant?: "button" | "link"; className?: string }) {
  const url = whatsappChannelUrl();
  if (!url) return null;
  const t = copy[lang];
  if (variant === "link") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        data-track="share"
        data-network="whatsapp_channel"
        className={`inline-flex min-h-11 items-center gap-2 text-[13.5px] font-semibold text-forest underline underline-offset-4 hover:text-ink ${className}`}
      >
        <ShareIcon name="whatsapp" size={16} />
        {t.join}
      </a>
    );
  }
  return (
    <div className={`no-print ${className}`}>
      <a href={url} target="_blank" rel="noopener noreferrer" data-track="share" data-network="whatsapp_channel" className={buttonClass({ variant: "secondary" })}>
        <ShareIcon name="whatsapp" size={16} />
        {t.join}
      </a>
      <p className="mt-2 text-[12.5px] leading-5 text-muted">{t.line}</p>
    </div>
  );
}
