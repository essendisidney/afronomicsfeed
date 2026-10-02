import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { CopyCitation } from "@/components/ui/CopyCitation";
import { ShareRow } from "@/components/ui/ShareRow";
import { renderTime } from "@/lib/data/fetcher";
import { buildRadio } from "@/lib/editions/radio";
import { site } from "@/lib/site";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "The radio bulletin — the price of money this week, in sixty seconds, English and Kiswahili",
  description:
    "A sixty-second script on Treasury bill rates, the shilling and the African index, written for presenters to read on air. English and Kiswahili, free for any station, from the central banks' own figures. Kenya, Tanzania and Uganda.",
  alternates: { canonical: `${site.url}/radio` },
};

export default async function RadioPage({ searchParams }: { searchParams: Promise<{ market?: string }> }) {
  const { market } = await searchParams;
  const home = (["kenya", "tanzania", "uganda"] as const).find((m) => m === market) ?? "kenya";
  const r = await buildRadio(renderTime(), home);
  const en = r.en.join("\n\n");
  const sw = r.sw.join("\n\n");
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Radio bulletin" }]}
      kicker={`The price of money · ${r.market.country} · week of ${r.weekOf}`}
      title="Sixty seconds on the price of money, ready to read on air"
      lede={
        <p>
          For any station, free: what the government paid to borrow this week, what that means for a listener’s savings, where the currency is, and
          the African average. Written by the same engine that compiles the data, from the central banks’ own figures, in English and Kiswahili.
          About {r.seconds} seconds at a presenter’s pace.
        </p>
      }
      aside={
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5 text-sm text-ink-soft">
          <p className="text-[14px] font-semibold text-ink">Use it on air</p>
          <p className="mt-1 leading-6">Read it as is or in your own words; keep “from Afronomics” once. New every Friday; the numbers update as results land. Stations that run it weekly can have it by WhatsApp or email: {site.contactEmail}.</p>
          <p className="mt-3 text-[13px]">
            {(["kenya", "tanzania", "uganda"] as const).map((m, i) => (
              <span key={m}>
                {i ? " · " : ""}
                <Link href={`/radio?market=${m}`} className={`underline underline-offset-2 ${m === home ? "font-semibold text-ink" : ""}`}>
                  {m[0].toUpperCase() + m.slice(1)}
                </Link>
              </span>
            ))}
          </p>
        </div>
      }
    >
      <section>
        <SectionTitle kicker="English" title="Script" />
        <div className="mt-3 rounded-2xl border border-rule bg-surface px-5 py-5 text-[17px] leading-8 text-ink">
          {r.en.map((p) => (
            <p key={p} className="mb-3 last:mb-0">
              {p}
            </p>
          ))}
        </div>
        <div className="mt-3 flex gap-3">
          <CopyCitation text={en} />
          <a href={`/api/edition/radio?market=${home}&lang=en`} className="rounded-full border border-rule px-3 py-1.5 text-[13px] font-medium text-ink-soft hover:border-accent">
            Plain text
          </a>
        </div>
      </section>
      <section className="mt-12">
        <SectionTitle kicker="Kiswahili" title="Maandishi" />
        <div className="mt-3 rounded-2xl border border-rule bg-surface px-5 py-5 text-[17px] leading-8 text-ink">
          {r.sw.map((p) => (
            <p key={p} className="mb-3 last:mb-0">
              {p}
            </p>
          ))}
        </div>
        <div className="mt-3 flex gap-3">
          <CopyCitation text={sw} />
          <a href={`/api/edition/radio?market=${home}&lang=sw`} className="rounded-full border border-rule px-3 py-1.5 text-[13px] font-medium text-ink-soft hover:border-accent">
            Maandishi tupu
          </a>
        </div>
      </section>
      <ShareRow text={`The price of money in ${r.market.country} this week, in 60 seconds — free for any station`} path={`/radio?market=${home}`} label="Send to a station" />
    </PageShell>
  );
}
