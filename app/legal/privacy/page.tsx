import type { Metadata } from "next";
import Link from "next/link";
import { DraftBanner } from "@/components/ui/DraftBanner";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <PageHeader kicker="Legal" title="Privacy" lede="A holding text until counsel reviews a full policy." />
      <div className="mt-8">
        <DraftBanner>this privacy notice is not in force.</DraftBanner>
      </div>
      <div className="article-body mt-8">
        <p>
          This draft describes intended practice for a filesystem-published
          intelligence site: we expect to collect only what a subscribe or
          advisory form needs (work email, desk, institution) once billing and
          hosting analytics are specified.
        </p>
        <p>
          This build does not operate live payments, accounts, or a customer
          database. Mock Sign in does not create a session. Do not send
          passwords or customer data through these stubs.
        </p>
        <p>
          Official policy, lawful bases, retention, and cross-border language
          will replace this page after counsel review. Cookie posture:{" "}
          <Link href="/legal/cookies">cookies</Link>.
        </p>
      </div>
    </div>
  );
}
