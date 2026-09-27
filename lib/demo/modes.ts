export type TransportMode = {
  slug: string;
  label: string;
  status: "vocabulary";
  lede: string;
  href: string;
};

/** Mode words the corridor files already use. No tonnage is stored. */
export const transportModes: TransportMode[] = [
  {
    slug: "port",
    label: "Port",
    status: "vocabulary",
    lede: "A gateway is named on the port file. This page stores no throughput.",
    href: "/trade/ports",
  },
  {
    slug: "road",
    label: "Road",
    status: "vocabulary",
    lede: "A road span is named on the corridor. No freight volume is attached.",
    href: "/corridors",
  },
  {
    slug: "rail",
    label: "Rail",
    status: "vocabulary",
    lede: "A rail span is named where the desk already uses one. Tonnage stays blank.",
    href: "/corridors",
  },
];

export function vocabularyModeCount() {
  return transportModes.length;
}

export function storedModeCount() {
  return 0;
}
