import Link from "next/link";

/**
 * The way in to "What readers paid": a reader adds what they paid for food, fuel, fares or rent, or the rate their
 * bank, SACCO or loan app pays or charges. `ask` tailors the question to the page it sits on.
 */
export function ContributeBand({ ask, compact = false }: { ask?: string; compact?: boolean }) {
  const href = "/rates/what-readers-paid";
  if (compact) {
    return (
      <aside className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-surface px-5 py-4">
        <p className="max-w-2xl text-[15px] leading-6 text-ink">
          <span className="font-semibold">{ask ?? "What did you pay this month?"}</span>{" "}
          <span className="text-ink-soft">Add it anonymously in 20 seconds and see what others near you paid.</span>
        </p>
        <Link href={href} className="rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-paper hover:bg-forest">
          Add yours →
        </Link>
      </aside>
    );
  }
  return (
    <section className="mt-12 grid gap-6 rounded-2xl border border-accent/40 bg-surface px-6 py-6 md:grid-cols-[1.4fr_1fr] md:items-center">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">Your turn · reader reports</p>
        <h2 className="mt-1 font-serif text-3xl text-ink">{ask ?? "What did you pay this month?"}</h2>
        <p className="mt-2 max-w-xl text-[15px] leading-6 text-ink-soft">
          Maize flour, sugar, cooking gas, fuel, your fare, your rent, or the rate your bank, SACCO or loan app gives you. Tell us anonymously; we
          publish only the middle of at least three readers&rsquo; reports, never yours alone. Got a story? There&rsquo;s a box for the editor too.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 md:justify-end">
        <Link href={href} className="rounded-full bg-ink px-5 py-2.5 text-[15px] font-semibold text-paper hover:bg-forest">
          Add what you paid
        </Link>
        <Link href={`${href}#kenya`} className="rounded-full border border-rule px-5 py-2.5 text-[15px] font-semibold text-ink hover:border-accent">
          See what others paid
        </Link>
      </div>
    </section>
  );
}
