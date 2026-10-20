/**
 * The figures each calculator opens with. The calculators (components/data/*) start from these, and the tool's share
 * card (lib/share-cards.tsx) works its one example from the same values with the same lib functions, so the preview a
 * reader sees on WhatsApp or LinkedIn is exactly what the page shows before anything is typed. No server imports:
 * the calculators are client components.
 */
export const toolDefaults = {
  salary: { gross: 100_000 },
  loan: { amount: 100_000, rate: 14, unit: "year", basis: "flat", months: 12 },
  savingsGoal: { goal: 60_000, label: "School fees" },
  inflation: { amount: 1000, from: "2015-01" },
  mpesa: { amount: 2000, kind: "send" },
  ipo: { amount: 20_000 },
  tbill: { amount: 100_000, mode: "pay" },
  // Preset ids are built in lib/debt-presets.ts from our data (Fuliza bands, M-Shwari, the CBK lending rate).
  debtPlan: {
    budget: 6000,
    debts: [
      { preset: "fuliza", balance: 2000, minimum: 0 },
      { preset: "mshwari", balance: 5000, minimum: 500 },
      { preset: "bank", balance: 50_000, minimum: 2500 },
    ],
  },
} as const;
