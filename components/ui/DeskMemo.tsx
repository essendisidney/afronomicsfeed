export function DeskMemo({
  soWhat,
  unknowns,
  gated,
}: {
  soWhat?: string;
  unknowns?: string[];
  gated?: boolean;
}) {
  if (!soWhat && (!unknowns || unknowns.length === 0)) return null;

  if (gated) {
    return (
      <aside className="mt-8 border border-gold/35 bg-gold/10 px-5 py-5">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
          Desk memo — Individual
        </p>
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          What to file, and what is still unknown, sits behind a seat. Free
          readers keep the teaser, the lede, and the citations. That is the
          product a desk pays for — not a longer explainer.
        </p>
      </aside>
    );
  }

  return (
    <aside className="mt-8 border border-rule bg-paper-2 px-5 py-5">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
        Desk memo
      </p>
      {soWhat ? <p className="mt-3 text-[15px] leading-7 text-ink-soft">{soWhat}</p> : null}
      {unknowns && unknowns.length > 0 ? (
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Still unknown</p>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-ink-soft">
            {unknowns.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
