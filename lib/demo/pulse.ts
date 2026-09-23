export const pulseComponents = [
  { key: "growth", label: "Growth", reading: "—", note: "Score not in production" },
  { key: "inflation", label: "Inflation", reading: "—", note: "Awaiting national statistics series" },
  { key: "currencies", label: "Currencies", reading: "—", note: "No live FX redistribution" },
  { key: "debt", label: "Debt", reading: "—", note: "Sovereign series not licensed" },
  { key: "capital", label: "Capital", reading: "—", note: "Tracker in methodology" },
  { key: "trade", label: "Trade", reading: "—", note: "Corridor volumes pending" },
  { key: "climate", label: "Climate", reading: "—", note: "Climate capital gap pending" },
  { key: "energy", label: "Energy", reading: "—", note: "Capacity series pending" },
  { key: "technology", label: "Technology", reading: "—", note: "Funding book pending" },
  { key: "consumer", label: "Consumer", reading: "—", note: "Activity proxy pending" },
] as const;

export const countryPulses = [
  { slug: "kenya", name: "Kenya" },
  { slug: "nigeria", name: "Nigeria" },
  { slug: "south-africa", name: "South Africa" },
  { slug: "egypt", name: "Egypt" },
  { slug: "ghana", name: "Ghana" },
  { slug: "rwanda", name: "Rwanda" },
] as const;
