import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHeader } from "@/components/ui/PageHeader";

export function LayerPage({
  crumbs,
  kicker,
  title,
  lede,
  children,
}: {
  crumbs: { href?: string; label: string }[];
  kicker: string;
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={crumbs} />
      <div className="mt-6">
        <PageHeader kicker={kicker} title={title} lede={lede} />
      </div>
      <div className="mt-10">{children}</div>
    </div>
  );
}
