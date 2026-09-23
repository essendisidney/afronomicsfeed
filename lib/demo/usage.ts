import { currentSeat } from "@/lib/demo/entitlements";

export type UsageMeter = {
  id: string;
  label: string;
  unit: string;
  used: number;
  limit: number | null;
  note: string;
};

/** Always zero until Auth + billing meter a real seat. */
export function usageMeters(): UsageMeter[] {
  const seat = currentSeat();
  return [
    {
      id: "ask",
      label: "Ask queries",
      unit: "queries / month",
      used: 0,
      limit: seat.tier === "free" ? 0 : null,
      note: "Refuse-only on Free. Allowance not live.",
    },
    {
      id: "exports",
      label: "Exports",
      unit: "packages / month",
      used: 0,
      limit: seat.tier === "professional" || seat.tier === "enterprise" ? null : 0,
      note: "Professional seat required. No file minted.",
    },
    {
      id: "api",
      label: "API calls",
      unit: "calls / month",
      used: 0,
      limit: 0,
      note: "Keys are not issued.",
    },
    {
      id: "watches",
      label: "Saved watches",
      unit: "items",
      used: 0,
      limit: seat.tier === "free" ? 0 : null,
      note: "Auth required. Store empty.",
    },
  ];
}

export function issuedKeys() {
  return [] as { id: string; label: string; createdAt: string }[];
}
