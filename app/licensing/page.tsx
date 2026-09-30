import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { indicatorDefs } from "@/lib/data/indicators";
import { loadBonds } from "@/lib/data/kenya-bonds";
import { loadTbills } from "@/lib/data/kenya-tbills";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Data licensing and API — Kenya auctions, African FX and the Wire",
  description:
    "License Afronomics datasets for your products and models: every Kenya T-bill and Treasury bond auction, the African FX archive, the Wire headline archive and 22 series for 54 economies.",
  alternates: { canonical: `${site.url}/licensing` },
};

const year = (date?: string) => date?.slice(0, 4) ?? "—";

const tiers = [
  {
    name: "Open",
    price: "Free",
    detail: "CSV downloads from every dataset page for research, teaching and journalism, with the attribution line kept.",
  },
  {
    name: "Startup",
    price: "$99/mo",
    detail: "Commercial use inside one product: JSON feed of the Kenya auction datasets and the FX archive, refreshed as each notice is published.",
  },
  {
    name: "Institution",
    price: "$499/mo",
    detail: "All datasets and the Wire archive for internal models, dashboards and client reports, with full history and change notifications.",
  },
  {
    name: "Enterprise",
    price: "Custom",
    detail: "Redistribution rights, white-label widgets, new datasets built to your spec and a named contact on the desk.",
  },
];

export default function LicensingPage() {
  const bills = loadTbills();
  const bonds = loadBonds();
  const datasets = [
    {
      name: "Kenya Treasury bill auctions",
      href: "/markets/kenya-tbills",
      coverage: `${year(bills.rows.at(-1)?.value_date)}–present · ${bills.rows.length.toLocaleString("en-US")} results`,
      detail: "Rates, amounts offered, bids received, accepted, competitive and non-competitive, price per 100 — by tenor, every auction.",
    },
    {
      name: "Kenya Treasury bond auctions",
      href: "/markets/kenya-bonds",
      coverage: bonds.rows.length ? `${year(bonds.rows.at(-1)?.value_date)}–present · ${bonds.rows.length.toLocaleString("en-US")} results` : "Building",
      detail: "Every primary issue, re-opening, tap and switch: rates, coupons, maturities, bids and acceptances, with the auction yield curve.",
    },
    {
      name: "African FX reference archive",
      href: "/markets",
      coverage: "Daily from 30 Sep 2026 · 45 currencies",
      detail: "The daily US-dollar mid-market reference for every African currency, archived at the same hour each day.",
    },
    {
      name: "The Wire archive",
      href: "/news",
      coverage: "Daily from 30 Sep 2026",
      detail: "Every headline carried from African business publishers, tagged by country and desk — a ready-made corpus for monitoring and NLP.",
    },
    {
      name: "54-economy panel",
      href: "/data",
      coverage: `2010–present · ${indicatorDefs.length} series`,
      detail: "Growth, prices, debt, reserves, capital flows, trade, connectivity and energy for all 54 economies, normalised from World Bank Open Data.",
    },
  ];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/data", label: "Data" }, { label: "Licensing" }]}
      kicker="Data licensing"
      title="Africa’s market data, clean and sourced"
      lede={
        <p>
          Datasets compiled from primary publications — central-bank notices, official registers, publisher feeds — checked, structured and kept
          current. Every row carries the link to the document it came from.
        </p>
      }
    >
      <SectionTitle kicker="Datasets" title="What you can license" />
      <div className="overflow-x-auto">
        <table className="data-table mt-2">
          <thead>
            <tr>
              <th>Dataset</th>
              <th>Coverage</th>
              <th>Contents</th>
            </tr>
          </thead>
          <tbody>
            {datasets.map((item) => (
              <tr key={item.name}>
                <td className="whitespace-nowrap">
                  <Link href={item.href} className="hover:text-forest">
                    {item.name}
                  </Link>
                </td>
                <td className="whitespace-nowrap font-mono text-[11px]">{item.coverage}</td>
                <td className="text-sm text-ink-soft">{item.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-14">
        <SectionTitle kicker="Terms" title="Licences" note="Annual billing takes two months off. Invoiced in USD or KES." />
        <div className="mt-6 grid gap-px bg-rule md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <div key={tier.name} className="bg-paper px-5 py-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">{tier.name}</p>
              <p className="mt-2 font-serif text-3xl text-ink">{tier.price}</p>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{tier.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionTitle kicker="Try it" title="Free samples" />
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a className="text-forest underline" href="/api/data/kenya-tbills" download>
                Kenya T-bill auctions (CSV)
              </a>
            </li>
            <li>
              <a className="text-forest underline" href="/api/data/kenya-bonds" download>
                Kenya Treasury bond auctions (CSV)
              </a>
            </li>
            <li>
              <a className="text-forest underline" href="/api/data/gdp" download>
                GDP, 54 economies (CSV)
              </a>
            </li>
            <li>
              <Link className="text-forest underline" href="/widgets">
                Embeddable widgets
              </Link>
            </li>
          </ul>
        </div>
        <div className="lg:col-span-7" id="enquiry">
          <SectionTitle kicker="Licence" title="Request a licence or a trial feed" />
          <div className="mt-4">
            <EnquiryForm interest="licensing" cta="Request licence" />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
