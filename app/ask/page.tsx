import type { Metadata } from "next";
import Link from "next/link";
import { AskPanel } from "@/components/ask/AskPanel";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { askQuestions } from "@/lib/demo/ask";

export const metadata: Metadata = {
  title: "Ask Afronomics",
  description: "Retrieval-only answers with citations. The index is not connected; no invented numbers.",
};

export default function AskPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Ask" }]}
      kicker="Ask Afronomics"
      title="Answers from the file, or no answer"
      lede="Questions retrieve stored documents and observations. Model text cannot write a verified GDP, FX print, or funding ticket. Citations are mandatory."
    >
      <AskPanel />
      <p className="mt-6 text-sm">
        <Link href="/ask/corpus" className="text-forest underline underline-offset-2">
          Corpus slots
        </Link>
        {" · "}
        <Link href="/exports" className="text-forest underline underline-offset-2">
          Exports
        </Link>
        {" · "}
        <Link href="/graph" className="text-forest underline underline-offset-2">
          Graph
        </Link>
      </p>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Question files</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
          Each question has a file that lists what it would retrieve. The index is empty, so the desk refuses.
        </p>
        <ul className="mt-4 space-y-3">
          {askQuestions.map((item) => (
            <li key={item.slug} className="border-b border-rule pb-3">
              <Link href={`/ask/${item.slug}`} className="font-serif text-xl hover:text-forest">
                {item.title}
              </Link>
              <p className="mt-1 text-sm text-muted">{item.lede}</p>
            </li>
          ))}
        </ul>
      </section>
    </LayerPage>
  );
}
