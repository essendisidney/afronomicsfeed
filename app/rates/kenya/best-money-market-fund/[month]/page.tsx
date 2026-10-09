import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BASE, MmfMonthView, mmfMonthDescription, mmfMonthTitle } from "@/components/data/MmfMonthView";
import { mmfMonths } from "@/lib/data/mmf-months";
import { site } from "@/lib/site";

export const revalidate = 1800;

type Props = { params: Promise<{ month: string }> };

export function generateStaticParams() {
  return mmfMonths()
    .filter((m) => m.complete)
    .map((m) => ({ month: m.month }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month } = await params;
  const m = mmfMonths().find((x) => x.month === month && x.complete);
  if (!m) return {};
  return { title: mmfMonthTitle(m), description: mmfMonthDescription(m), alternates: { canonical: `${site.url}${BASE}/${m.month}` } };
}

/** A finished month's final ranking. The month in progress lives at the base address. */
export default async function MonthPage({ params }: Props) {
  const { month } = await params;
  const all = mmfMonths();
  const m = all.find((x) => x.month === month);
  if (!m) notFound();
  if (!m.complete) redirect(BASE);
  return <MmfMonthView m={m} all={all} />;
}
