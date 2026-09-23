export type PartnerSurface = {
  slug: string;
  label: string;
  kind: "sponsor" | "data" | "distribution" | "research";
  status: "empty" | "inquiry";
  lede: string;
};

/**
 * Partner / sponsor inventory stays visually and editorially separate.
 * Empty means no inventory is sold or displayed on the desk.
 */
export const partnerSurfaces: PartnerSurface[] = [
  {
    slug: "homepage-sponsor",
    label: "Homepage sponsor block",
    kind: "sponsor",
    status: "empty",
    lede: "No sponsor strip ships in this build. Editorial and paid stay separate.",
  },
  {
    slug: "brief-sponsor",
    label: "Brief underwriting",
    kind: "sponsor",
    status: "empty",
    lede: "Daily Brief is not underwritten. No invented badge.",
  },
  {
    slug: "data-licence-partner",
    label: "Data licence partner",
    kind: "data",
    status: "empty",
    lede: "Would sit next to /sources. No partner feed is wired.",
  },
  {
    slug: "terminal-distribution",
    label: "Terminal distribution",
    kind: "distribution",
    status: "empty",
    lede: "White-label distribution pairs with /licensing. Catalogue only.",
  },
  {
    slug: "research-co-brand",
    label: "Research co-brand",
    kind: "research",
    status: "empty",
    lede: "Co-branded memo would appear on /reports. None filed.",
  },
];

export function activePartnerCount() {
  return partnerSurfaces.filter((item) => item.status !== "empty").length;
}
