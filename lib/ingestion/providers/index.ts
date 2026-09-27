/** Source adapters. World Bank is read by the prints agent. The others are not connected. */
export const intendedProviders = [
  "world-bank",
  "imf",
  "afdb",
  "central-banks",
  "national-statistics",
  "exchanges",
  "government-gazettes",
] as const;
