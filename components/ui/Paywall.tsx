import Link from "next/link";

export function Paywall({ title }: { title: string }) {
  return (
    <aside className="no-print relative mt-10 overflow-hidden border border-rule bg-paper-2">
      <div
        aria-hidden="true"
        className="pointer-events-none space-y-3 px-6 pt-8 text-sm leading-7 text-muted blur-[3px] select-none"
      >
        <p>Desk memo: what to file from this primary, and what remains unknown.</p>
        <p>The annotated method continues for Individual seats.</p>
      </div>
      <div className="relative z-10 -mt-6 px-6 pb-8 pt-2 text-center sm:px-10">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
          The memo is the product
        </p>
        <h2 className="mt-3 font-serif text-2xl text-ink sm:text-3xl">
          “{title}” — what to file is for subscribers
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-soft">
          Free readers get the headline, three bullets, the lede, and citations.
          Individual unlocks the desk memo: what to put in the pack, and what
          you must not invent. Checkout is not live yet.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/subscribe"
            className="bg-forest px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-paper hover:bg-forest-mid"
          >
            Start KES 500 trial
          </Link>
          <Link
            href="/pricing"
            className="border border-ink/20 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink hover:border-gold hover:text-forest"
          >
            Why a desk pays
          </Link>
        </div>
      </div>
    </aside>
  );
}
