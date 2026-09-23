import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";

export const metadata: Metadata = {
  title: "Request access",
  description: "Request an Afronomics seat. Accounts are not provisioned in this build.",
};

export default function SignupPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Sign up" }]}
      kicker="Account"
      title="Request a seat"
      lede="Registration is closed until Auth and billing exist. Leave an email on the subscribe desk if you want the trial list."
    >
      <p className="max-w-xl text-sm leading-6 text-ink-soft">
        Use{" "}
        <Link href="/subscribe" className="text-forest underline underline-offset-2">
          subscribe
        </Link>{" "}
        for the Kenya desk waitlist, or{" "}
        <Link href="/advisory" className="text-forest underline underline-offset-2">
          advisory
        </Link>{" "}
        for institutional conversations.
      </p>
    </LayerPage>
  );
}
