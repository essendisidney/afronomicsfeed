import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { indicatorDefs } from "@/lib/data/indicators";
import { loadBonds } from "@/lib/data/kenya-bonds";
import { loadTbills } from "@/lib/data/kenya-tbills";
import { loadWire, publishersLive } from "@/lib/data/wire";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Advertise and sponsor — reach the people who move African capital",
  description:
    "Sponsor the Afronomics Weekly, the Kenya rates pages, country files and embeddable widgets. Founding-sponsor rates for banks, funds, fintechs and advisers.",
  alternates: { canonical: `${site.url}/advertise` },
};

const packages = [
  {
    name: "The Weekly",
    price: "$250",
    unit: "per edition",
    detail: "Presenting sponsor of the Monday edition on the site and in the newsletter: logo, one line and a link above the fold, marked as sponsored.",
  },
  {
    name: "Rates desk",
    price: "$400",
    unit: "per month",
    detail: "“Presented by” placement on the Kenya T-bill and Treasury bond pages — the most-cited Afronomics datasets — and on their free widgets wherever they are embedded.",
  },
  {
    name: "Country file",
    price: "$150",
    unit: "per country per month",
    detail: "Sole sponsor of one of the 54 country files: the page that people land on when they search a market. One sponsor per country.",
  },
  {
    name: "Research partner",
    price: "From $2,500",
    unit: "per report",
    detail: "A co-branded, sourced report on a market or sector, written by the desk and published on Afronomics with your name on it. Editorial control stays with us.",
  },
];

export default async function AdvertisePage() {
  const [wire] = await Promise.all([loadWire()]);
  const bills = loadTbills();
  const bonds = loadBonds();
  const stats = [
    { k: "Economies covered", v: "54" },
    { k: "Data series per country", v: String(indicatorDefs.length) },
    { k: "Publishers on the Wire", v: String(publishersLive(wire) || "—") },
    { k: "Kenya auction results tracked", v: (bills.rows.length + bonds.rows.length).toLocaleString("en-US") },
  ];

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
      <dl className="grid grid-cols-2 gap-px bg-rule lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.k} className="bg-paper-2 px-4 py-5">
            <dd className="font-serif text-3xl text-ink">{item.v}</dd>
            <dt className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{item.k}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-muted">Live figures from the site. Audience and newsletter numbers are shared with prospective sponsors on request.</p>

      <section className="mt-14">
        <SectionTitle kicker="Founding-sponsor rates" title="Placements" note="Rates hold for twelve months for sponsors who sign during launch. Invoiced in USD or KES." />
        <div className="mt-6 grid gap-px bg-rule md:grid-cols-2">
          {packages.map((item) => (
            <div key={item.name} className="bg-paper px-5 py-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">{item.name}</p>
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
