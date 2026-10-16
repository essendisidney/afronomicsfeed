import Link from "next/link";

/**
 * The Afronomics mark (D-026): a rubber stamp, a cream disc with a dashed laterite ring around "Af", set a few degrees
 * off true like a real one. It reads at 64px, the size a WhatsApp or LinkedIn thumbnail shows it. Drawn inline in the
 * site's tokens, so it needs no image request and holds in light, dark and on the laterite masthead. The same drawing
 * is the favicon (app/icon.svg) and the app icons (public/icons).
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <g transform="rotate(-9 20 20)">
        <circle cx="20" cy="20" r="19.5" style={{ fill: "var(--stamp-paper)" }} />
        <circle cx="20" cy="20" r="16.2" fill="none" strokeWidth="1.6" strokeDasharray="2.2 1.4" style={{ stroke: "var(--sig)" }} />
        <text
          x="20"
          y="27"
          textAnchor="middle"
          fontSize="20"
          letterSpacing="-0.5"
          style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 700, fill: "var(--sig)" }}
        >
          Af
        </text>
      </g>
    </svg>
  );
}

export function Wordmark({ compact = false, night = false }: { compact?: boolean; night?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex min-h-11 min-w-0 shrink-0 items-center gap-2 no-underline ${night ? "on-night text-night-ink" : "text-ink"}`}
      aria-label="Afronomics Feed, home"
    >
      <Mark className={compact ? "h-9 w-9" : "h-11 w-11"} />
      <span aria-hidden="true" className={`af-wordtext ${compact ? "" : "text-[1.6rem]"}`}>
        Afronomics
      </span>
    </Link>
  );
}
