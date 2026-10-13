import Link from "next/link";

/**
 * Cards. One radius (rounded-2xl), one border (rule), one padding rhythm, so a pricing tier, a stat block and a
 * form panel read as the same family on every page.
 *
 * - default: surface card with a hairline border
 * - emphasis: the one card on a page that holds the main action (a pilot form, the API tier)
 * - muted: a quieter panel on paper-2, for notes and secondary facts
 */
export type CardTone = "default" | "emphasis" | "muted";

const tones: Record<CardTone, string> = {
  default: "border border-rule bg-surface",
  emphasis: "border-2 border-forest/30 bg-surface",
  muted: "border border-rule bg-paper-2",
};

export function cardClass(tone: CardTone = "default", className = "") {
  return ["rounded-2xl px-5 py-5", tones[tone], className].filter(Boolean).join(" ");
}

export function Card({
  tone = "default",
  as: Tag = "div",
  className,
  children,
  ...rest
}: {
  tone?: CardTone;
  as?: "div" | "section" | "article" | "aside";
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className">) {
  return (
    <Tag className={cardClass(tone, className)} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * A whole-card link on a night surface: "Download the CSV", "Request a 30-day pilot". Night rather than ink, so
 * it stays a dark tile in dark mode instead of flipping to a pale slab, with a hairline ring to lift it off the
 * dark page.
 */
export function ActionTile({
  href,
  kicker,
  title,
  children,
  download,
  className = "",
  ...rest
}: {
  href: string;
  kicker: string;
  title: string;
  children?: React.ReactNode;
  download?: boolean;
  className?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "title">) {
  const cls = `on-night group block rounded-2xl bg-night px-5 py-5 text-night-ink ring-1 ring-night-line transition-colors hover:bg-night-2 ${className}`;
  const body = (
    <>
      <span className="block text-[12px] font-medium text-night-soft">{kicker}</span>
      <span className="mt-1 flex items-baseline justify-between gap-3 font-serif text-2xl">
        {title}
        <span aria-hidden className="text-accent transition-transform group-hover:translate-x-0.5">
          {download ? "↓" : "→"}
        </span>
      </span>
      {children ? <span className="mt-1 block space-y-0.5 text-[12px] leading-5 text-night-soft">{children}</span> : null}
    </>
  );
  return href.startsWith("/") && !download ? (
    <Link href={href} className={cls} {...rest}>
      {body}
    </Link>
  ) : (
    <a href={href} download={download || undefined} className={cls} {...rest}>
      {body}
    </a>
  );
}
