import Link from "next/link";
import { EvidenceTag, type Evidence } from "@/components/evidence/EvidenceTag";

/**
 * The stat tile (docs/rebuild/phase-7-plan.md): one figure, its change, a short trend and its evidence tag in one
 * compact block. The trend is drawn from the same data as the figure; up and down keep their own colours.
 */
export function StatTile({
  label,
  value,
  change,
  direction = "flat",
  trend,
  evidence,
  href,
}: {
  label: string;
  value: string;
  change?: string;
  direction?: "up" | "down" | "flat";
  trend?: number[];
  evidence: Evidence;
  href?: string;
}) {
  const tone = direction === "up" ? "text-up" : direction === "down" ? "text-down" : "text-muted";
  return (
    <div className="stat-tile relative flex flex-col rounded-2xl border border-rule bg-surface px-4 py-3.5">
      <p className="t-label text-muted">
        {href ? (
          <Link href={href} className="after:absolute after:inset-0 hover:text-ink">
            {label}
          </Link>
        ) : (
          label
        )}
      </p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <div>
          <p className="tabular text-[1.75rem] font-semibold leading-none tracking-tight text-ink">{value}</p>
          {change ? (
            <p className={`tabular mt-1.5 text-[13px] font-medium ${tone}`}>
              <span aria-hidden="true">{direction === "up" ? "▲ " : direction === "down" ? "▼ " : ""}</span>
              {change}
            </p>
          ) : null}
        </div>
        {trend && trend.length > 1 ? <Trend values={trend} /> : null}
      </div>
      <div className="relative z-10 mt-3">
        <EvidenceTag {...evidence} />
      </div>
    </div>
  );
}

function Trend({ values }: { values: number[] }) {
  const w = 96;
  const h = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * (w - 4) + 2).toFixed(1)},${(2 + (1 - (v - min) / span) * (h - 4)).toFixed(1)}`);
  const [lx, ly] = pts[pts.length - 1].split(",");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="h-8 w-24 shrink-0 overflow-visible">
      <polyline points={pts.join(" ")} fill="none" stroke="var(--chart-quiet-ink)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r={2.5} fill="var(--brand-accent)" />
    </svg>
  );
}
