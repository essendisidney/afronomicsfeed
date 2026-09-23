/**
 * Ingestion spine. Jobs are not live.
 * SOURCE → FETCH → VALIDATE → NORMALIZE → DEDUPE → RESOLVE → RAW → STRUCTURED → SIGNALS → PUBLISH
 */
export const ingestionStages = [
  "fetch",
  "validate",
  "normalize",
  "deduplicate",
  "resolve",
  "store_raw",
  "store_structured",
  "derive_signals",
  "publish",
] as const;
