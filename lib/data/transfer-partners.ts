/**
 * Money-transfer services we can send readers to, matched from the names in the World Bank's survey. Every button
 * goes through /go/<slug> (app/go/[partner]/route.ts), which counts the click and redirects: to the provider's
 * affiliate link when one is set as an environment variable (AFF_<SLUG>, e.g. AFF_WISE), otherwise to its own site.
 * The ranking never depends on this list: services without an entry are ranked all the same, just without a button.
 */
export type Partner = { slug: string; name: string; site: string; match: RegExp };

export const partners: Partner[] = [
  { slug: "wise", name: "Wise", site: "https://wise.com", match: /^(wise|transferwise)\b/i },
  { slug: "remitly", name: "Remitly", site: "https://www.remitly.com", match: /^remitly\b/i },
  { slug: "worldremit", name: "WorldRemit", site: "https://www.worldremit.com", match: /^world ?remit\b/i },
  { slug: "westernunion", name: "Western Union", site: "https://www.westernunion.com", match: /^western union\b/i },
  { slug: "moneygram", name: "MoneyGram", site: "https://www.moneygram.com", match: /^moneygram\b/i },
  { slug: "sendwave", name: "Sendwave", site: "https://www.sendwave.com", match: /^sendwave\b/i },
  { slug: "taptapsend", name: "Taptap Send", site: "https://www.taptapsend.com", match: /^tap ?tap ?send\b/i },
  { slug: "lemfi", name: "LemFi", site: "https://lemfi.com", match: /^lemfi\b/i },
  { slug: "paysend", name: "Paysend", site: "https://paysend.com", match: /^paysend\b/i },
  { slug: "skrill", name: "Skrill", site: "https://www.skrill.com", match: /^skrill\b/i },
  { slug: "ria", name: "Ria", site: "https://www.riamoneytransfer.com", match: /^ria\b/i },
  { slug: "mukuru", name: "Mukuru", site: "https://www.mukuru.com", match: /^mukuru\b/i },
  { slug: "mamamoney", name: "Mama Money", site: "https://www.mamamoney.co.za", match: /^mama ?money\b/i },
  { slug: "dahabshiil", name: "Dahabshiil", site: "https://www.dahabshiil.com", match: /^dahabshiil\b/i },
  { slug: "nala", name: "NALA", site: "https://www.nala.com", match: /^nala\b/i },
  { slug: "xoom", name: "Xoom", site: "https://www.xoom.com", match: /^xoom\b/i },
  { slug: "hellopaisa", name: "Hello Paisa", site: "https://www.hellopaisa.co.za", match: /^hello-? ?paisa\b/i },
];

export const partnerFor = (firm: string) => partners.find((p) => p.match.test(firm.trim())) ?? null;
export const partnerBySlug = (slug: string) => partners.find((p) => p.slug === slug) ?? null;

/** Where /go/<slug> sends the reader: the affiliate link when set (https only), else the provider's own site. */
export function partnerUrl(p: Partner) {
  const aff = process.env[`AFF_${p.slug.toUpperCase()}`];
  return aff && /^https:\/\//.test(aff) ? aff : p.site;
}
