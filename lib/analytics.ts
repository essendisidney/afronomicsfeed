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
  "pack_open",
  "usage_view",
  "method_open",
  "source_open",
  "compare_open",
  "ingestion_view",
  "feed_open",
  "status_view",
] as const;

export type AnalyticsEvent = (typeof analyticsEvents)[number];
