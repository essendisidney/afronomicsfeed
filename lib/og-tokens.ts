import { brand, deskColors } from "@/lib/brand/card-style";

/**
 * The share cards' colours, by the names lib/og-signature.tsx draws with. Every value comes from the one brand palette,
 * lib/brand/card-style.ts (Laterite, D-026), which tests/site/test_share_cards.py keeps in step with app/globals.css;
 * this module holds no colour of its own.
 */
const tokens = {
  sig: brand.laterite, // the terracotta field
  "sig-ink": brand.lateriteInk, // terracotta text on light
  "stamp-paper": brand.stampPaper, // the badge disc
  mast: brand.lateriteDeep, // masthead dark, for the slip's shadow edge
  ink: brand.ink,
  "ink-soft": brand.inkSoft,
  muted: brand.muted,
  paper: brand.paper,
  rule: brand.rule,
  /** The receipt slip: a little lighter than the page paper. */
  slip: brand.slip,
  /** Text on the terracotta field. */
  onField: brand.white,
  onFieldSoft: brand.sandSoft,
} as const;

export function ogTokens() {
  return tokens;
}

/** A desk's colour: a small mark before the desk's name on its cards; the signature otherwise. */
export function accentFor(desk: string | null | undefined): string {
  if (desk && desk in deskColors) return deskColors[desk as keyof typeof deskColors];
  return brand.lateriteInk;
}
