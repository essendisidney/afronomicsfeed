export type IntegrationChannel = {
  slug: string;
  label: string;
  kind: "slack" | "teams" | "email" | "zapier" | "custom";
  seat: "professional" | "enterprise";
  status: "catalogue" | "connected";
  lede: string;
};

/** Delivery integrations. Nothing is connected without a live key and licence. */
export const integrationChannels: IntegrationChannel[] = [
  {
    slug: "slack-signals",
    label: "Slack · signals",
    kind: "slack",
    seat: "enterprise",
    status: "catalogue",
    lede: "Would post cited signal opens to a workspace channel. Bot not armed.",
  },
  {
    slug: "teams-brief",
    label: "Teams · morning brief",
    kind: "teams",
    seat: "enterprise",
    status: "catalogue",
    lede: "Would push the morning file card. Connector offline.",
  },
  {
    slug: "email-digest",
    label: "Email digest",
    kind: "email",
    seat: "professional",
    status: "catalogue",
    lede: "Scheduled digest shape. No inbox is filled from this build.",
  },
  {
    slug: "zapier-hooks",
    label: "Zapier / Make",
    kind: "zapier",
    seat: "enterprise",
    status: "catalogue",
    lede: "Would mirror webhook catalogue events. No Zap runs here.",
  },
  {
    slug: "custom-s2s",
    label: "Custom S2S",
    kind: "custom",
    seat: "enterprise",
    status: "catalogue",
    lede: "Bilateral push after licence. See webhooks for event shapes.",
  },
];

export function connectedIntegrations() {
  return integrationChannels.filter((item) => item.status === "connected");
}
