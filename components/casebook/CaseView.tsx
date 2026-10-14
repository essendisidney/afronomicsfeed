import { EvidenceTag, asOfLabel } from "@/components/evidence/EvidenceTag";
import { Timeline } from "@/components/evidence/Timeline";
import { MarkdownBody } from "@/components/ui/MarkdownBody";
import { caseCountry, caseSector, evidence, isPublic, type Case, type CaseFigure } from "@/lib/cases";

/**
 * One case, in the order of the brief (section 5): conditions before, trigger, timeline, who lost, signals visible
 * beforehand, the response, lessons, sources. Used by /casebook/[id] and by the desk's draft view, so a draft looks
 * exactly as it will when it is signed off.
 */

function Section({ id, title, label, children }: { id: string; title: string; label: "Facts" | "Analysis"; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <div className="flex flex-wrap items-baseline gap-3 border-b border-rule pb-2">
        <h2 id={id} className="font-serif text-2xl text-ink">
          {title}
        </h2>
        <span className="rounded-full border border-rule px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Missing({ what }: { what: string }) {
  return <p className="text-[14px] text-muted">Not yet sourced: {what}. Left empty rather than filled from memory.</p>;
}

function Figures({ c, rows, label }: { c: Case; rows: CaseFigure[]; label: string }) {
  if (!rows.length) return <Missing what={label} />;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {rows.map((f, i) => (
        <li key={i} className="rounded-2xl border border-rule bg-surface px-4 py-4">
          <p className="text-[13px] text-muted">{f.metric}</p>
          <p className="tabular mt-1 text-[1.25rem] font-semibold text-ink" data-num>
            {f.value}
          </p>
          <EvidenceTag {...evidence(c, f.source, f.as_of)} className="mt-2" />
        </li>
      ))}
    </ul>
  );
}

export function CaseHeaderNote({ c }: { c: Case }) {
  if (isPublic(c)) {
    return (
      <p className="text-[13px] text-muted">
        Signed off by {c.signed_off!.by} on {asOfLabel(c.signed_off!.date)}. Information, not advice.
      </p>
    );
  }
  return (
    <div role="note" className="rounded-2xl border-2 border-gold/60 bg-surface px-4 py-3 text-[14px] leading-6 text-ink">
      <p className="font-semibold">DRAFT, not public.</p>
      <p className="mt-1 text-ink-soft">
        Researched from the regulators&rsquo; documents and waiting for the founder&rsquo;s check and sign-off. Only preview deployments and the desk
        show it.
      </p>
    </div>
  );
}

export function CaseView({ c }: { c: Case }) {
  return (
    <article>
      <dl className="tabular flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
        <div>
          <dt className="inline text-muted">File </dt>
          <dd className="inline font-semibold text-ink">{c.id}</dd>
        </div>
        <div>
          <dt className="inline text-muted">Country </dt>
          <dd className="inline text-ink">{caseCountry(c)}</dd>
        </div>
        <div>
          <dt className="inline text-muted">Sector </dt>
          <dd className="inline text-ink">{caseSector(c)}</dd>
        </div>
        <div>
          <dt className="inline text-muted">Period </dt>
          <dd className="inline text-ink">
            <time dateTime={c.start}>{asOfLabel(c.start)}</time> to {c.end ? <time dateTime={c.end}>{asOfLabel(c.end)}</time> : "open"}
          </dd>
        </div>
        {c.institutions.length ? (
          <div>
            <dt className="inline text-muted">Institutions </dt>
            <dd className="inline text-ink">{c.institutions.join(", ")}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-4">
        <CaseHeaderNote c={c} />
      </div>

      <Section id="before" title="Conditions before" label="Facts">
        <Figures c={c} rows={c.conditions_before} label="the published figures before the event" />
      </Section>

      <Section id="trigger" title="What set it off" label="Facts">
        <p className="max-w-3xl text-[16px] leading-7 text-ink">{c.trigger.text}</p>
        <EvidenceTag {...evidence(c, c.trigger.source, c.trigger.date)} className="mt-2" />
      </Section>

      <Section id="timeline" title="Timeline" label="Facts">
        {c.timeline.length ? (
          <Timeline
            label={`Timeline of ${c.title}`}
            events={c.timeline.map((e) => ({ date: e.date, title: e.title, detail: e.detail, evidence: evidence(c, e.source, e.date) }))}
          />
        ) : (
          <Missing what="the dated events" />
        )}
      </Section>

      <Section id="who-lost" title="Who lost" label="Facts">
        {c.who_lost.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {c.who_lost.map((l, i) => (
              <li key={i} className="rounded-2xl border border-rule bg-surface px-4 py-4">
                <p className="text-[15px] font-semibold text-ink">{l.group}</p>
                {l.amount ? (
                  <p className="tabular mt-1 text-[1.15rem] text-ink" data-num>
                    {l.amount}
                  </p>
                ) : null}
                <EvidenceTag {...evidence(c, l.source, l.as_of)} className="mt-2" />
              </li>
            ))}
          </ul>
        ) : (
          <Missing what="published losses" />
        )}
      </Section>

      <Section id="signals" title="Signals visible beforehand" label="Facts">
        <Figures c={c} rows={c.signals_visible_before} label="figures published before the event" />
      </Section>

      <Section id="response" title="The response" label="Facts">
        {c.response.length ? (
          <ul className="space-y-4">
            {c.response.map((r, i) => (
              <li key={i} className="max-w-3xl">
                <p className="text-[15px] leading-7 text-ink">
                  <time dateTime={r.date} className="tabular font-semibold">
                    {asOfLabel(r.date)}:
                  </time>{" "}
                  {r.text}
                </p>
                <EvidenceTag {...evidence(c, r.source, r.date)} className="mt-1" />
              </li>
            ))}
          </ul>
        ) : (
          <Missing what="the regulators' response" />
        )}
      </Section>

      <Section id="lessons" title="Questions a board can ask" label="Analysis">
        {c.lessons.length ? (
          <ul className="max-w-3xl space-y-2">
            {c.lessons.map((l, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-7 text-ink">
                <span aria-hidden="true" className="mt-2 h-3.5 w-3.5 shrink-0 rounded-sm border-2 border-forest" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Missing what="the lessons" />
        )}
        {c.analysis ? (
          <div className="mt-6 max-w-3xl">
            <MarkdownBody content={c.analysis} />
          </div>
        ) : null}
      </Section>

      <Section id="sources" title="Sources" label="Facts">
        <ol className="max-w-3xl list-decimal space-y-2 pl-5 text-[14px] leading-6 text-ink-soft">
          {c.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2 hover:text-forest">
                {s.name}
              </a>
              , <time dateTime={s.date}>{asOfLabel(s.date)}</time>
            </li>
          ))}
        </ol>
      </Section>

      {!isPublic(c) && c.todo.length ? (
        <section aria-labelledby="todo" className="mt-10 rounded-2xl border border-rule bg-paper-2 px-5 py-5">
          <h2 id="todo" className="text-[15px] font-semibold text-ink">
            Still to source before sign-off ({c.todo.length})
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] leading-6 text-ink-soft">
            {c.todo.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-10 text-[13px] text-muted">
        Facts are what the regulators and the institution published, each linked. Analysis is ours. Information, not advice.
      </p>
    </article>
  );
}
