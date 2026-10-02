import { site } from "@/lib/site";

/**
 * Share to WhatsApp (where Kenya actually forwards things), copy a link, and join the channel when one is set.
 * Plain links, no scripts: wa.me opens the app on a phone and WhatsApp Web on a desktop.
 */
export function ShareRow({ text, path, label = "Share" }: { text: string; path: string; label?: string }) {
  const url = `${site.url}${path}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}?utm_source=whatsapp&utm_medium=share`)}`;
  const channel = process.env.WHATSAPP_CHANNEL_URL;
  const tg = process.env.TELEGRAM_CHANNEL_URL;
  const pill = "inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-1.5 text-[13px] font-medium text-ink hover:border-accent";
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2" aria-label={label}>
      <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</span>
      <a href={wa} target="_blank" rel="noopener noreferrer" className={pill}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c1.7.7 2.3.8 3.1.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3Z" />
        </svg>
        WhatsApp
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={pill}>
        LinkedIn
      </a>
      <a href={`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={pill}>
        X
      </a>
      {channel ? (
        <a href={channel} target="_blank" rel="noopener noreferrer" className={`${pill} border-accent/50 text-accent`}>
          Join the WhatsApp channel
        </a>
      ) : null}
      {tg ? (
        <a href={tg} target="_blank" rel="noopener noreferrer" className={pill}>
          Telegram
        </a>
      ) : null}
    </div>
  );
}
