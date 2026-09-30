import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Offline", robots: { index: false } };

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <p className="text-[12px] font-semibold text-gold">No connection</p>
      <h1 className="mt-3 font-serif text-4xl text-ink">You’re offline</h1>
      <p className="mt-4 text-base leading-7 text-ink-soft">
        Pages you opened recently are saved on this device and still open without a connection. Live rates, headlines and downloads return as
        soon as you’re back online.
      </p>
      <ul className="mt-6 space-y-2 text-sm">
        <li>
          <Link href="/" className="text-forest underline">
            Home
          </Link>
        </li>
        <li>
          <Link href="/markets/tbills" className="text-forest underline">
            Africa T-bill monitor
          </Link>
        </li>
      </ul>
    </div>
  );
}
