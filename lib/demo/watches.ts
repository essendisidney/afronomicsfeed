export const watchTemplates = [
  {
    slug: "kenya-policy",
    label: "Kenya policy",
    lede: "CBK, Treasury and policy-rate cells. Saves require a signed-in seat.",
    hrefs: ["/agencies/central-bank/kenya", "/indicators/policy-rate/kenya", "/countries/kenya/policy"],
  },
  {
    slug: "kenya-markets",
    label: "Kenya markets",
    lede: "NSE issuers and FX file. No live tape is redistributed.",
    hrefs: ["/institutions/nse", "/markets/currencies/usd-kes", "/companies/safaricom"],
  },
  {
    slug: "northern-corridor",
    label: "Northern Corridor",
    lede: "Trade and port files along Mombasa–Nairobi–Kampala.",
    hrefs: ["/trade/northern-corridor", "/trade/ports/mombasa", "/cities/mombasa"],
  },
  {
    slug: "climate-capital",
    label: "Climate capital",
    lede: "Climate books and Project Lens. Amounts stay blank until cited.",
    hrefs: ["/climate/kenya", "/capital/climate-finance/kenya", "/projects/kenya"],
  },
] as const;

export const alertKinds = [
  {
    slug: "policy-print",
    label: "Policy print",
    lede: "Notify when a central-bank or treasury notice is stored — not when a model guesses.",
  },
  {
    slug: "issuer-filing",
    label: "Issuer filing",
    lede: "Exchange or company disclosure tagged to a company file.",
  },
  {
    slug: "capital-ticket",
    label: "Capital ticket",
    lede: "A cited commitment lands in a capital book.",
  },
  {
    slug: "signal-open",
    label: "Signal open",
    lede: "A signal file publishes with separated fact and interpretation.",
  },
] as const;

/** Always empty until Auth + subscription exist. */
export function savedWatches() {
  return [] as { id: string; templateSlug: string; label: string }[];
}

export function activeAlerts() {
  return [] as { id: string; kindSlug: string; label: string }[];
}
