import Link from "next/link";
import type { HubLink, HubSection } from "@/lib/hubs";

export function HubLinks({ links }: { links: readonly HubLink[] }) {
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className="flex h-full min-h-11 flex-col rounded-2xl border border-rule bg-surface px-4 py-3 hover:border-forest">
            <span className="text-[15px] font-semibold leading-6 text-ink">{link.label} →</span>
            <span className="mt-0.5 text-[13px] leading-5 text-muted">{link.note}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** A hub page body: one section per reader question, with a jump list on top. */
export function HubSections({ sections }: { sections: readonly HubSection[] }) {
  return (
    <>
      <nav aria-label="On this page" className="mt-2 flex flex-wrap gap-2">
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="inline-flex min-h-11 items-center rounded-full border border-rule px-4 text-[13px] font-medium text-ink-soft hover:border-forest hover:text-ink">
            {s.question}
          </a>
        ))}
      </nav>
      {sections.map((s) => (
        <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mt-10 border-t border-rule pt-8">
          <h2 id={`${s.id}-h`} className="font-serif text-2xl leading-tight text-ink sm:text-[1.75rem]">
            {s.question}
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-6 text-ink-soft">{s.intro}</p>
          <HubLinks links={s.links} />
        </section>
      ))}
    </>
  );
}
