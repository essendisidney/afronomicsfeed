/**
 * Small status labels: "Includes the API", "Late", "Live", "Not available". Up and down keep their market
 * colours; the accent tone is for product labels only, never for a market move.
 */
export type BadgeTone = "neutral" | "accent" | "up" | "down" | "warn";

// Coloured text on the plain surface with a tinted ring: a tinted fill would pull the small text below 4.5:1.
const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface text-ink-soft ring-rule",
  accent: "bg-surface text-forest ring-forest/30",
  up: "bg-surface text-up ring-up/40",
  down: "bg-surface text-down ring-down/40",
  warn: "bg-surface text-opinion ring-opinion/40",
};

export function badgeClass(tone: BadgeTone = "neutral", className = "") {
  return [
    "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 ring-1 ring-inset",
    tones[tone],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Badge({ tone = "neutral", className, children }: { tone?: BadgeTone; className?: string; children: React.ReactNode }) {
  return <span className={badgeClass(tone, className)}>{children}</span>;
}
