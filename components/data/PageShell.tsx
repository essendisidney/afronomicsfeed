import { PageShare } from "@/components/share/PageShare";
import { ShareBar } from "@/components/share/ShareBar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { site } from "@/lib/site";
import { Kicker } from "./parts";

/**
 * `share`: the share bar under the heading (docs/rebuild/phase-7b-plan.md, 7b-2), for pages people pass on: the
 * page's path, the line the share carries, and the kind of page for the campaign tag (share-<kind>).
 */
export function PageShell({
  crumbs,
  kicker,
  title,
  lede,
  aside,
  share,
  children,
}: {
  crumbs: { href?: string; label: string }[];
  kicker: string;
  title: string;
  lede?: React.ReactNode;
  aside?: React.ReactNode;
  /** Omitted: a share bar for the page's own address (PageShare). false: no bar. */
  share?: { path: string; text?: string; campaign: string } | false;
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
          {share ? (
            <ShareBar
              url={`${site.url}${share.path}`}
              title={share.text ?? title}
              campaign={share.campaign}
              label="Share this page"
              networks={["whatsapp", "linkedin", "x", "facebook", "email"]}
              className="mt-4"
            />
          ) : share === false ? null : (
            <PageShare title={title} className="mt-4" />
          )}
        </div>
        {aside ? <div className="lg:col-span-4">{aside}</div> : null}
      </header>
      <div className="mt-8">{children}</div>
    </div>
  );
}
