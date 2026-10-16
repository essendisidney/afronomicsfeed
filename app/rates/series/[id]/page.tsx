import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { ComparePicker } from "@/components/rates/ComparePicker";
import { FollowSheet } from "@/components/rates/FollowSheet";
import { FollowLink, HeadlineTile, defaultPartner } from "@/components/rates/SeriesBits";
import { SeriesChart, SeriesTable } from "@/components/rates/SeriesChart";
import { allSeries, getSeries } from "@/lib/data/rate-series";
import { MIN_SPARK_POINTS, formatValue, pointDate, rangeStart } from "@/lib/rate-series-core";
import { fitDescription, fitTitle } from "@/lib/seo";
import { site } from "@/lib/site";

export const revalidate = 1800;
export const dynamicParams = false;

export function generateStaticParams() {
  return allSeries().map((s) => ({ id: s.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const s = getSeries(id);
  if (!s) return {};
  const last = s.points.at(-1)!;
  return {
    title: fitTitle(`${s.label}: latest and history`),
    description: fitDescription(
      `${s.label}: ${formatValue(last.value, s.unit)} as of ${pointDate(last.date, s.frequency)}, from ${s.source.name}. The stored history, the change since the last print, and a one-tap comparison.`,
    ),
    alternates: { canonical: `${site.url}/rates/series/${s.id}` },
  };
}

export default async function SeriesPage({ params }: Props) {
  const { id } = await params;
  const s = getSeries(id);
  if (!s) notFound();
  const last = s.points.at(-1)!;
  const start = s.points.length > 3 ? rangeStart(last.date, s.frequency === "monthly" ? "5y" : "3y") : "0000-00-00";
  const partner = getSeries(defaultPartner(s.id));

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/numbers", label: "Rates & data" }, { href: s.href, label: s.group }, { label: s.short }]}
      kicker={`${s.group} · rate series`}
      title={s.label}
      lede={
        <p>
          The {s.measure}, from {s.source.name}. {s.points.length.toLocaleString("en-US")} stored {s.points.length === 1 ? "print" : "prints"} since{" "}
          {pointDate(s.points[0].date, s.frequency)}; every figure on this page is one of them. {s.note ?? ""}
        </p>
      }
      aside={<HeadlineTile series={s} kicker="Latest" />}
    >
      <section>
        <SectionTitle
          kicker="History"
          title={start === "0000-00-00" ? "Every stored print" : s.frequency === "monthly" ? "The last five years" : "The last three years"}
          note={`${s.unitLabel}. One point per ${s.frequency === "auction" ? "auction" : s.frequency === "monthly" ? "month" : s.frequency === "daily" ? "day read" : "stored reading"}.`}
        />
        <SeriesChart a={s} start={start} label={`${s.label} over time, ${s.unitLabel}`} />
        {s.points.length < MIN_SPARK_POINTS ? (
          <p className="mt-2 max-w-2xl text-[13px] leading-5 text-muted">
            Fewer than {MIN_SPARK_POINTS} prints are stored so far, so this series has no trend line in the tables yet. It builds as new figures are published.
          </p>
        ) : null}
      </section>

      <section className="mt-12">
        <SectionTitle kicker="Compare" title="Put another series beside it" note="Same units share one axis; different units get two. The pair goes in the address, so you can share it." />
        <div className="mt-4 max-w-3xl">
          <ComparePicker a={s} b={partner} />
        </div>
      </section>

      <section className="mt-12">
        <SectionTitle kicker="Figures" title="Latest prints" note="Newest first, as published." />
        <div className="mt-4 max-w-xl">
          <SeriesTable series={[s]} start="0000-00-00" limit={12} />
        </div>
      </section>

      <section id="follow" className="mt-12 max-w-xl scroll-mt-24 rounded-2xl border border-rule bg-surface px-5 py-5">
        <h2 className="font-serif text-xl text-ink">Follow this number</h2>
        <p className="mt-1 text-[14px] leading-6 text-ink-soft">
          One short email when a new {s.short} figure differs from the last one we told you about. Only an email address; confirm by email, stop with one click.
        </p>
        <div className="mt-3">
          <FollowLink
            series={s}
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-[14px] font-semibold text-paper hover:bg-forest"
          >
            Follow {s.short}
          </FollowLink>
        </div>
      </section>

      <p className="mt-10 max-w-3xl text-xs leading-5 text-muted">
        Source:{" "}
        {s.source.href.startsWith("/") ? (
          <Link href={s.source.href} className="underline underline-offset-2">
            {s.source.name}
          </Link>
        ) : (
          <a href={s.source.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            {s.source.name}
          </a>
        )}
        . Latest print {formatValue(last.value, s.unit)} on {pointDate(last.date, s.frequency)}. The full table is on{" "}
        <Link href={s.href} className="underline underline-offset-2">
          its data page
        </Link>
        . Information, not advice.
      </p>
      <FollowSheet />
    </PageShell>
  );
}
