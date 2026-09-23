export function ExampleDataBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border border-gold/50 bg-gold/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-forest-deep ${className}`}
    >
      Example data
    </span>
  );
}
