/**
 * The Laterite brand in hex, for everything that cannot read the site's CSS tokens: share cards (next/og), the chart
 * PNG and embed, emails, printed documents and icons. The one palette: share cards (lib/og-signature.tsx through
 * lib/og-tokens.ts, lib/brand/receipt-card.tsx, lib/og-card.tsx, lib/og-article.tsx) and charts (lib/charts/render.ts,
 * lib/charts/embed.ts) all draw from this module, so a card, a chart, an email and the site never drift apart.
 * The site's own tokens are in app/globals.css (D-026); tests/site/test_share_cards.py fails when the two differ.
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
  paper2: "#EEE7E1",
  rule: "#E0D6CD",
  surface: "#FFFFFF",
  /** Text on the laterite field. */
  white: "#FFFFFF",
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

/** The same tokens in dark mode (app/globals.css `.dark`), for what follows the reader's setting without the site CSS. */
export const brandDark = {
  laterite: "#E0714C",
  lateriteInk: "#F2916D",
  paper: "#120D0B",
  surface: "#1C1512",
  ink: "#F1E9E4",
  inkSoft: "#D4C6BD",
  muted: "#A8988E",
  rule: "#33261F",
} as const;

/**
 * Chart colours (lib/charts/render.ts): the bar that makes the point is laterite, every other bar a warm grey.
 * Light: laterite 5.7:1 on white; quiet grey 3.8:1. Dark: laterite 5.7:1 on the dark surface; quiet grey 3.7:1.
 * The highlight stays clear of the "down" crimson: dE2000 13 in light, 20 in dark, and a different hue family
 * (orange-red against blue-red), so a highlighted bar never reads as a fall.
 * `quietInk` is the grey for thin lines (sparklines), which need text-level contrast.
 */
export const chartColors = {
  light: { surface: brand.surface, ink: brand.ink, inkSoft: brand.inkSoft, muted: brand.muted, rule: brand.rule, accent: brand.laterite, quiet: "#8F8178", quietInk: brand.muted },
  dark: { surface: brandDark.surface, ink: brandDark.ink, inkSoft: brandDark.inkSoft, muted: brandDark.muted, rule: brandDark.rule, accent: brandDark.laterite, quiet: "#7D6E65", quietInk: brandDark.muted },
} as const;

/** Desk colours (app/globals.css --desk-*, light): a small mark before a desk's name on its cards. */
export const deskColors = {
  markets: "#1F5FAE",
  banking: "#0A6D73",
  companies: "#8A3A80",
  "public-money": "#8C5400",
  "cost-of-living": "#B0365A",
  africa: "#3F6A1E",
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

/** A brand hex at an opacity, for next/og gradients and hairlines: rgba(r,g,b,a). */
export function alpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
