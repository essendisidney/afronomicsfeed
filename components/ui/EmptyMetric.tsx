import { DemoMark } from "./DemoMark";

export function EmptyMetric({
  label,
  note = "No verified observation stored",
}: {
  label: string;
  note?: string;
}) {
  return (
    <div className="border border-rule bg-paper px-3 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 font-serif text-2xl text-ink">—</p>
      <p className="mt-1 text-[11px] leading-4 text-muted">{note}</p>
      <div className="mt-2">
        <DemoMark kind="methodology" />
      </div>
    </div>
  );
}
