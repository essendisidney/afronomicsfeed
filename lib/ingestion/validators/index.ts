export function requireSource(record: { sourceId?: string }) {
  if (!record.sourceId) {
    return { ok: false as const, reason: "missing_source" };
  }
  return { ok: true as const };
}
