export type PeerSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A comparison set. No peer is stored. */
export const peerSlots: PeerSlot[] = [
  {
    slug: "country",
    label: "Country",
    status: "empty",
    lede: "A country peer needs two named files and a shared series. None is stored.",
    href: "/countries",
  },
  {
    slug: "corridor",
    label: "Corridor",
    status: "empty",
    lede: "A corridor peer needs two routes and a shared unit. This page does not invent one.",
    href: "/corridors",
  },
  {
    slug: "series",
    label: "Series",
    status: "empty",
    lede: "A series peer needs two stored series. None is attached.",
    href: "/series",
  },
];

export function storedPeerCount() {
  return 0;
}
