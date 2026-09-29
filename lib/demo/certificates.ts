export type CertificateSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited authority document. No certificate is stored. */
export const certificateSlots: CertificateSlot[] = [
  {
    slug: "issue",
    label: "Issue",
    status: "empty",
    lede: "An issue needs a named authority. None is stored.",
    href: "/releases",
  },
  {
    slug: "scope",
    label: "Scope",
    status: "empty",
    lede: "A scope needs a cited note. None is attached.",
    href: "/footnotes",
  },
  {
    slug: "expiry",
    label: "Expiry",
    status: "empty",
    lede: "An expiry needs a period on the file. None is stored.",
    href: "/periods",
  },
];

export function storedCertificateCount() {
  return 0;
}
