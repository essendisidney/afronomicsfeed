export type ManifestSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited list of cargo. No manifest is stored. */
export const manifestSlots: ManifestSlot[] = [
  {
    slug: "cargo",
    label: "Cargo",
    status: "empty",
    lede: "A cargo manifest needs a cited list. None is stored.",
    href: "/trade",
  },
  {
    slug: "vessel",
    label: "Vessel",
    status: "empty",
    lede: "A vessel manifest needs a publisher. This page does not invent one.",
    href: "/modes",
  },
  {
    slug: "rail",
    label: "Rail",
    status: "empty",
    lede: "A rail manifest needs a source. None is attached.",
    href: "/corridors",
  },
];

export function storedManifestCount() {
  return 0;
}
