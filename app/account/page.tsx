import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { currentSeat, entitlementRows, seats } from "@/lib/demo/entitlements";

export const metadata: Metadata = {
  title: "Account",
  description: "Seat status for Afronomics. Sign-in and billing are not live.",
};

export default function AccountPage() {
  const seat = currentSeat();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Account" }]}
      kicker="Account"
      title="Your seat"
      lede="No session is stored yet. The desk treats every visitor as Free until Supabase Auth and billing are live."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Status</p>
          <p className="mt-1 font-serif text-xl">{seat.label}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Signed in</p>
          <p className="mt-1 font-serif text-xl">No</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Billing</p>
          <p className="mt-1 font-serif text-xl">Not live</p>
        </div>
      </div>

      <p className="mt-8 text-sm">
        <Link href="/login" className="text-forest underline underline-offset-2">
          Sign in
        </Link>
        {" · "}
        <Link href="/signup" className="text-forest underline underline-offset-2">
          Request access
        </Link>
        {" · "}
        <Link href="/pricing" className="text-forest underline underline-offset-2">
          Pricing
        </Link>
        {" · "}
        <Link href="/developers" className="text-forest underline underline-offset-2">
          Developers
        </Link>
      </p>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">What each seat unlocks</h2>
        <p className="mt-2 text-sm text-ink-soft">A matrix, not a promise that checkout works.</p>
        <div className="mt-6 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th>Pro</th>
                <th>Professional</th>
                <th>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {entitlementRows.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td>{row.free}</td>
                  <td>{row.pro}</td>
                  <td>{row.professional}</td>
                  <td>{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Published seats</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {seats.map((item) => (
            <li key={item.slug} className="border border-rule px-4 py-3">
              <p className="font-serif text-xl">{item.name}</p>
              <p className="mt-1 font-mono text-sm">
                {item.price}
                {"period" in item && item.period ? item.period : ""} · {item.cadence}
              </p>
              <p className="mt-2 text-sm text-ink-soft">{item.detail}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{item.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <Provenance source="No Auth session" methodology="No invented seat. Checkout and magic links are stubs." />
    </LayerPage>
  );
}
