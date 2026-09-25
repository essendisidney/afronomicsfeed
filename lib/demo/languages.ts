export type Edition = {
  slug: string;
  label: string;
  code: string;
  status: "live" | "empty";
  lede: string;
};

/** Publication languages. Empty means no edition exists. No invented translation. */
export const editions: Edition[] = [
  {
    slug: "english",
    label: "English",
    code: "en",
    status: "live",
    lede: "The desk publishes in English.",
  },
  {
    slug: "french",
    label: "French",
    code: "fr",
    status: "empty",
    lede: "No French edition. This slot does not invent a translation.",
  },
  {
    slug: "arabic",
    label: "Arabic",
    code: "ar",
    status: "empty",
    lede: "No Arabic edition.",
  },
  {
    slug: "portuguese",
    label: "Portuguese",
    code: "pt",
    status: "empty",
    lede: "No Portuguese edition.",
  },
  {
    slug: "swahili",
    label: "Swahili",
    code: "sw",
    status: "empty",
    lede: "No Swahili edition.",
  },
];

export function liveEditionCount() {
  return editions.filter((item) => item.status === "live").length;
}
