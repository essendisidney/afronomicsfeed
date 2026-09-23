export type AskDoor = {
  label: string;
  href: string;
};

export type AskQuestion = {
  slug: string;
  title: string;
  lede: string;
  wouldRetrieve: AskDoor[];
};

export const askQuestions: AskQuestion[] = [
  {
    slug: "kenya-currency-peers",
    title: "How has Kenya’s currency performed against regional peers?",
    lede: "Needs a stored FX series for KES and the peer prints. The model cannot write a ranking.",
    wouldRetrieve: [
      { label: "USD/KES file", href: "/markets/currencies/usd-kes" },
      { label: "USD/TZS file", href: "/markets/currencies/usd-tzs" },
      { label: "USD/UGX file", href: "/markets/currencies/usd-ugx" },
      { label: "Kenya economy", href: "/economy/kenya" },
    ],
  },
  {
    slug: "east-africa-climate-finance",
    title: "Show climate finance deployed into East Africa.",
    lede: "Needs cited DFI and project tickets. Committed and deployed stay blank without a source.",
    wouldRetrieve: [
      { label: "Kenya climate capital", href: "/climate/kenya" },
      { label: "Climate finance book · Kenya", href: "/capital/climate-finance/kenya" },
      { label: "Kenya Project Lens", href: "/projects/kenya" },
      { label: "Climate signal", href: "/signals/east-africa-dfi-climate" },
    ],
  },
  {
    slug: "fintech-capital",
    title: "Which African countries attracted the most fintech capital?",
    lede: "A ranking requires a sourced VC book. No invented league table.",
    wouldRetrieve: [
      { label: "Fintech lens", href: "/technology/fintech" },
      { label: "VC book", href: "/capital/vc" },
      { label: "Kenya fintech file", href: "/technology/fintech/kenya" },
      { label: "Nigeria fintech file", href: "/technology/fintech/nigeria" },
    ],
  },
  {
    slug: "nigeria-inflation",
    title: "What happened to Nigerian inflation over the last 24 months?",
    lede: "Needs the national statistics or central-bank series. The model cannot interpolate a print.",
    wouldRetrieve: [
      { label: "Nigeria inflation cell", href: "/indicators/inflation/nigeria" },
      { label: "Nigeria economy", href: "/economy/nigeria" },
      { label: "USD/NGN file", href: "/markets/currencies/usd-ngn" },
    ],
  },
  {
    slug: "kenya-dfi-sectors",
    title: "Which sectors are receiving DFI capital in Kenya?",
    lede: "Needs the institution’s own disclosure. Sector shares stay unnamed without a ticket.",
    wouldRetrieve: [
      { label: "Kenya DFI book", href: "/capital/dfi/kenya" },
      { label: "Kenya Project Lens", href: "/projects/kenya" },
      { label: "Kenya capital series", href: "/countries/kenya/capital" },
    ],
  },
  {
    slug: "northern-corridor-dwell",
    title: "What is port dwell on the Northern Corridor?",
    lede: "Needs a licensed logistics or port-authority series. Hours are not estimated here.",
    wouldRetrieve: [
      { label: "Northern Corridor", href: "/trade/northern-corridor" },
      { label: "Mombasa port", href: "/trade/ports/mombasa" },
      { label: "Kenya on the corridor", href: "/trade/northern-corridor/kenya" },
    ],
  },
];

export function getAskQuestion(slug: string) {
  return askQuestions.find((item) => item.slug === slug);
}

export function askFileHref(slug: string) {
  return `/ask/${slug}`;
}
