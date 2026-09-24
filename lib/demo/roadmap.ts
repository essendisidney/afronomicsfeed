import { changelogEntries } from "@/lib/demo/changelog";
import { goLiveGates } from "@/lib/demo/golive";

export type RoadmapItem = {
  slug: string;
  label: string;
  lane: "shipped" | "scaffold" | "blocked";
  lede: string;
  href: string;
};

/**
 * Public roadmap derived from changelog + go-live gates.
 * No invented ship dates for dark stores.
 */
export function roadmapItems(): RoadmapItem[] {
  const fromChangelog: RoadmapItem[] = changelogEntries.map((entry) => ({
    slug: entry.slug,
    label: `Phase ${entry.phase} · ${entry.title}`,
    lane: entry.status === "shipped" ? "shipped" : "scaffold",
    lede: entry.lede,
    href: entry.hrefs[0] ?? "/changelog",
  }));

  const fromGates: RoadmapItem[] = goLiveGates
    .filter((gate) => gate.status !== "ready")
    .map((gate) => ({
      slug: `gate-${gate.id}`,
      label: gate.label,
      lane: gate.status === "blocked" ? "blocked" : "scaffold",
      lede: gate.lede,
      href: gate.href,
    }));

  return [...fromChangelog, ...fromGates];
}

export function roadmapByLane(lane: RoadmapItem["lane"]) {
  return roadmapItems().filter((item) => item.lane === lane);
}
