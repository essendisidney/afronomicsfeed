export const corridors = [
  {
    slug: "northern-corridor",
    name: "Northern Corridor",
    geography: "Mombasa — Nairobi — Kampala — Kigali — Bujumbura / South Sudan",
    modes: ["Port", "Road", "Rail", "Border posts"],
    note: "Volumes, dwell times and disruption series are not connected.",
  },
  {
    slug: "central-corridor",
    name: "Central Corridor",
    geography: "Dar es Salaam — Dodoma — Kigali / Bujumbura / DRC",
    modes: ["Port", "Rail", "Road"],
    note: "Awaiting licensed logistics and customs prints.",
  },
  {
    slug: "lobito-corridor",
    name: "Lobito Corridor",
    geography: "Lobito — DRC Copperbelt — Zambia",
    modes: ["Port", "Rail"],
    note: "Project and throughput figures stay blank until sourced.",
  },
  {
    slug: "maputo-corridor",
    name: "Maputo Corridor",
    geography: "Maputo — Mpumalanga — Gauteng",
    modes: ["Port", "Road", "Rail"],
    note: "No invented trade volumes.",
  },
] as const;

export function getCorridor(slug: string) {
  return corridors.find((c) => c.slug === slug);
}
