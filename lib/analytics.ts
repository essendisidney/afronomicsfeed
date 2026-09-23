/** North-star event names. Wire a collector later — do not invent dashboards. */
export const analyticsEvents = [
  "brief_open",
  "country_view",
  "signal_open",
  "search",
  "ask_query",
  "watchlist_add",
  "alert_subscribe",
  "pro_cta",
  "export_csv",
  "graph_open",
] as const;

export type AnalyticsEvent = (typeof analyticsEvents)[number];
