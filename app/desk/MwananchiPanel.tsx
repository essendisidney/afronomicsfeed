import Link from "next/link";
import { SectionTitle } from "@/components/data/parts";
import { ACTION_LABEL, type Ranked } from "@/lib/mwananchi-core";

/**
 * The Mwananchi engine on the desk: the everyday money problems to serve next (lib/mwananchi-core.ts, catalogue in
 * data/mwananchi/pains.json). Left, problems with no tool yet; right, tools to push this week because the problem is
 * in season or readers are searching for it.
 */
function Item({ r, rank }: { r: Ranked; rank: number }) {
  return (
    <li className="flex gap-3 rounded-xl border border-rule bg-paper px-3 py-2.5">
      <span className="font-serif text-xl leading-6 text-muted">{rank}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-gold">
          {ACTION_LABEL[r.action]} · score {r.score}
        </p>
        <p className="text-sm font-medium text-ink [overflow-wrap:anywhere]">
          {r.pain.tool ? (
            <Link href={r.pain.tool} className="hover:text-forest">
              {r.pain.pain}
            </Link>
          ) : (
            r.pain.pain
          )}
        </p>
        <p className="text-[12px] text-ink-soft [overflow-wrap:anywhere]">Next: {r.pain.next}</p>
        <p className="text-[11.5px] text-muted [overflow-wrap:anywhere]">{r.why.join(" · ")}</p>
      </div>
    </li>
  );
}

export function MwananchiPanel({ build, push, signalsNote }: { build: Ranked[]; push: Ranked[]; signalsNote: string }) {
  return (
    <section id="mwananchi" aria-labelledby="mwananchi-h" className="scroll-mt-20">
      <SectionTitle kicker="Mwananchi engine" title="What to build and push next" note={signalsNote} />
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 id="mwananchi-h" className="text-[13px] font-semibold text-ink">
            Not served yet
          </h3>
          <ol className="mt-2 space-y-2">
            {build.map((r, i) => (
              <Item key={r.pain.id} r={r} rank={i + 1} />
            ))}
          </ol>
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-ink">Push this week</h3>
          {push.length ? (
            <ol className="mt-2 space-y-2">
              {push.map((r, i) => (
                <Item key={r.pain.id} r={r} rank={i + 1} />
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-sm text-muted">No tool is in season or being searched for this week.</p>
          )}
        </div>
      </div>
    </section>
  );
}
