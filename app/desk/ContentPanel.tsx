import Link from "next/link";
import { SectionTitle } from "@/components/data/parts";
import { TableScroll } from "@/components/ui/DataTable";

/**
 * What was published in the last 7 days (stories from data/story_log.json, LinkedIn posts from editions/social/log)
 * and the traffic each campaign brought (page_views by utm campaign). Post links carry utm_source, so a click is
 * counted as "utm:<source>/<campaign>".
 */

export type Campaign = { campaign: string; views_7d: number; people_7d: number | null; views_30d: number | null; top_path: string | null };

export function ContentPanel({
  stories,
  posts,
  briefViews,
  campaigns,
  campaignsNote,
}: {
  stories: { date: string; slug: string; market?: string }[];
  posts: { date: string; title: string; url: string | null }[];
  briefViews: Map<string, { views_7d: number; views_30d: number; linkedin_30d: number }> | null;
  campaigns: Campaign[];
  campaignsNote: string;
}) {
  return (
    <section id="content" className="scroll-mt-20">
      <SectionTitle
        kicker="Content · last 7 days"
        title={`${stories.length} stor${stories.length === 1 ? "y" : "ies"}, ${posts.length} LinkedIn post${posts.length === 1 ? "" : "s"}`}
        note="Stories and posts as logged in the repository at the last deploy (a commit that only touches editions/ does not redeploy). Traffic is live."
      />
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div>
          <p className="text-[13px] font-semibold text-ink">Stories</p>
          {stories.length ? (
            <ul className="mt-2 divide-y divide-rule">
              {stories.map((s) => {
                const v = briefViews?.get(`/brief/${s.slug}`);
                return (
                  <li key={s.slug} className="py-2 text-sm">
                    <Link href={`/brief/${s.slug}`} className="font-medium text-ink hover:text-forest [overflow-wrap:anywhere]">
                      {s.slug.replace(/-/g, " ")}
                    </Link>
                    <span className="block text-[12px] text-muted">
                      {s.date}
                      {s.market ? ` · ${s.market}` : ""} ·{" "}
                      {v ? `${v.views_7d} views in 7 d · ${v.views_30d} in 30 d (${v.linkedin_30d} from LinkedIn)` : briefViews ? "no views yet" : "views need migration 0040"}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">No story published in the last 7 days (the story engine runs Mon, Wed, Fri).</p>
          )}
          <p className="mt-4 text-[13px] font-semibold text-ink">LinkedIn company posts</p>
          {posts.length ? (
            <ul className="mt-2 divide-y divide-rule">
              {posts.map((p, i) => (
                <li key={`${p.date}-${i}`} className="py-2 text-sm">
                  {p.url ? (
                    <a href={p.url} className="text-ink hover:text-forest [overflow-wrap:anywhere]" target="_blank" rel="noopener noreferrer">
                      {p.title}
                    </a>
                  ) : (
                    <span className="text-ink [overflow-wrap:anywhere]">{p.title}</span>
                  )}
                  <span className="block text-[12px] text-muted">
                    {p.date}
                    {p.url ? "" : " · no post link logged"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">No post logged in editions/social/log in the last 7 days.</p>
          )}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-ink">Traffic by campaign</p>
          {campaigns.length ? (
            <TableScroll label="Traffic by campaign" className="mt-2">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th className="text-right">People 7 d</th>
                    <th className="text-right">Views 7 d</th>
                    <th className="text-right">30 d</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.campaign}>
                      <td className="text-xs">
                        {c.campaign}
                        {c.top_path ? <span className="block text-[11px] text-muted [overflow-wrap:anywhere]">top: {c.top_path}</span> : null}
                      </td>
                      <td className="text-right text-xs">{c.people_7d ?? "—"}</td>
                      <td className="text-right text-xs font-semibold">{c.views_7d}</td>
                      <td className="text-right text-xs">{c.views_30d ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
          ) : (
            <p className="mt-2 text-sm text-muted">No tagged visits yet.</p>
          )}
          <p className="mt-1 text-[11px] text-muted">{campaignsNote}</p>
        </div>
      </div>
    </section>
  );
}
