export const signalCategories = [
  "Capital",
  "Currency",
  "Debt",
  "Policy",
  "Trade",
  "Climate",
  "Startup",
  "Infrastructure",
  "Energy",
  "Consumer",
  "Employment",
  "Commodity",
  "Investment",
] as const;

export const signals = [
  {
    title: "Policy — electricity tariff file (Kenya)",
    country: "Kenya",
    sector: "Energy",
    category: "Policy",
    direction: "Watch",
    confidence: "Low — methodology",
    severity: "Desk file",
    horizon: "Near term",
    fact: "A tariff decision, if published, is a primary document — not a score.",
    interpretation:
      "Connect any official notice to inflation, manufacturing costs, FX, listed utilities, and household demand. Do not invent the print.",
  },
  {
    title: "Capital — DFI climate book (regional)",
    country: "East Africa",
    sector: "Climate",
    category: "Climate",
    direction: "Watch",
    confidence: "Low — methodology",
    severity: "Desk file",
    horizon: "Medium",
    fact: "No production climate-capital series is connected.",
    interpretation: "The Climate Capital page is the scaffold. Numbers stay blank until sourced.",
  },
] as const;
