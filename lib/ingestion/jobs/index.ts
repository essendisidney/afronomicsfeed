export const scheduledJobs = [
  {
    id: "resolve-kenya-edges",
    cadence: "manual",
    status: "stub",
    note: "Would upsert Kenya graph edges from tagged articles. Not scheduled.",
  },
  {
    id: "dedupe-observations",
    cadence: "hourly",
    status: "stub",
    note: "Would append-only dedupe indicator observations. No store connected.",
  },
  {
    id: "publish-signals",
    cadence: "on print",
    status: "stub",
    note: "Would open a signal file only after a cited print lands.",
  },
] as const;
