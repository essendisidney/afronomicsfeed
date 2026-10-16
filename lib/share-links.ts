/**
 * Share links for stories: plain intent URLs on each network, no scripts, no SDKs, no pixels. Every link carries
 * utm_source=<network>&utm_medium=share on the page address, so PageCounter can count arrivals by network.
 * No server imports: the client share islands (copy, native share, quote share) use this too.
 */

export const shareNetworks = ["whatsapp", "linkedin", "x", "facebook", "telegram", "email"] as const;
export type ShareNetwork = (typeof shareNetworks)[number];

export const networkLabel: Record<ShareNetwork | "copy" | "native", string> = {
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  x: "X",
  facebook: "Facebook",
  telegram: "Telegram",
  email: "Email",
  copy: "Copy link",
  native: "Share…",
};

/**
 * The page address tagged with where the share came from. Keeps any query the address already has. With a
 * `campaign` (the kind of page: receipt, record, tool, number), the link is tagged
 * utm_source=<network>&utm_medium=social&utm_campaign=share-<kind> (docs/rebuild/phase-7b-plan.md, 7b-2), so the desk's
 * readers lane can tell which kind of page a share brought readers to; without one, as the story bars always have.
 */
export function taggedUrl(url: string, source: string, campaign?: string): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", source);
  u.searchParams.set("utm_medium", campaign ? "social" : "share");
  if (campaign) u.searchParams.set("utm_campaign", `share-${campaign}`);
  return u.toString();
}

const enc = encodeURIComponent;

/**
 * The intent URL for one network. `text` is the headline (or a quote); `summary` is used where a network shows a
 * body (email). X and Telegram take the address separately, so it is not repeated inside the text.
 */
export function shareHref(network: ShareNetwork, { url, text, summary, campaign }: { url: string; text: string; summary?: string; campaign?: string }): string {
  const link = taggedUrl(url, network, campaign);
  switch (network) {
    case "whatsapp":
      return `https://wa.me/?text=${enc(`${text}\n\n${link}`)}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${enc(link)}`;
    case "x":
      return `https://x.com/intent/post?text=${enc(text)}&url=${enc(link)}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${enc(link)}`;
    case "telegram":
      return `https://t.me/share/url?url=${enc(link)}&text=${enc(text)}`;
    case "email":
      return `mailto:?subject=${enc(text)}&body=${enc(`${summary ? `${summary}\n\n` : ""}${link}`)}`;
  }
}

/** A selected passage as a shareable quote: curly quotes, whitespace collapsed, cut at a word to fit `max`. */
export function quoteText(selection: string, max = 280): string {
  const clean = selection.replace(/\s+/g, " ").trim().replace(/^[“"‘']+|[”"’']+$/g, "");
  const body = clean.length <= max - 2 ? clean : `${clean.slice(0, clean.lastIndexOf(" ", max - 3)).replace(/[\s,;:—–-]+$/, "")}…`;
  return `“${body}”`;
}
