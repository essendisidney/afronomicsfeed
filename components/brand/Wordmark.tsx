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

/**
 * Signature-look preview (lib/look.ts): each look swaps the bar mark for a badge that still reads at 64px, plus a
 * typeset name. Hidden unless <html> carries data-look, so the site on main is unchanged. Colours come from the
 * look's tokens (app/globals.css), so one drawing serves light, dark and the night masthead.
 */
function LookBadge({ look, className }: { look: "a" | "b" | "c"; className?: string }) {
  const serif = { fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 700 } as const;
  if (look === "a") {
    // Kente Gold: a gold ledger tile, "Af" in ink over a double rule (the accountant's total).
    return (
      <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
        <rect width="40" height="40" rx="3" style={{ fill: "var(--sig)" }} />
        <text x="20" y="25" textAnchor="middle" fontSize="21" letterSpacing="-0.5" style={{ ...serif, fill: "var(--sig-on)" }}>
          Af
        </text>
        <rect x="9" y="29.5" width="22" height="2" style={{ fill: "var(--sig-on)" }} />
        <rect x="9" y="33" width="22" height="2" style={{ fill: "var(--sig-on)" }} />
      </svg>
    );
  }
  if (look === "b") {
    // Laterite: a rubber stamp, cream disc and dashed terracotta ring, set a few degrees off true like a real one.
    return (
      <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
        <g transform="rotate(-9 20 20)">
          <circle cx="20" cy="20" r="19.5" style={{ fill: "var(--stamp-paper)" }} />
          <circle cx="20" cy="20" r="16.2" fill="none" strokeWidth="1.6" strokeDasharray="2.2 1.4" style={{ stroke: "var(--sig)" }} />
          <text x="20" y="27" textAnchor="middle" fontSize="20" letterSpacing="-0.5" style={{ ...serif, fill: "var(--sig)" }}>
            Af
          </text>
        </g>
      </svg>
    );
  }
  // Malachite: the stone's banding, cut as a tile, with a white "Af".
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="af-badge-c-clip">
          <rect width="40" height="40" rx="8" />
        </clipPath>
      </defs>
      <g clipPath="url(#af-badge-c-clip)">
        <rect width="40" height="40" style={{ fill: "var(--band-1)" }} />
        <circle cx="40" cy="40" r="27" fill="none" strokeWidth="3.5" style={{ stroke: "var(--band-2)" }} />
        <circle cx="40" cy="40" r="20" fill="none" strokeWidth="3" style={{ stroke: "var(--band-3)" }} />
        <circle cx="40" cy="40" r="13.5" fill="none" strokeWidth="2.5" style={{ stroke: "var(--band-2)" }} />
      </g>
      <rect x="1" y="1" width="38" height="38" rx="7.5" fill="none" strokeWidth="2" style={{ stroke: "var(--band-3)" }} />
      <text x="16.5" y="24" textAnchor="middle" fontSize="19" letterSpacing="-0.5" style={{ ...serif, fill: "#ffffff" }}>
        Af
      </text>
    </svg>
  );
}

export function Wordmark({ compact = false, night = false, logoClassName }: { compact?: boolean; night?: boolean; logoClassName?: string }) {
  return (
    <Link
      href="/"
      className={`af-wordmark inline-flex min-h-11 min-w-0 shrink-0 items-center no-underline ${night ? "on-night text-night-ink" : "text-ink"}`}
      aria-label="Afronomics Feed, home"
    >
      <Logo className={`af-logo ${logoClassName ?? (compact ? "h-8 w-auto sm:h-10" : "h-11 w-auto sm:h-12")}`} />
      <span aria-hidden="true" className="af-look-mark items-center gap-2">
        <LookBadge look="a" className="af-badge af-badge-a h-8 w-8" />
        <LookBadge look="b" className="af-badge af-badge-b h-9 w-9" />
        <LookBadge look="c" className="af-badge af-badge-c h-8 w-8" />
        <span className="af-wordtext">Afronomics</span>
      </span>
    </Link>
  );
}
