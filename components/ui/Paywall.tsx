import Link from "next/link";

export function Paywall({ title }: { title: string }) {
  return (
    <aside className="no-print relative mt-10 overflow-hidden border border-rule bg-paper-2">
      <div
        aria-hidden="true"
        className="pointer-events-none space-y-3 px-6 pt-8 text-sm leading-7 text-muted blur-[3px] select-none"
      >
        <p>The full analysis continues for Pro subscribers.</p>
        <p>What changed, who is exposed, and what to watch next.</p>
      </div>
      <div className="relative z-10 -mt-6 px-6 pb-8 pt-2 text-center sm:px-10">
        <p className="text-[12.5px] font-semibold text-gold">
          Pro analysis
        </p>
        <h2 className="mt-3 font-serif text-2xl text-ink sm:text-3xl">
          Continue reading “{title}”
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-soft">
          The data and headlines on Afronomics are free. Pro unlocks the full
          analysis behind them.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/pricing"
            className="rounded-full bg-forest px-5 py-3 text-[14px] font-semibold text-paper hover:bg-forest-mid"
          >
            See Pro plans
          </Link>
          <Link
            href="/subscribe"
            className="border border-ink/20 px-5 py-3 text-[12.5px] font-semibold text-ink hover:border-gold hover:text-forest"
          >
            Get the free weekly
          </Link>
        </div>
      </div>
    </aside>
  );
}
