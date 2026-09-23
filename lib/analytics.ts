/** North-star event names. Wire a collector later — do not invent dashboards. */
export const analyticsEvents = [
  "brief_open",
  "country_view",
  "signal_open",
  "search",
  "ask_query",
  "watchlist_add",
  "pro_cta",
  "export_csv",
] as const;

export type AnalyticsEvent = (typeof analyticsEvents)[number];
