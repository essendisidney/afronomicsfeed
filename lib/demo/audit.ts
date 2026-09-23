export type AuditEvent = {
  id: string;
  action: string;
  actor: string;
  target: string;
  at: string | null;
  note: string;
};

/** Editorial audit log. Always empty until CMS writes are live. */
export function auditEvents(): AuditEvent[] {
  return [];
}

export const auditActions = [
  {
    slug: "article-publish",
    label: "Publish article",
    lede: "Would record who filed a Markdown piece and when.",
  },
  {
    slug: "edge-upsert",
    label: "Upsert graph edge",
    lede: "Would log entity-resolution writes. No silent overwrite.",
  },
  {
    slug: "correction-file",
    label: "File correction",
    lede: "Public corrections stay at /corrections. Audit would mirror the actor.",
  },
  {
    slug: "export-mint",
    label: "Mint export",
    lede: "Would stamp seat and as-of on a CSV. Mint is offline.",
  },
] as const;
