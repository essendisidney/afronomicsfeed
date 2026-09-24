import { countries, type CountryProfile } from "@/lib/demo/countries";
import { graphDesks } from "@/lib/demo/graph";

export type RegionHub = {
  slug: string;
  label: CountryProfile["region"];
  lede: string;
  countrySlugs: string[];
  deskSlugs: string[];
};

const regionOrder: CountryProfile["region"][] = [
  "East Africa",
  "West Africa",
  "Southern Africa",
  "North Africa",
  "Central Africa",
];

/** Regional hubs. Desk lists are editorial scaffolds — not live GIS coverage. */
export function regionHubs(): RegionHub[] {
  const deskSlugs = new Set<string>(graphDesks.map((desk) => desk.slug));
  return regionOrder.map((label) => {
    const countrySlugs = countries.filter((c) => c.region === label).map((c) => c.slug);
    return {
      slug: label.toLowerCase().replace(/\s+/g, "-"),
      label,
      lede: `${countrySlugs.length} country terminals. Graph desks open only where editorial edges exist.`,
      countrySlugs,
      deskSlugs: countrySlugs.filter((slug) => deskSlugs.has(slug)),
    };
  });
}

export function getRegionHub(slug: string) {
  return regionHubs().find((hub) => hub.slug === slug);
}
