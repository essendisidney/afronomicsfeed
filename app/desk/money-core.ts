/** A data key as af_api_keys_list returns it. */
export type PilotKey = { id: number; label: string; plan: string; created_at: string; revoked_at: string | null; last_used_at: string | null; calls_30d: number };

/** Payments are stored in the currency's subunit; perUsd is units of that currency per US dollar. */
export function toUsd(rows: { currency: string | null; amount: number }[], perUsd: Record<string, number>) {
  let total = 0;
  const unconverted: string[] = [];
  for (const r of rows) {
    const code = (r.currency ?? "KES").toUpperCase();
    const rate = perUsd[code];
    if (rate) total += r.amount / 100 / rate;
    else if (r.amount) unconverted.push(code);
  }
  return { total, unconverted };
}
