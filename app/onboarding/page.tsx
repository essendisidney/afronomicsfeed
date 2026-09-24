import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { completedOnboarding, onboardingSteps } from "@/lib/demo/onboarding";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Path for a new Afronomics seat. Progress stays empty until Auth is live.",
};

export default function OnboardingPage() {
  const done = completedOnboarding();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Onboarding" }]}
      kicker="Onboarding"
      title="Learn the desk before a seat"
      lede="Steps are open to every visitor. Gated means Auth or a Pro seat is required — this build does not invent a completed checklist."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Steps</p>
          <p className="mt-1 font-serif text-xl">{onboardingSteps.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Completed</p>
          <p className="mt-1 font-serif text-xl">{done.length}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/glossary" className="text-forest underline underline-offset-2">
          Glossary
        </Link>
        {" · "}
        <Link href="/layers" className="text-forest underline underline-offset-2">
          Layers
        </Link>
        {" · "}
        <Link href="/coverage" className="text-forest underline underline-offset-2">
          Coverage
        </Link>
        {" · "}
        <Link href="/account" className="text-forest underline underline-offset-2">
          Account
        </Link>
        {" · "}
        <Link href="/pricing" className="text-forest underline underline-offset-2">
          Pricing
        </Link>
      </p>

      <ol className="mt-10 list-decimal space-y-4 pl-5">
        {onboardingSteps.map((step) => (
          <li key={step.slug} className="border-b border-rule pb-3 pl-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{step.status}</p>
            <Link href={step.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {step.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{step.lede}</p>
          </li>
        ))}
      </ol>

      <Provenance source="No progress store" methodology="Completed stays zero until Auth marks a step." />
    </LayerPage>
  );
}
