import { site } from "@/lib/site";

export type SocialChannel = {
  id: string;
  label: string;
  status: "linked" | "pending" | "offline";
  href: string | null;
  note: string;
};

/** Social doors. LinkedIn interconnects via company URL + share intents. */
export function socialChannels(): SocialChannel[] {
  const linkedin = site.linkedinUrl.trim();
  return [
    {
      id: "linkedin-company",
      label: "LinkedIn company page",
      status: linkedin ? "linked" : "pending",
      href: linkedin || null,
      note: linkedin
        ? "Company page is linked from the social desk."
        : "Set site.linkedinUrl in lib/site.ts to your company page URL.",
    },
    {
      id: "linkedin-share",
      label: "LinkedIn share intents",
      status: "linked",
      href: null,
      note: "Share opens LinkedIn with the page URL. No invented likes or impressions.",
    },
    {
      id: "og-cards",
      label: "Open Graph cards",
      status: "pending",
      href: "/press",
      note: "Article OG tags ship. Homepage card can be tightened when press assets land.",
    },
  ];
}

export function linkedInShareUrl(pageUrl: string) {
  const u = new URL("https://www.linkedin.com/sharing/share-offsite/");
  u.searchParams.set("url", pageUrl);
  return u.toString();
}

export function postedSocialItems() {
  return [] as { id: string; channelId: string; at: string; href: string }[];
}
