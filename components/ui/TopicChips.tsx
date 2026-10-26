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
              className="inline-flex min-h-9 items-center border border-forest/25 px-2.5 text-[12px] font-semibold text-forest hover:border-gold sm:min-h-7 sm:px-2"
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
              className="inline-flex min-h-9 items-center border border-rule px-2.5 font-medium text-[12px] text-ink-soft hover:border-gold sm:min-h-7 sm:px-2"
            >
              {topic.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
