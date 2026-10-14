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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <Breadcrumbs items={crumbs} />
      <header className="mt-4 grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className={aside ? "lg:col-span-8" : "lg:col-span-9"}>
          <Kicker>{kicker}</Kicker>
          <h1 className="t-h1 mt-2 text-ink text-balance">{title}</h1>
          {lede ? <div className="mt-3 max-w-2xl text-[1.0625rem] leading-7 text-ink-soft">{lede}</div> : null}
        </div>
        {aside ? <div className="lg:col-span-4">{aside}</div> : null}
      </header>
      <div className="mt-8">{children}</div>
    </div>
  );
}
