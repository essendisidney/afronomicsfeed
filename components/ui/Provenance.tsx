export function Provenance({
  source,
  updated,
  methodology,
}: {
  source: string;
  updated?: string;
  methodology?: string;
}) {
  return (
    <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
      <div>
        <dt className="inline text-gold">Source </dt>
        <dd className="inline">{source}</dd>
      </div>
      {updated ? (
        <div>
          <dt className="inline text-gold">Updated </dt>
          <dd className="inline">{updated}</dd>
        </div>
      ) : null}
      {methodology ? (
        <div>
          <dt className="inline text-gold">Methodology </dt>
          <dd className="inline">{methodology}</dd>
        </div>
      ) : null}
    </dl>
  );
}
