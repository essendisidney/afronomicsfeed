export type IdentifierKind = {
  slug: string;
  label: string;
  status: "vocabulary" | "empty";
  lede: string;
  href: string;
};

/** Names for how an entity would be keyed. No crosswalk or sample ticker is stored. */
export const identifierKinds: IdentifierKind[] = [
  {
    slug: "country-code",
    label: "Country code",
    status: "vocabulary",
    lede: "The country file is the door. This page does not store a code table.",
    href: "/countries",
  },
  {
    slug: "currency-code",
    label: "Currency code",
    status: "vocabulary",
    lede: "The issuing currency is named on the desk. No rate is stored here.",
    href: "/units",
  },
  {
    slug: "ticker",
    label: "Ticker",
    status: "empty",
    lede: "An exchange symbol needs a cited instrument. None is stored as a sample.",
    href: "/markets",
  },
];

export function vocabularyIdentifierCount() {
  return identifierKinds.filter((item) => item.status === "vocabulary").length;
}

export function registeredIdentifierCount() {
  return 0;
}
