import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Kicker } from "./parts";

export function PageShell({
  crumbs,
  kicker,
  title,
  lede,
  aside,
  children,
}: {
  crumbs: { href?: string; label: string }[];
  kicker: string;
  title: string;
  lede?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={crumbs} />
      <header className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className={aside ? "lg:col-span-8" : "lg:col-span-9"}>
          <Kicker>{kicker}</Kicker>
          <h1 className="mt-3 font-serif text-4xl leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">{title}</h1>
          {lede ? <div className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">{lede}</div> : null}
        </div>
        {aside ? <div className="lg:col-span-4">{aside}</div> : null}
      </header>
      <div className="mt-10">{children}</div>
    </div>
  );
}
