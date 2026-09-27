export type ClassificationKind = {
  slug: string;
  label: string;
  status: "vocabulary";
  lede: string;
  href: string;
};

/** Names for how the desk already groups files. No code table is stored. */
export const classificationKinds: ClassificationKind[] = [
  {
    slug: "industry",
    label: "Industry",
    status: "vocabulary",
    lede: "Sector tags live on the industry files. This page stores no code.",
    href: "/industries",
  },
  {
    slug: "region",
    label: "Region",
    status: "vocabulary",
    lede: "Region files are the door. No statistical code is attached.",
    href: "/regions",
  },
  {
    slug: "corridor",
    label: "Corridor",
    status: "vocabulary",
    lede: "Named routes are listed on the corridor catalogue. No freight code is stored.",
    href: "/corridors",
  },
];

export function vocabularyClassificationCount() {
  return classificationKinds.length;
}

export function codedClassificationCount() {
  return 0;
}
