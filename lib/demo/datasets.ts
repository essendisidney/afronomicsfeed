export const datasets = [
  {
    slug: "chart-of-the-day",
    name: "Chart of the Day",
    lede: "A single cited series, or nothing. Share, embed and CSV attach only after the observation is stored.",
  },
  {
    slug: "number-of-the-day",
    name: "Number of the Day",
    lede: "One print with a source URL, publication date and observation date. No modelled headline figure.",
  },
  {
    slug: "africa-in-5-charts",
    name: "Africa in 5 Charts",
    lede: "Five sourced series, not a collage of estimates. Slots stay blank until each chart has a citation.",
  },
  {
    slug: "pulse-methodology",
    name: "Afronomics Pulse methodology",
    lede: "The score is not in production. This file holds the shape of Pulse until a primary series is stored.",
  },
  {
    slug: "observation-catalog",
    name: "Observation catalog",
    lede: "The desk index of stored prints. Empty until an append-only observation lands.",
  },
] as const;

export function getDataset(slug: string) {
  return datasets.find((item) => item.slug === slug);
}

export function datasetFileHref(slug: string) {
  return `/data/${slug}`;
}
