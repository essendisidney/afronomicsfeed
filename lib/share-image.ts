/**
 * The share card for a page that sets its own `openGraph` but has no opengraph-image of its own. Metadata merges
 * shallowly, so a page's `openGraph` block replaces its parent's, card included: without this, LinkedIn, WhatsApp
 * and X showed those pages as a large blank card. Points at the nearest section card (app/<section>/opengraph-image.tsx,
 * or the site card at "/").
 */
export function shareImage(section: "" | "/markets", alt: string) {
  return [{ url: `${section}/opengraph-image`, width: 1200, height: 630, type: "image/png", alt }];
}

export const MARKETS_CARD_ALT = "Afronomics markets: the latest Kenya one-year bill rate and its change";
export const SITE_CARD_ALT = "Afronomics: Africa's markets, sourced";
