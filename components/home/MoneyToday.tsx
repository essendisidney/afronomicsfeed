import Link from "next/link";
import { buildMoneyDoors } from "@/lib/editions/money-today";

/** The homepage's four doors; content and figures come from lib/editions/money-today.ts. */
export async function MoneyToday() {
  const { title, note, missing, doors } = await buildMoneyDoors("en");
  return (
    <section aria-labelledby="money-today" className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="money-today" className="font-serif text-3xl text-ink">
          {title}
        </h2>
        <p className="text-[13px] text-muted">
          {note}{" "}
          <a href="/lite?lang=sw" className="underline underline-offset-2">
            Kwa Kiswahili, toleo jepesi
          </a>
        </p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {doors.map((door) => (
          <div key={door.id} id={door.id} className="flex scroll-mt-24 flex-col rounded-2xl border border-rule bg-surface px-5 py-5">
            <p className="text-[13px] font-semibold text-forest">{door.who}</p>
            <h3 className="mt-1 text-[17px] font-semibold leading-snug text-ink">{door.question}</h3>
            {door.lines.length ? (
              <dl className="mt-4 space-y-3">
                {door.lines.map((line) => (
                  <div key={line.k}>
                    <dt className="text-[12px] leading-4 text-muted">{line.k}</dt>
                    <dd className="mt-0.5 font-serif text-xl leading-tight text-ink">{line.v}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-muted">{missing}</p>
            )}
            <ul className="mt-auto space-y-1.5 pt-5 text-[14px] font-medium">
              {door.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-forest hover:text-gold">
                    {link.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
