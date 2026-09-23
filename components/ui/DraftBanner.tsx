export function DraftBanner({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-danger/30 bg-danger/8 px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-danger">
      Draft pending counsel — {children}
    </p>
  );
}
