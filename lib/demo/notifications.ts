export type NotificationChannel = {
  id: string;
  label: string;
  status: "available" | "offline";
  note: string;
};

export type NotificationPref = {
  slug: string;
  label: string;
  channelIds: string[];
  lede: string;
};

/** Channels and prefs. Nothing is delivered. */
export const notificationChannels: NotificationChannel[] = [
  {
    id: "email",
    label: "Email",
    status: "offline",
    note: "SMTP not configured. Alerts stay undelivered.",
  },
  {
    id: "in-app",
    label: "In-app",
    status: "offline",
    note: "Requires a signed-in seat. Session store empty.",
  },
  {
    id: "webhook",
    label: "Webhook",
    status: "offline",
    note: "Enterprise feed channel. Keys not issued.",
  },
];

export const notificationPrefs: NotificationPref[] = [
  {
    slug: "policy-print",
    label: "Policy prints",
    channelIds: ["email", "in-app"],
    lede: "Central-bank or treasury notice stored — not a model guess.",
  },
  {
    slug: "pack-ready",
    label: "Briefing pack ready",
    channelIds: ["email"],
    lede: "Morning or weekly pack assembled. Queue not live.",
  },
  {
    slug: "export-ready",
    label: "Export ready",
    channelIds: ["email", "in-app"],
    lede: "Professional extract minted. Mint is offline.",
  },
  {
    slug: "feed-event",
    label: "Feed event",
    channelIds: ["webhook"],
    lede: "Licensed signal or graph edge push.",
  },
];

export function enabledPrefs() {
  return [] as { id: string; prefSlug: string; channelId: string }[];
}
