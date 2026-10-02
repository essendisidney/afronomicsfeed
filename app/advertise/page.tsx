import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { indicatorDefs } from "@/lib/data/indicators";
import { loadBonds } from "@/lib/data/kenya-bonds";
import { loadTbills } from "@/lib/data/kenya-tbills";
import { loadWire, publishersLive } from "@/lib/data/wire";
import { aboutText, priceText, rateCard } from "@/lib/billing/ratecard";
import { site } from "@/lib/site";
import { rpcRead } from "@/lib/store";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Advertise and sponsor — reach the people who move African capital",
  description:
    "Sponsor the Afronomics Weekly, the Kenya rates pages, country files and embeddable widgets. Founding-sponsor rates for banks, funds, fintechs and advisers.",
  alternates: { canonical: `${site.url}/advertise` },
};

const packages = rateCard.find((g) => g.id === "sponsors")!.items.map((i) => ({
  name: i.name,
  price: priceText(i),
  unit: `${i.unit}${aboutText(i) ? ` · ${aboutText(i)}` : ""}`,
  detail: `${i.what}${i.launch ? ` Launch: ${i.launch}.` : ""}`,
}));

export default async function AdvertisePage() {
  const [wire, traffic] = await Promise.all([loadWire(), rpcRead("af_traffic", { p_days: 30 }, 3600)]);
  const t = traffic.ok && Array.isArray(traffic.value) ? (traffic.value[0] as { views: number; countries: number } | undefined) : undefined;
  const views30 = Number(t?.views ?? 0);
  const bills = loadTbills();
  const bonds = loadBonds();
  const stats = [
    { k: "Economies covered", v: "54" },
    { k: "Data series per country", v: String(indicatorDefs.length) },
    { k: "Publishers on the Wire", v: String(publishersLive(wire) || "—") },
    { k: "Kenya auction results tracked", v: (bills.rows.length + bonds.rows.length).toLocaleString("en-US") },
  ];
  // Audience figures appear once there is a month of meaningful traffic to show.
  if (views30 >= 1000) {
    stats.push({ k: "Page views, last 30 days", v: views30.toLocaleString("en-US") });
    stats.push({ k: "Countries reading", v: String(t?.countries ?? "—") });
  }

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Advertise" }]}
      kicker="Sponsorship"
      title="Reach the people who move African capital"
      lede={
        <p>
          Afronomics is read by treasurers, fund managers, DFI officers, founders and journalists who need the number behind the story. Sponsors
          sit next to that number — clearly labelled, never inside the data.
        </p>
      }
    >
      <dl className="grid grid-cols-2 gap-px bg-rule lg:grid-cols-3">
        {stats.map((item) => (
          <div key={item.k} className="bg-paper-2 px-4 py-5">
            <dd className="font-serif text-3xl text-ink">{item.v}</dd>
            <dt className="mt-1 font-medium text-[12px] text-muted">{item.k}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-muted">Live figures from the site. Audience and newsletter numbers are shared with prospective sponsors on request.</p>

      <section className="mt-14">
        <SectionTitle kicker="Founding-sponsor rates" title="Placements" note="Rates hold for twelve months for sponsors who sign during launch. Invoiced in KES or USD; the full price guide is at /prices." />
        <div className="mt-6 grid gap-px bg-rule md:grid-cols-2">
          {packages.map((item) => (
            <div key={item.name} className="bg-paper px-5 py-6">
              <p className="text-[12px] font-semibold text-gold">{item.name}</p>
              <p className="mt-2 font-serif text-3xl text-ink">
                {item.price} <span className="text-base text-muted">{item.unit}</span>
              </p>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionTitle kicker="Standards" title="What sponsors get, and don’t" />
          <ul className="mt-4 space-y-3 text-sm leading-6 text-ink-soft">
            <li>Every placement is marked “Sponsored” or “Presented by”.</li>
            <li>No sponsor sees, edits or orders the data, rankings or headlines. Figures come from the publishers that print them.</li>
            <li>No tracking pixels or third-party ad networks. Reporting is by clicks on your link.</li>
            <li>
              Read the <Link href="/method" className="text-forest underline">sources and method</Link> behind every page.
            </li>
          </ul>
        </div>
        <div className="lg:col-span-7" id="enquiry">
          <SectionTitle kicker="Book" title="Ask for the media kit" />
          <div className="mt-4">
            <EnquiryForm interest="sponsorship" cta="Request media kit" />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
