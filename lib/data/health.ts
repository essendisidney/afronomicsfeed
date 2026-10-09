import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

/** Data health, written by scripts/data_health.py at the end of each data run (see that file for the rules). */
export type HealthStatus = "ok" | "late" | "failed" | "gap";
export type HealthItem = { area: string; name: string; status: HealthStatus; detail: string; latest: string | null; due_by: string | null; link: string | null };
export type Health = { checked_on: string; summary: Record<HealthStatus, number>; items: HealthItem[] };

const FILE = path.join(process.cwd(), "data", "health.json");

export const loadHealth = cache((): Health | null => (fs.existsSync(FILE) ? (JSON.parse(fs.readFileSync(FILE, "utf8")) as Health) : null));

export const statusLabel: Record<HealthStatus, string> = {
  ok: "Up to date",
  late: "Late",
  failed: "Not read",
  gap: "Not available",
};
