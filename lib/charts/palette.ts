import { chartColors } from "@/lib/brand/card-style";
import type { ChartPalette } from "@/lib/charts/render";

const fromBrand = ({ surface, ink, inkSoft, muted, rule, accent, quiet }: (typeof chartColors)["light" | "dark"]): ChartPalette => ({
  surface,
  ink,
  inkSoft,
  muted,
  rule,
  accent,
  quiet,
});

/**
 * The chart tokens as hex (Laterite, lib/brand/card-style.ts), for an image that has no site stylesheet: the PNG a
 * reader downloads or shares (lib/charts/export.ts). The page itself draws with cssPalette (lib/charts/render.ts).
 */
export const lightPalette: ChartPalette = fromBrand(chartColors.light);
export const darkPalette: ChartPalette = fromBrand(chartColors.dark);
