"use client";

import Link from "next/link";

/**
 * Shown in place of a page that failed to render (a data source down, a bad row), inside the normal header and
 * footer, instead of the framework's bare "Application error" screen. The reference lets the desk find the server log
 * line (error.digest); nothing else about the error is shown.
 */
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="text-[12.5px] font-semibold text-gold">Something went wrong</p>
      <h1 className="mt-3 font-serif text-4xl text-ink">This page did not load</h1>
      <p className="mt-4 text-sm leading-6 text-ink-soft">
        One of the sources behind it did not answer in time. Trying again usually works; if it does not, the rest of the
        site is still up.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={() => retry()} className="inline-block min-h-11 rounded-full bg-forest px-5 py-3 text-[14px] font-semibold text-paper">
          Try again
        </button>
        <Link href="/" className="inline-block min-h-11 rounded-full border border-rule px-5 py-3 text-[14px] font-semibold text-ink">
          Return home
        </Link>
      </div>
      {error.digest ? <p className="mt-6 text-[12px] text-muted tabular">Reference {error.digest}</p> : null}
    </div>
  );
}
