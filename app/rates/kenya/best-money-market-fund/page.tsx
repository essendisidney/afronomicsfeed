import type { Metadata } from "next";
import { BASE, MmfMonthView, mmfMonthDescription, mmfMonthTitle } from "@/components/data/MmfMonthView";
import { mmfMonths } from "@/lib/data/mmf-months";
import { site } from "@/lib/site";

export const revalidate = 1800;

// The month in progress (or, before any reading this month, the latest month there is).
export function generateMetadata(): Metadata {
  const m = mmfMonths()[0];
  if (!m) return { title: "Best money market fund in Kenya" };
  return { title: mmfMonthTitle(m), description: mmfMonthDescription(m), alternates: { canonical: `${site.url}${BASE}` } };
}

export default function BestMoneyMarketFundPage() {
  const all = mmfMonths();
  const m = all[0];
  if (!m) return <p className="mx-auto max-w-3xl px-4 py-16 text-sm text-muted">No fund yields have been read yet.</p>;
  return <MmfMonthView m={m} all={all} />;
}
