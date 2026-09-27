/**
 * Ingestion spine. The prints agent is the live reader.
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
