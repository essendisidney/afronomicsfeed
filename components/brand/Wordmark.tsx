import Link from "next/link";
import { MARK, WORDMARK } from "./logo-paths";

/**
 * The Afronomics mark: seven bars tracing the continent, the East Africa bar lit in jacaranda.
 * Drawn inline so it takes the surrounding text colour and needs no image request.
 */
export function Mark({ className, accent = "var(--brand-accent)" }: { className?: string; accent?: string }) {
  return (
    <svg viewBox={`0 0 ${MARK.width} ${MARK.height}`} className={className} aria-hidden="true" focusable="false">
      {MARK.bars.map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={bar.y}
          width={bar.w}
          height={bar.h}
          rx={bar.w / 2}
          fill={i === MARK.accentIndex ? accent : "currentColor"}
        />
      ))}
    </svg>
  );
}

const GAP = 20;
const WIDTH = MARK.width + GAP + WORDMARK.width;
const HEIGHT = 76;

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={className} role="img" aria-label="Afronomics Feed">
      {MARK.bars.map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={bar.y + 4}
          width={bar.w}
          height={bar.h}
          rx={bar.w / 2}
          fill={i === MARK.accentIndex ? "var(--brand-accent)" : "currentColor"}
        />
      ))}
      <g transform={`translate(${MARK.width + GAP} 18)`}>
        <path d={WORDMARK.name} fill="currentColor" />
        <path d={WORDMARK.sub} fill="var(--brand-accent)" />
      </g>
    </svg>
  );
}

export function Wordmark({ compact = false, night = false }: { compact?: boolean; night?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex min-w-0 shrink-0 items-center no-underline ${night ? "on-night text-night-ink" : "text-ink"}`}
      aria-label="Afronomics Feed, home"
    >
      <Logo className={compact ? "h-8 w-auto sm:h-10" : "h-11 w-auto sm:h-12"} />
    </Link>
  );
}
