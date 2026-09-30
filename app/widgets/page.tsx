import type { Metadata } from "next";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { embedSnippet, widgets } from "@/lib/embeds";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free widgets — Kenya T-bill rates, African FX and headlines for your site",
  description:
    "Embed live Kenya Treasury bill rates, African currency rates and Africa business headlines on your website or blog. Free, sourced, one line of HTML.",
  alternates: { canonical: `${site.url}/widgets` },
};

const examples: Record<string, string> = { fx: "?codes=KES,UGX,TZS,RWF", headlines: "?country=KE" };

export default function WidgetsPage() {
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/data", label: "Data" }, { label: "Widgets" }]}
      kicker="Free for any site"
      title="Put live African market data on your site"
      lede={
        <p>
          Copy one line of HTML. The widgets update themselves, carry their source, and work on blogs, SACCO and bank sites, investment clubs and
          newsrooms. Add <code className="font-mono text-sm">?theme=dark</code> or <code className="font-mono text-sm">?theme=light</code> to fix the
          colour scheme.
        </p>
      }
    >
      <div className="space-y-14">
        {widgets.map((widget) => {
          const query = examples[widget.slug] ?? "";
          return (
            <section key={widget.slug} className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <SectionTitle kicker="Widget" title={widget.name} />
                <p className="mt-3 text-sm leading-6 text-ink-soft">{widget.detail}</p>
                <p className="mt-4 font-medium text-[12px] text-muted">Embed code</p>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all border border-rule bg-paper-2 p-3 font-mono text-[11px] leading-5 text-ink">
                  {embedSnippet(widget.slug, widget.height, query)}
                </pre>
              </div>
              <div className="lg:col-span-7">
                <iframe
                  src={`/embed/${widget.slug}${query}`}
                  width="100%"
                  height={widget.height}
                  style={{ border: 0, maxWidth: 520 }}
                  loading="lazy"
                  title={widget.name}
                />
              </div>
            </section>
          );
        })}
      </div>
      <p className="mt-14 max-w-2xl text-sm leading-6 text-ink-soft">
        Free to use with the attribution line intact. Need your own branding, other series or a data feed?{" "}
        <a className="text-forest underline" href={`mailto:${site.contactEmail}?subject=Widgets%20and%20data%20feeds`}>
          Write to the desk
        </a>
        .
      </p>
    </PageShell>
  );
}
