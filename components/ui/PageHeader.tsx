export function PageHeader({
  kicker,
  title,
  lede,
}: {
  kicker?: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="max-w-2xl">
      {kicker ? (
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
          {kicker}
        </p>
      ) : null}
      <h1 className="mt-3 font-serif text-4xl leading-[1.15] text-ink sm:text-5xl">{title}</h1>
      {lede ? <p className="mt-5 text-lg leading-8 text-ink-soft">{lede}</p> : null}
    </header>
  );
}
