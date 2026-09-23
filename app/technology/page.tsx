import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { startupSlots, techLenses } from "@/lib/demo/tech";

export const metadata: Metadata = {
  title: "Technology",
  description: "African tech intelligence — funding, regulation, failures and infrastructure. Not startup PR.",
};

export default function TechnologyPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Technology" }]}
      kicker="Afronomics Tech"
      title="Funding, rails and regulation — not a pitch book"
      lede="Fintech, climate tech, health, agri, mobility, telecoms, data centres and digital banking. Failures and acquisitions sit next to raises. No invented rounds."
    >
      <section>
        <h2 className="font-serif text-2xl">Lenses</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {techLenses.map((item) => (
            <li key={item.slug}>
              <Link href={`/technology/${item.slug}`} className="block border border-rule px-4 py-3 hover:border-gold">
                <p className="font-serif text-xl">{item.label}</p>
                <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">54 country files</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Startup database</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
          Schema fields are ready. Rows publish when a sourced company record exists.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {startupSlots.map((slot) => (
                  <th key={slot}>{slot}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {startupSlots.map((slot) => (
                  <td key={slot} className="text-muted">
                    —
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Regulation</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
          Payments, data, licensing and sandboxes are filed against the issuing regulator — the same
          standard as the Kenya desk. See{" "}
          <Link href="/institutions" className="text-forest underline underline-offset-2">
            institutions
          </Link>
          {" · "}
          <Link href="/technology/digital-regulation" className="text-forest underline underline-offset-2">
            digital regulation files
          </Link>
          .
        </p>
      </section>
    </LayerPage>
  );
}
