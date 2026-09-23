import type { ContentLabel } from "@/lib/types";

const styles: Record<ContentLabel, string> = {
  Facts: "border-facts/30 text-facts",
  Analysis: "border-analysis/30 text-analysis",
  Opinion: "border-opinion/30 text-opinion",
};

export function LabelBadges({ labels }: { labels: ContentLabel[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {labels.map((label) => (
        <li
          key={label}
          className={`rounded-sm border bg-paper px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] ${styles[label]}`}
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
