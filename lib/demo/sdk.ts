export type SdkPackage = {
  slug: string;
  label: string;
  language: string;
  seat: "professional" | "enterprise";
  status: "catalogue" | "published";
  lede: string;
};

/** Client SDK catalogue. Nothing is published to a package registry from this build. */
export const sdkPackages: SdkPackage[] = [
  {
    slug: "typescript",
    label: "TypeScript client",
    language: "TypeScript",
    seat: "professional",
    status: "catalogue",
    lede: "Would wrap public GET routes. Package not published. Keys not issued.",
  },
  {
    slug: "python",
    label: "Python client",
    language: "Python",
    seat: "professional",
    status: "catalogue",
    lede: "Would mirror the TypeScript surface. PyPI slot empty.",
  },
  {
    slug: "excel-addin",
    label: "Excel add-in",
    language: "Office",
    seat: "enterprise",
    status: "catalogue",
    lede: "Would pull cited cells only. No invented tape in a sheet.",
  },
  {
    slug: "openapi",
    label: "OpenAPI description",
    language: "OpenAPI",
    seat: "professional",
    status: "catalogue",
    lede: "Would describe live routes. Spec file not minted yet — see /developers.",
  },
];

export function publishedSdkCount() {
  return sdkPackages.filter((item) => item.status === "published").length;
}
