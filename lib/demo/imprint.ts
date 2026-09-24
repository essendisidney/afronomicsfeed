export type ImprintField = {
  slug: string;
  label: string;
  status: "live" | "draft" | "empty";
  value: string;
  href?: string;
};

/** Legal imprint / publisher notice. Empty fields stay empty until counsel fills them. */
export const imprintFields: ImprintField[] = [
  {
    slug: "product",
    label: "Product",
    status: "live",
    value: "Afronomics Feed",
    href: "/about",
  },
  {
    slug: "house",
    label: "Publisher",
    status: "live",
    value: "A product of Pesara",
    href: "/credits",
  },
  {
    slug: "site",
    label: "Public site",
    status: "live",
    value: "afronomicsfeed.com",
    href: "/",
  },
  {
    slug: "contact",
    label: "Contact",
    status: "draft",
    value: "See contact doors. No general inbox published yet.",
    href: "/contact",
  },
  {
    slug: "registered-address",
    label: "Registered address",
    status: "empty",
    value: "Not published. Counsel will supply.",
  },
  {
    slug: "registration",
    label: "Company registration",
    status: "empty",
    value: "Not published. Counsel will supply.",
  },
];

export function filledImprintCount() {
  return imprintFields.filter((item) => item.status !== "empty").length;
}
