import { ShareIcon } from "@/components/share/ShareIcon";
import { shareHref } from "@/lib/share-links";
import { site } from "@/lib/site";

/**
 * Share to WhatsApp (where Kenya actually forwards things), LinkedIn and X, and join the channels when they are
 * set. Plain links, no scripts: wa.me opens the app on a phone and WhatsApp Web on a desktop. Stories use the
 * fuller components/share/ShareBar; this compact row serves the tools and data pages.
 */
export function ShareRow({ text, path, label = "Share" }: { text: string; path: string; label?: string }) {
  const url = `${site.url}${path}`;
  const channel = process.env.WHATSAPP_CHANNEL_URL;
  const tg = process.env.TELEGRAM_CHANNEL_URL;
  const pill =
    "inline-flex min-h-11 items-center gap-2 rounded-full border border-rule bg-surface px-4 text-[13.5px] font-semibold text-ink transition-colors hover:border-accent hover:text-accent";
  return (
    <div className="no-print mt-6 flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="mr-1 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</span>
      <a href={shareHref("whatsapp", { url, text })} target="_blank" rel="noopener noreferrer" data-track="share" data-network="whatsapp" className={pill}>
        <ShareIcon name="whatsapp" size={16} />
        WhatsApp
      </a>
      <a href={shareHref("linkedin", { url, text })} target="_blank" rel="noopener noreferrer" data-track="share" data-network="linkedin" className={pill}>
        <ShareIcon name="linkedin" size={16} />
        LinkedIn
      </a>
      <a href={shareHref("x", { url, text })} target="_blank" rel="noopener noreferrer" data-track="share" data-network="x" className={pill}>
        <ShareIcon name="x" size={15} />X
      </a>
      {channel ? (
        <a href={channel} target="_blank" rel="noopener noreferrer" data-track="share" data-network="whatsapp_channel" className={`${pill} border-accent/50 text-accent`}>
          Join the WhatsApp channel
        </a>
      ) : null}
      {tg ? (
        <a href={tg} target="_blank" rel="noopener noreferrer" data-track="share" data-network="telegram_channel" className={pill}>
          <ShareIcon name="telegram" size={16} />
          Telegram
        </a>
      ) : null}
    </div>
  );
}
