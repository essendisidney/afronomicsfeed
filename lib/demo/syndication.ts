export type SyndicationChannel = {
  slug: string;
  label: string;
  kind: "rss" | "sitemap" | "json" | "status";
  status: "published" | "catalogue";
  lede: string;
  href: string;
};

/** Public machine-readable doors. No subscriber counts or synthetic uptime. */
export const syndicationChannels: SyndicationChannel[] = [
  {
    slug: "rss",
    label: "Free teaser RSS",
    kind: "rss",
    status: "published",
    lede: "Kenya desk teasers only. Full-text and licensed streams stay off this channel.",
    href: "/rss.xml",
  },
  {
    slug: "sitemap",
    label: "Sitemap",
    kind: "sitemap",
    status: "published",
    lede: "Public URL index. No audience or crawl-volume figure.",
    href: "/sitemap.xml",
  },
  {
    slug: "status",
    label: "Status board",
    kind: "status",
    status: "published",
    lede: "Live, scaffold, and offline labels. Uptime is not invented here.",
    href: "/status",
  },
  {
    slug: "licensed-feeds",
    label: "Licensed feeds",
    kind: "json",
    status: "catalogue",
    lede: "Professional and enterprise shapes. Nothing is delivered without a licence.",
    href: "/feeds",
  },
];

export function publishedChannelCount() {
  return syndicationChannels.filter((item) => item.status === "published").length;
}
