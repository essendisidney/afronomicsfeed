import Link from "next/link";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { getCountry } from "@/lib/demo/countries";
import { peerInstruments, type MarketInstrument } from "@/lib/demo/markets";

const kindLabel = {
  currency: "Currency file",
  exchange: "Exchange file",
  commodity: "Commodity file",
} as const;

export function MarketFileView({ item }: { item: MarketInstrument }) {
  const country = item.countrySlug ? getCountry(item.countrySlug) : undefined;
  const peers = peerInstruments(item);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Official print" note={`Demo layout shows ${item.value}`} />
        <EmptyMetric label="Change" note="No derived move without two sourced prints" />
        <EmptyMetric label="As-of" note="Not a live feed" />
      </div>

      <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Kind</dt>
          <dd className="mt-1">{kindLabel[item.kind]}</dd>
        </div>
        {country ? (
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Country terminal</dt>
            <dd className="mt-1">
              <Link href={`/countries/${country.slug}/markets`} className="text-forest underline underline-offset-2">
                {country.name} markets
              </Link>
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Official door</dt>
          <dd className="mt-1">
            <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-2">
              {item.href}
            </a>
          </dd>
        </div>
      </dl>

      {peers.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-serif text-2xl">Peer files</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {peers.map((peer) => (
              <li key={peer.slug}>
                <Link href={peer.fileHref} className="block border border-rule px-3 py-3 hover:border-gold">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{peer.label}</p>
                  <p className="mt-1 text-xs text-muted">Demo {peer.value} · not a live print</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Provenance source={item.href} updated="Not a live feed" methodology="No tape redistribution. Demonstration print only." />
    </>
  );
}
