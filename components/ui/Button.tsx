import Link from "next/link";

/**
 * One button style for the whole site. Every variant is at least 44px tall on a phone (a thumb target) and
 * relaxes to 40px from the sm breakpoint, where a pointer is the norm.
 *
 * - primary: the main action on a light surface (ink, which flips to light ink in dark mode)
 * - accent: the one laterite call to action, for use on night surfaces (header, hero, Pro tile)
 * - secondary: an outlined alternative next to a primary
 * - night: an outlined button on a night surface
 */
export type ButtonVariant = "primary" | "accent" | "secondary" | "night";
export type ButtonSize = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-center font-semibold leading-5 transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 py-2 text-[13px] sm:min-h-9",
  md: "min-h-11 px-5 py-2.5 text-[14px] sm:min-h-10",
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-paper hover:bg-forest",
  accent: "bg-accent text-on-accent hover:bg-gold-soft",
  secondary: "border border-ink/20 text-ink hover:border-accent hover:text-forest",
  night: "border border-night-line text-night-ink hover:bg-night-2",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  block = false,
  className = "",
}: { variant?: ButtonVariant; size?: ButtonSize; block?: boolean; className?: string } = {}) {
  return [base, sizes[size], variants[variant], block ? "flex w-full" : "", className].filter(Boolean).join(" ");
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; block?: boolean; className?: string; children: React.ReactNode };

/** An internal or external link styled as a button. Internal hrefs go through next/link. */
export function ButtonLink({
  href,
  variant,
  size,
  block,
  className,
  children,
  ...rest
}: Common & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">) {
  const cls = buttonClass({ variant, size, block, className });
  const internal = href.startsWith("/") && !href.startsWith("//") && !rest.download;
  return internal ? (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  ) : (
    <a href={href} className={cls} {...rest}>
      {children}
    </a>
  );
}
