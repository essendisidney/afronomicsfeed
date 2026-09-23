import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { edgesForDesk, getGraphDesk, getGraphNode, graphDesks } from "@/lib/demo/graph";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return graphDesks.map((desk) => ({ slug: desk.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const desk = getGraphDesk(slug);
  if (!desk) return {};
  return {
    title: desk.label,
    description: desk.lede,
    alternates: { canonical: `${site.url}/graph/${desk.slug}` },
  };
}

export default async function GraphDeskPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const desk = getGraphDesk(slug);
  if (!desk) notFound();
  const edges = edgesForDesk(desk.slug);

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/graph", label: "Graph" },
        { label: desk.label },
      ]}
      kicker="Graph desk"
      title={desk.label}
      lede={desk.lede}
    >
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>From</th>
              <th>Rel</th>
              <th>To</th>
              <th>Status</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {edges.map((edge) => {
              const from = getGraphNode(edge.from);
              const to = getGraphNode(edge.to);
              return (
                <tr key={edge.id}>
                  <td>
                    {from?.href ? (
                      <Link href={from.href} className="text-forest underline underline-offset-2">
                        {from.label}
                      </Link>
                    ) : (
                      from?.label ?? edge.from
                    )}
                  </td>
                  <td className="font-mono text-xs uppercase tracking-[0.08em] text-muted">{edge.rel}</td>
                  <td>
                    {to?.href ? (
                      <Link href={to.href} className="text-forest underline underline-offset-2">
                        {to.label}
                      </Link>
                    ) : (
                      to?.label ?? edge.to
                    )}
                  </td>
                  <td className="font-mono text-[10px] uppercase tracking-[0.1em] text-gold">{edge.status}</td>
                  <td className="text-sm text-ink-soft">{edge.source}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-8 text-sm">
        <Link href="/countries/kenya" className="text-forest underline underline-offset-2">
          Kenya terminal
        </Link>
        {" · "}
        <Link href="/graph/resolve" className="text-forest underline underline-offset-2">
          Resolve entity
        </Link>
        {" · "}
        <Link href="/economy/kenya" className="text-forest underline underline-offset-2">
          Economy file
        </Link>
      </p>
      <Provenance source="Kenya desk edges" methodology="Status stays demo/editorial until a cited print tags the edge." />
    </LayerPage>
  );
}
