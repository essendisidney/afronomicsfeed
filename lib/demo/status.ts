export type DataStatus = "demo" | "methodology" | "primary_pending";

export const DEMO_AS_OF = "2026-09-10T08:00:00+03:00";

export function statusLabel(status: DataStatus) {
  if (status === "methodology") return "Methodology under development";
  if (status === "primary_pending") return "Awaiting primary source";
  return "Demo data";
}
