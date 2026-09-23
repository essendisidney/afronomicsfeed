import Link from "next/link";
import { getInstitution, getTopic } from "@/lib/taxonomy";

export function TopicChips({
  topics = [],
  institutions = [],
}: {
  topics?: string[];
  institutions?: string[];
}) {
  if (topics.length === 0 && institutions.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {institutions.map((slug) => {
        const institution = getInstitution(slug);
        if (!institution) return null;
        return (
          <li key={`inst-${slug}`}>
            <Link
              href={`/institutions/${slug}`}
              className="border border-forest/25 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-forest hover:border-gold"
            >
              {institution.short}
            </Link>
          </li>
        );
      })}
      {topics.map((slug) => {
        const topic = getTopic(slug);
        if (!topic) return null;
        return (
          <li key={`topic-${slug}`}>
            <Link
              href={`/topics/${slug}`}
              className="border border-rule px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft hover:border-gold"
            >
              {topic.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
