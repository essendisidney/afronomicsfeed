import Link from "next/link";
import { statusLabel, type HealthItem } from "@/lib/data/health";

const tone = { ok: "text-up", late: "text-danger", failed: "text-danger", gap: "text-muted" } as const;

/** One line per figure: what it is, whether it is fresh, and why not. */
export function HealthList({ items }: { items: HealthItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Figure</th>
            <th>Status</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {items.map((x) => (
            <tr key={`${x.area}:${x.name}`}>
              <td>
                {x.link ? (
                  <Link href={x.link} className="font-medium hover:text-forest">
                    {x.name}
                  </Link>
                ) : (
                  <span className="font-medium">{x.name}</span>
                )}
                <span className="block text-[11px] text-muted">{x.area}</span>
              </td>
              <td className={`whitespace-nowrap text-xs font-semibold ${tone[x.status]}`}>{statusLabel[x.status]}</td>
              <td className="text-xs text-ink-soft">{x.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
