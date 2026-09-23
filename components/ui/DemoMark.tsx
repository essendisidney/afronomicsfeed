export function DemoMark({
  kind = "demo",
}: {
  kind?: "demo" | "methodology";
}) {
  return (
    <span className="inline-flex items-center border border-gold/50 bg-gold/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-gold">
      {kind === "methodology" ? "Methodology under development" : "Demo data"}
    </span>
  );
}
