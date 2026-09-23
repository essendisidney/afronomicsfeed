export type BriefingPack = {
  slug: string;
  title: string;
  cadence: "morning" | "weekly" | "event" | "desk";
  seat: "free" | "pro" | "professional";
  status: "empty" | "teaser";
  lede: string;
  hrefs: string[];
};

/** Packaged briefing shapes. Contents stay empty until editorial files are tagged. */
export const briefingPacks: BriefingPack[] = [
  {
    slug: "kenya-morning",
    title: "Kenya morning pack",
    cadence: "morning",
    seat: "pro",
    status: "teaser",
    lede: "MPC, FX window, issuer notices. Pulls from the morning file — not a live wire.",
    hrefs: ["/today", "/countries/kenya", "/graph/kenya"],
  },
  {
    slug: "featured-desks",
    title: "Featured desks digest",
    cadence: "weekly",
    seat: "pro",
    status: "empty",
    lede: "KE · NG · ZA · EG · GH · RW. Empty until each desk has a cited change.",
    hrefs: ["/graph", "/countries", "/weekly"],
  },
  {
    slug: "capital-climate",
    title: "Capital + climate cross-read",
    cadence: "weekly",
    seat: "professional",
    status: "empty",
    lede: "Book and project lens together. No invented facilities.",
    hrefs: ["/capital", "/climate", "/projects"],
  },
  {
    slug: "signal-week",
    title: "Signal week",
    cadence: "weekly",
    seat: "pro",
    status: "empty",
    lede: "Published signals with fact / interpretation separation.",
    hrefs: ["/signals", "/opinion"],
  },
  {
    slug: "export-ready",
    title: "Export-ready country shell",
    cadence: "desk",
    seat: "professional",
    status: "empty",
    lede: "Matches the country-shell CSV package. Download not issued.",
    hrefs: ["/exports", "/account"],
  },
];

export function getBriefingPack(slug: string) {
  return briefingPacks.find((item) => item.slug === slug);
}

export function deliveredPacks() {
  return [] as { id: string; packSlug: string; deliveredAt: string }[];
}
