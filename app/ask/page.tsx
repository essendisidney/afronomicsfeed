import type { Metadata } from "next";
import { PageShell } from "@/components/data/PageShell";
import { AskBox } from "@/components/ui/AskBox";
import { ask } from "@/lib/ask";
import { billMarkets } from "@/lib/data/sovereign-bills";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ask the data — African Treasury bill rates, answered from the source",
  description:
    "Ask a question about Treasury bill rates, auctions, demand, real yields or the Sovereign Bill Index in ten African markets and get the answer from the published results, with the source. No model writes the answer.",
  alternates: { canonical: `${site.url}/ask` },
};

const suggestions = ["What is Kenya's 91-day rate?", "When is the next Uganda auction?", "How much does KES 500,000 earn on the 364-day bill?", "Compare Nigeria and Ghana one-year rates", "What was Kenya's 364-day rate a year ago?", "Which market has the highest real yield?"];

export default async function AskPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const first = q ? await ask(q) : null;
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Ask the data" }]}
      kicker="Ask the data"
      title="A question about African rates, answered from the source"
      lede={
        <p>
          Type a question about Treasury bill rates, auctions, demand, real yields, what a sum would earn, or the Sovereign Bill Index in{" "}
          {billMarkets.length} markets. The answer is computed from the published results and carries its source. No language model writes it,
          so it cannot invent a number; if the question is outside the data, it says so.
        </p>
      }
    >
      {first ? (
        <noscript>
          <p className="mb-6 rounded-2xl border border-rule bg-surface px-5 py-4 text-[16px] leading-7 text-ink">{first.answer}</p>
        </noscript>
      ) : null}
      <div className="max-w-3xl">
        <AskBox initial={q ?? ""} suggestions={suggestions} />
      </div>
      <section className="mt-14 grid gap-8 md:grid-cols-3 text-sm leading-6 text-ink-soft">
        <div>
          <h3 className="font-serif text-xl text-ink">What it can answer</h3>
          <p className="mt-2">Current and past rates by tenor, the change at the last auction, when the next result is expected, how strong demand was, real yields after inflation, what a sum earns, and comparisons between markets.</p>
        </div>
        <div>
          <h3 className="font-serif text-xl text-ink">What it will not do</h3>
          <p className="mt-2">Predict, advise, or answer about anything outside the datasets. A question it does not understand gets “not in the data”, not a guess.</p>
        </div>
        <div>
          <h3 className="font-serif text-xl text-ink">In your own tools</h3>
          <p className="mt-2">
            The same answers are available as JSON at <code className="text-[13px]">/api/ask?q=…</code>, and the underlying data through the{" "}
            <a href="/developers" className="underline underline-offset-2">
              data API
            </a>
            .
          </p>
        </div>
      </section>
    </PageShell>
  );
}
