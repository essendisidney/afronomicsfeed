import type { SourcedPrint } from "./worldbank";
import { worldBankDoor } from "./worldbank";

export type StoreResult = {
  written: number;
  skipped: boolean;
  reason: string | null;
};

type IdRow = { id: string; slug?: string; iso2?: string };

function storeConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

async function rest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cfg = storeConfig();
  if (!cfg) throw new Error("Observation store credentials are not set.");
  const response = await fetch(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail.slice(0, 240) || `Store request failed (${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function sourceId(): Promise<string> {
  const existing = await rest<IdRow[]>(
    `sources?url=eq.${encodeURIComponent(worldBankDoor)}&select=id&limit=1`,
  );
  if (existing[0]?.id) return existing[0].id;
  const created = await rest<IdRow[]>("sources", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      publisher: "World Bank",
      url: worldBankDoor,
      document_title: "World Bank Open Data API",
      dataset: "annual indicators",
      confidence: "secondary_source",
      methodology: "Structured API. A row is written only when a finite value and a year are present.",
      retrieved_at: new Date().toISOString(),
    }),
  });
  const id = created[0]?.id;
  if (!id) throw new Error("World Bank source row was not created.");
  return id;
}

/** Appends parsed prints. Identical vintages are left as they are. */
export async function storePrints(prints: SourcedPrint[]): Promise<StoreResult> {
  if (!storeConfig()) {
    return {
      written: 0,
      skipped: true,
      reason: "SUPABASE_SERVICE_ROLE_KEY is not set, so this run does not write the observation table.",
    };
  }
  if (prints.length === 0) {
    return { written: 0, skipped: false, reason: "No parsed value to store." };
  }

  try {
    const source = await sourceId();
    const indicators = await rest<IdRow[]>("economic_indicators?select=id,slug");
    const countryRows = await rest<IdRow[]>("countries?select=id,iso2");
    const indicatorId = new Map(indicators.flatMap((row) => (row.slug ? [[row.slug, row.id] as const] : [])));
    const countryId = new Map(
      countryRows.flatMap((row) => (row.iso2 ? [[row.iso2.toUpperCase(), row.id] as const] : [])),
    );
    const existing = await rest<Array<{ indicator_id: string; country_id: string; observation_date: string; value: number }>>(
      `indicator_observations?source_id=eq.${source}&select=indicator_id,country_id,observation_date,value`,
    );
    const seen = new Set(
      existing.map((row) => `${row.indicator_id}|${row.country_id}|${row.observation_date}|${Number(row.value)}`),
    );

    const rows = prints.flatMap((print) => {
      const indicator = indicatorId.get(print.indicatorSlug);
      const country = countryId.get(print.iso);
      if (!indicator || !country) return [];
      const key = `${indicator}|${country}|${print.observationDate}|${print.value}`;
      if (seen.has(key)) return [];
      return [{
        indicator_id: indicator,
        country_id: country,
        geography: print.countryName,
        value: print.value,
        unit: print.unit,
        source_id: source,
        observation_date: print.observationDate,
        status: "secondary_source",
        methodology: `World Bank Open Data series ${print.seriesCode} (${print.seriesName}). Latest non-null annual value. The date is 1 January of the published year.`,
      }];
    });

    if (rows.length === 0) return { written: 0, skipped: false, reason: null };
    await rest("indicator_observations", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(rows),
    });
    return { written: rows.length, skipped: false, reason: null };
  } catch (error) {
    return {
      written: 0,
      skipped: true,
      reason: error instanceof Error ? error.message : "The observation write failed.",
    };
  }
}
