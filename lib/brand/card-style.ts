/**
 * The Laterite brand in hex, for everything that cannot read the site's CSS tokens: share cards (next/og), emails,
 * printed documents and icons. One module, so a share card, an email and the site never drift apart.
 * The site's own tokens are in app/globals.css (D-026); keep the two in step.
 */

export const brand = {
  /** The signature: laterite, the red-earth murram of East Africa's roads. Masthead, card field, rules, frames. */
  laterite: "#B3401F",
  /** Laterite dark enough for text on paper and on white (6.0:1 and 6.6:1). */
  lateriteInk: "#A33A1C",
  /** Laterite for text and fills on night (dark mode): 8.3:1 on night. */
  lateriteLight: "#F2916D",
  /** The masthead in dark mode. */
  lateriteDeep: "#8F3016",
  /** The cream of the receipt slip and the stamp disc. */
  slip: "#FBF6F2",
  stampPaper: "#FBEFE6",
  /** Sand: the accent on night and laterite surfaces. */
  sand: "#F6C9A0",
  sandSoft: "#FBE3D6",
  ink: "#1D1512",
  inkSoft: "#45372F",
  muted: "#6C5E55",
  paper: "#F7F3EF",
  night: "#1D1512",
  night2: "#2B201B",
  nightInk: "#FBF6F2",
  nightSoft: "#E2D4CB",
  nightMuted: "#B8A69A",
  /** Markets: a rise and a fall. Down is crimson, kept well clear of laterite (dE2000 13 in light, 19 in dark). */
  up: "#0F7F57",
  down: "#C4263E",
  upOnNight: "#5CD6A8",
  downOnNight: "#FF7F98",
} as const;

/** The share-card frame: 1200x630, a laterite field around a cream receipt slip with a torn foot. */
export const cardFrame = {
  width: 1200,
  height: 630,
  /** Padding of the laterite field around the slip. */
  field: { top: 40, side: 56, bottom: 26 },
  /** The slip's height before its torn foot, and the size of each tooth of the tear. */
  slipHeight: 452,
  tooth: 16,
  /** The stamp: a 5px laterite border, rotated 8 degrees off true. */
  stamp: { border: 5, rotate: -8 },
} as const;
