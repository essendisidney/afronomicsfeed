/**
 * One headline number with its label, context line and (optionally) where it came from. Figures use tabular
 * numerals so columns of stats line up; the source sits under the number, never on another part of the page.
 */
export function Stat({
  label,
  value,
  detail,
  source,
  size = "md",
  className = "",
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  detail?: React.ReactNode;
  source?: React.ReactNode;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[12px] font-medium leading-5 text-muted">{label}</p>
      <p className={`mt-1 font-serif tabular-nums tracking-[-0.02em] text-ink ${size === "lg" ? "text-4xl" : "text-3xl"}`}>{value}</p>
      {detail ? <p className="mt-1 text-xs leading-5 text-ink-soft">{detail}</p> : null}
      {source ? <p className="mt-2 text-[11px] leading-4 text-muted">{source}</p> : null}
    </div>
  );
}

/** A row of stats in one bordered block, split by hairlines: two up on a phone, up to four on a desktop. */
export function StatGroup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-rule bg-rule lg:grid-cols-4 [&>*]:bg-surface [&>*]:px-4 [&>*]:py-4 ${className}`}
    >
      {children}
    </div>
  );
}
