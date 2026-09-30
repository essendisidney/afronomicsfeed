import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="text-[12.5px] font-semibold text-gold">
        404
      </p>
      <h1 className="mt-3 font-serif text-4xl text-ink">This file is not on the desk</h1>
      <p className="mt-4 text-sm leading-6 text-ink-soft">
        The page does not exist, or the brief has not been published.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-forest px-5 py-3 text-[14px] font-semibold text-paper"
      >
        Return home
      </Link>
    </div>
  );
}
