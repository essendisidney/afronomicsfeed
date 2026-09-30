export type SearchHit = {
  href: string;
  title: string;
  kicker: string;
  summary: string;
};

export function searchIndex(query: string, index: SearchHit[], limit = 24): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return index.slice(0, limit);
  const terms = q.split(/\s+/);
  return index
    .map((hit) => {
      const title = hit.title.toLowerCase();
      const haystack = `${title} ${hit.kicker} ${hit.summary}`.toLowerCase();
      if (!terms.every((term) => haystack.includes(term))) return null;
      const score = (title.startsWith(q) ? 3 : 0) + (title.includes(q) ? 2 : 0) + 1;
      return { hit, score };
    })
    .filter((item): item is { hit: SearchHit; score: number } => item !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.hit);
}
