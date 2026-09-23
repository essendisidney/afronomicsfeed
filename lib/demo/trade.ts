export const corridors = [
  {
    slug: "northern-corridor",
    name: "Northern Corridor",
    geography: "Mombasa — Nairobi — Kampala — Kigali — Bujumbura / South Sudan",
    modes: ["Port", "Road", "Rail", "Border posts"],
    countrySlugs: ["kenya", "uganda", "rwanda", "burundi", "south-sudan"],
    note: "Volumes, dwell times and disruption series are not connected.",
  },
  {
    slug: "central-corridor",
    name: "Central Corridor",
    geography: "Dar es Salaam — Dodoma — Kigali / Bujumbura / DRC",
    modes: ["Port", "Rail", "Road"],
    countrySlugs: ["tanzania", "rwanda", "burundi", "dr-congo"],
    note: "Awaiting licensed logistics and customs prints.",
  },
  {
    slug: "lobito-corridor",
    name: "Lobito Corridor",
    geography: "Lobito — DRC Copperbelt — Zambia",
    modes: ["Port", "Rail"],
    countrySlugs: ["angola", "dr-congo", "zambia"],
    note: "Project and throughput figures stay blank until sourced.",
  },
  {
    slug: "maputo-corridor",
    name: "Maputo Corridor",
    geography: "Maputo — Mpumalanga — Gauteng",
    modes: ["Port", "Road", "Rail"],
    countrySlugs: ["mozambique", "south-africa"],
    note: "No invented trade volumes.",
  },
] as const;

export type Port = {
  slug: string;
  name: string;
  countrySlug: string;
  waters: string;
  corridorSlug?: string;
};

export const ports: Port[] = [
  { slug: "mombasa", name: "Mombasa", countrySlug: "kenya", waters: "Indian Ocean", corridorSlug: "northern-corridor" },
  { slug: "dar-es-salaam", name: "Dar es Salaam", countrySlug: "tanzania", waters: "Indian Ocean", corridorSlug: "central-corridor" },
  { slug: "lobito", name: "Lobito", countrySlug: "angola", waters: "Atlantic", corridorSlug: "lobito-corridor" },
  { slug: "maputo", name: "Maputo", countrySlug: "mozambique", waters: "Indian Ocean", corridorSlug: "maputo-corridor" },
  { slug: "durban", name: "Durban", countrySlug: "south-africa", waters: "Indian Ocean", corridorSlug: "maputo-corridor" },
  { slug: "cape-town", name: "Cape Town", countrySlug: "south-africa", waters: "Atlantic" },
  { slug: "lagos", name: "Lagos (Apapa / Tin Can)", countrySlug: "nigeria", waters: "Atlantic" },
  { slug: "tema", name: "Tema", countrySlug: "ghana", waters: "Atlantic" },
  { slug: "alexandria", name: "Alexandria", countrySlug: "egypt", waters: "Mediterranean" },
  { slug: "port-said", name: "Port Said", countrySlug: "egypt", waters: "Mediterranean / Suez" },
  { slug: "djibouti", name: "Djibouti", countrySlug: "djibouti", waters: "Red Sea / Gulf of Aden" },
  { slug: "abidjan", name: "Abidjan", countrySlug: "cote-divoire", waters: "Atlantic" },
  { slug: "dakar", name: "Dakar", countrySlug: "senegal", waters: "Atlantic" },
  { slug: "lome", name: "Lomé", countrySlug: "togo", waters: "Atlantic" },
  { slug: "walvis-bay", name: "Walvis Bay", countrySlug: "namibia", waters: "Atlantic" },
  { slug: "beira", name: "Beira", countrySlug: "mozambique", waters: "Indian Ocean" },
];

export const tradeRegimes = [
  {
    slug: "afcfta",
    name: "AfCFTA",
    lede: "Protocols and national gazettes stay blank until a cited instrument exists. Not a modelled tariff book.",
  },
] as const;

export function getCorridor(slug: string) {
  return corridors.find((item) => item.slug === slug);
}

export function getPort(slug: string) {
  return ports.find((item) => item.slug === slug);
}

export function getTradeRegime(slug: string) {
  return tradeRegimes.find((item) => item.slug === slug);
}

export function corridorCountryHref(corridorSlug: string, countrySlug: string) {
  return `/trade/${corridorSlug}/${countrySlug}`;
}

export function portFileHref(slug: string) {
  return `/trade/ports/${slug}`;
}

export function corridorCountryParams() {
  return corridors.flatMap((corridor) => corridor.countrySlugs.map((country) => ({ slug: corridor.slug, country })));
}

export function portsForCountry(countrySlug: string) {
  return ports.filter((item) => item.countrySlug === countrySlug);
}

export function portsForCorridor(corridorSlug: string) {
  return ports.filter((item) => item.corridorSlug === corridorSlug);
}

export function corridorsForCountry(countrySlug: string) {
  return corridors.filter((corridor) => (corridor.countrySlugs as readonly string[]).includes(countrySlug));
}
