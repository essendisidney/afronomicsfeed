import { ogContentType, ogImage, ogSize } from "@/lib/og-image";
import { site } from "@/lib/site";

export const alt = site.name;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    kicker: "Africa’s Economic Intelligence Layer",
    title: site.tagline,
  });
}
