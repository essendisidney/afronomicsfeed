import { PageShell } from "./PageShell";

export function ProsePage({
  crumbs,
  kicker,
  title,
  lede,
  children,
}: {
  crumbs: { href?: string; label: string }[];
  kicker: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <PageShell crumbs={crumbs} kicker={kicker} title={title} lede={lede ? <p>{lede}</p> : undefined}>
      <div className="article-body max-w-2xl">{children}</div>
    </PageShell>
  );
}
