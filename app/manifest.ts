import type { MetadataRoute } from "next";

/** Installable web app: home-screen icon, full-screen launch, shortcuts to the most used pages. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Afronomics — Africa’s markets, sourced",
    short_name: "Afronomics",
    description:
      "African government auction rates, currencies, DFI pipelines and headlines for 54 economies — every figure linked to its source.",
    start_url: "/?source=app",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#16263f",
    theme_color: "#16263f",
    categories: ["finance", "news", "business"],
    lang: "en",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "T-bill monitor", short_name: "T-bills", url: "/markets/tbills?source=app", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "The Wire", short_name: "Wire", url: "/news?source=app", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "The Weekly", short_name: "Weekly", url: "/weekly?source=app", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Currencies", short_name: "FX", url: "/markets?source=app", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
