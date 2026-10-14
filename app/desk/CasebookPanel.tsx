import Link from "next/link";
import { SectionTitle } from "@/components/data/parts";
import { isPublic, type Case } from "@/lib/cases";

/** The casebook on the desk: every case, drafts first, with what is still to source before sign-off. */
export function CasebookPanel({ cases }: { cases: Case[] }) {
  const drafts = cases.filter((c) => !isPublic(c));
  return (
    <section id="casebook" className="scroll-mt-20">
      <SectionTitle
        kicker="Casebook"
        title={`${drafts.length} ${drafts.length === 1 ? "draft" : "drafts"} waiting for your sign-off, ${cases.length - drafts.length} public`}
        href="/desk/watch"
        hrefLabel="Watch packs →"
        note="To publish a case: check each fact against its link, then set status: published and signed_off (your name and the date) in content/cases/<id>.md. The validator refuses a case with open TODOs."
      />
      {cases.length ? (
        <ul className="mt-3 divide-y divide-rule rounded-2xl border border-rule bg-surface">
          {[...drafts, ...cases.filter(isPublic)].map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[14px]">
              <Link href={`/desk/cases/${c.id}`} className="font-semibold text-ink underline underline-offset-2 hover:text-forest">
                {c.id} · {c.title}
              </Link>
              <span className="tabular text-muted">{isPublic(c) ? "Public" : `Draft · ${c.todo.length} to source`}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[14px] text-muted">No cases yet.</p>
      )}
    </section>
  );
}
