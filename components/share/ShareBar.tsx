import { networkLabel, shareHref, shareNetworks, type ShareNetwork } from "@/lib/share-links";
import { CopyLinkButton } from "./CopyLinkButton";
import { NativeShareButton } from "./NativeShareButton";
import { ShareIcon } from "./ShareIcon";

/**
 * Share a story: WhatsApp, LinkedIn, X, Facebook, Telegram, email, copy link and (on phones that have one) the
 * system share sheet. Plain links rendered on the server; only copy and native share are client islands.
 * Every control carries data-track="share" (counted by PageCounter) and data-network.
 *
 * - inline: a compact icon row under the byline
 * - block: the fuller "Found this useful? Share it" panel at the end of a story
 * - rail: a slim vertical stack for the left gutter on wide screens (hidden below lg)
 */
type Variant = "inline" | "block" | "rail";

function linkName(network: ShareNetwork) {
  return network === "email" ? "Share by email" : `Share on ${networkLabel[network]} (opens in a new tab)`;
}

const iconButton =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rule bg-surface text-ink-soft transition-colors hover:border-accent hover:text-accent focus-visible:border-accent";

const pill =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-rule bg-surface px-4 text-[14px] font-semibold text-ink transition-colors hover:border-accent hover:text-accent";

const primary =
  "col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-[14px] font-semibold text-white hover:opacity-90 dark:text-night";

export function ShareBar({
  url,
  title,
  summary,
  variant = "inline",
  networks = shareNetworks,
  className = "",
  campaign,
  label = "Share this story",
}: {
  /** The canonical absolute address of the story. */
  url: string;
  title: string;
  summary?: string;
  variant?: Variant;
  networks?: readonly ShareNetwork[];
  className?: string;
  /** The kind of page (receipt, record, tool): tags links utm_medium=social, utm_campaign=share-<kind>, and keeps the phone share button in place from first paint. */
  campaign?: string;
  /** The accessible name of the group. */
  label?: string;
}) {
  const links = networks.map((network) => (
    <a
      key={network}
      href={shareHref(network, { url, text: title, summary, campaign })}
      {...(network === "email" ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      data-track="share"
      data-network={network}
      aria-label={variant === "block" ? undefined : linkName(network)}
      title={variant === "block" ? undefined : networkLabel[network]}
      className={variant === "block" ? pill : iconButton}
    >
      <ShareIcon name={network} />
      {variant === "block" ? <span>{networkLabel[network]}</span> : null}
    </a>
  ));

  if (variant === "rail") {
    return (
      <nav aria-label={label} className={`no-print hidden lg:flex lg:flex-col lg:items-center lg:gap-2 ${className}`}>
        <span className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">Share</span>
        {links.filter((_, i) => ["whatsapp", "linkedin", "x", "facebook"].includes(networks[i]))}
        <CopyLinkButton url={url} campaign={campaign} className={iconButton} showLabel={false} />
      </nav>
    );
  }

  if (variant === "block") {
    return (
      <section
        aria-labelledby="share-block-heading"
        className={`no-print relative overflow-hidden rounded-3xl border border-rule bg-surface px-5 py-6 sm:px-8 sm:py-8 ${className}`}
      >
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-accent" />
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-accent">Pass it on</p>
        <h2 id="share-block-heading" className="mt-2 font-serif text-[1.65rem] leading-tight text-ink text-balance sm:text-3xl">
          Found this useful? Share it
        </h2>
        <p className="mt-2 max-w-prose text-[15px] leading-6 text-ink-soft">
          Send it to a colleague, a client or the group chat. Every link goes straight to this story, with its sources.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <NativeShareButton url={url} title={title} text={summary} campaign={campaign} stable={Boolean(campaign)} className={primary} />
          {links}
          <CopyLinkButton url={url} campaign={campaign} className={`${pill} col-span-2 sm:col-span-1`} />
        </div>
      </section>
    );
  }

  return (
    <div role="group" aria-label={label} className={`no-print flex flex-wrap items-center gap-1.5 sm:gap-2 ${className}`}>
      <span className="mr-1 hidden text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted sm:inline">Share</span>
      <NativeShareButton url={url} title={title} text={summary} campaign={campaign} stable={Boolean(campaign)} className={iconButton} showLabel={false} />
      {links}
      <CopyLinkButton url={url} campaign={campaign} className={iconButton} showLabel={false} />
    </div>
  );
}
