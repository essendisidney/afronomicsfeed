import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { storedSurveyCount, surveySlots } from "@/lib/demo/surveys";

export const metadata: Metadata = {
  title: "Surveys",
  description: "Survey shapes for Afronomics Feed. No reading is stored.",
};

export default function SurveysPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Surveys" }]}
      kicker="Surveys"
      title="What a survey would measure"
      lede="A slot stays empty until a named publisher, a date and a cited instrument exist. This page does not store a sample reading."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{surveySlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedSurveyCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/releases" className="text-forest underline underline-offset-2">
          Releases
        </Link>
        {" · "}
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
        {" · "}
        <Link href="/footnotes" className="text-forest underline underline-offset-2">
          Footnotes
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {surveySlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Survey shapes" methodology="Stored count is zero. No reading is attached." />
    </LayerPage>
  );
}
