import { urgencyLabel } from "@/lib/desk";
import type { ArticleFrontmatter } from "@/lib/types";

export function DeskMeta({
  urgency,
  minutes,
  fileFor,
}: Pick<ArticleFrontmatter, "urgency" | "minutes" | "fileFor">) {
  const urgencyText = urgencyLabel(urgency);
  if (!urgencyText && !minutes && !fileFor) return null;

  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
      {urgencyText ? <span className="text-gold">{urgencyText}</span> : null}
      {minutes ? <span>{minutes} min</span> : null}
      {fileFor ? <span>{fileFor}</span> : null}
    </p>
  );
}
