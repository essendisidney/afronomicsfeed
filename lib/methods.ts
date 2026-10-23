import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";

/**
 * The published method documents of the Afronomics reference rates (content/methods/*.md): the ASBI and KCCI methods,
 * the ASBI revision log, and the governance document both share.
 */

export type MethodSlug = "asbi" | "asbi-revisions" | "kcci" | "governance";

export type MethodDoc = {
  slug: MethodSlug;
  title: string;
  version: string | null;
  inForceSince: string | null;
  documented: string | null;
  nextReview: string | null;
  status: string | null;
  body: string;
};

const DIR = path.join(process.cwd(), "content", "methods");
const str = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? null : String(v));

export const loadMethod = cache((slug: MethodSlug): MethodDoc => {
  const { data, content } = matter(fs.readFileSync(path.join(DIR, `${slug}.md`), "utf8"));
  return {
    slug,
    title: String(data.title ?? slug),
    version: str(data.version),
    inForceSince: str(data.in_force_since),
    documented: str(data.documented ?? data.updated),
    nextReview: str(data.next_review),
    status: str(data.status),
    body: content.trim(),
  };
});
