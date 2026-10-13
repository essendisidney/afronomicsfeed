import Link from "next/link";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { statusLabel, type HealthItem } from "@/lib/data/health";

const tone: Record<HealthItem["status"], BadgeTone> = { ok: "up", late: "warn", failed: "down", gap: "neutral" };

/** One line per figure: what it is, whether it is fresh, and why not. A card per figure on a phone. */
export function HealthList({ items, label = "Figures and their freshness" }: { items: HealthItem[]; label?: string }) {
  return (
    <DataTable
      label={label}
      mobile="cards"
      rows={items}
      rowKey={(x) => `${x.area}:${x.name}`}
      columns={[
        {
          key: "figure",
          header: "Figure",
          cell: (x) => (
            <>
              {x.link ? (
                <Link href={x.link} className="font-medium hover:text-forest">
                  {x.name}
                </Link>
              ) : (
                <span className="font-medium">{x.name}</span>
              )}
              <span className="block text-[11px] font-normal text-muted">{x.area}</span>
            </>
          ),
        },
        { key: "status", header: "Status", className: "whitespace-nowrap", cell: (x) => <Badge tone={tone[x.status]}>{statusLabel[x.status]}</Badge> },
        { key: "detail", header: "Detail", className: "text-xs text-ink-soft", cell: (x) => x.detail },
      ]}
    />
  );
}
