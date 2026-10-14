import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import type { Article } from "@/lib/types";

/** Stories about government debt and policy rates: the readers most likely to run a fixed income desk. */
const DEBT_TOPICS = new Set(["treasury-bills", "mpc"]);

/** Market-data stories get the institutional pilot offer; saver guides (learn-*) and other topics do not. */
export function showsPilotCta(article: Pick<Article, "slug" | "topics">) {
  return !article.slug.startsWith("learn-") && (article.topics ?? []).some((t) => DEBT_TOPICS.has(t));
}

/**
 * End-of-story offer of the 30-day pilot. The link carries ?from=story-<slug> so a pilot request made from it is
 * attributed to the story (PilotForm sends it as the lead's source), and the click counts as pricing_cta_click on the
 * story's own path.
 */
export function PilotCta({ slug }: { slug: string }) {
  return (
    <aside aria-labelledby="pilot-cta" className="no-print mt-8 rounded-3xl border-2 border-forest/30 bg-surface px-6 py-6 sm:px-8 sm:py-7">
      <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-forest">For desks and funds · free for 30 days</p>
      <h2 id="pilot-cta" className="mt-2 font-serif text-[1.45rem] leading-tight text-balance text-ink sm:text-[1.7rem]">
        Run a fixed income book? Take the full auction history behind this story.
      </h2>
      <p className="mt-3 max-w-[60ch] text-[15px] leading-6 text-ink-soft">
        Every bill and bond auction we cover, in one format, each line linked to the issuer&rsquo;s notice, by API or CSV.
        Five questions, no payment details.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <ButtonLink href={`/data/frontier-local-debt?from=story-${slug}#pilot`} data-track="pricing_cta_click">
          Start a 30-day pilot
        </ButtonLink>
        <Link
          href="/licensing#local"
          className="inline-flex min-h-11 items-center justify-center px-2 text-[14px] font-semibold text-forest underline underline-offset-4 sm:justify-start"
        >
          Prices for local institutions
        </Link>
      </div>
    </aside>
  );
}
