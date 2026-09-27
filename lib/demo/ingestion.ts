export type IngestionJob = {
  id: string;
  cadence: string;
  status: "stub" | "idle" | "blocked" | "scheduled";
  desk: string | null;
  note: string;
};

/** Ops board. The prints agent is scheduled. The other jobs are not. */
export const ingestionJobs: IngestionJob[] = [
  {
    id: "world-bank-prints",
    cadence: "daily",
    status: "scheduled",
    desk: null,
    note: "Cron at /api/cron/agents reads World Bank Open Data. Parsed vintages are stored. A later write from the site needs the service role. A null response is not stored.",
  },
  {
    id: "resolve-kenya-edges",
    cadence: "manual",
    status: "stub",
    desk: "kenya",
    note: "Would upsert Kenya graph edges from tagged articles. Not scheduled.",
  },
  {
    id: "resolve-featured-desks",
    cadence: "manual",
    status: "stub",
    desk: null,
    note: "Would refresh NG · ZA · EG · GH · RW · UG · TZ edges from tagged filings.",
  },
  {
    id: "dedupe-observations",
    cadence: "hourly",
    status: "stub",
    desk: null,
    note: "Would append-only dedupe indicator observations. No store connected.",
  },
  {
    id: "publish-signals",
    cadence: "on print",
    status: "stub",
    desk: null,
    note: "Would open a signal file only after a cited print lands.",
  },
  {
    id: "refresh-source-registry",
    cadence: "weekly",
    status: "idle",
    desk: null,
    note: "Would verify official door URLs. Pending sources stay pending.",
  },
  {
    id: "pack-assembly",
    cadence: "morning",
    status: "blocked",
    desk: "kenya",
    note: "Blocked until Auth and a Pro seat exist. No fake delivery.",
  },
  {
    id: "export-mint",
    cadence: "on request",
    status: "blocked",
    desk: null,
    note: "Blocked until Professional billing is live. No CSV minted.",
  },
];

export function jobsByStatus(status: IngestionJob["status"]) {
  return ingestionJobs.filter((job) => job.status === status);
}

/** Keep legacy import path used by /graph. */
export const scheduledJobs = ingestionJobs.map((job) => ({
  id: job.id,
  cadence: job.cadence,
  status: job.status,
  note: job.note,
}));
