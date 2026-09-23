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
      <form className="mt-2 max-w-md border border-rule p-6" action="/signup" method="get">
        <label className="block text-sm">
          Work email
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full border border-rule bg-paper px-3 py-2"
            autoComplete="email"
          />
        </label>
        <p className="mt-4 text-sm text-muted">
          Submitting returns you here. No account is created until Auth is provisioned.
        </p>
        <button
          type="submit"
          className="mt-4 bg-forest px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-paper"
        >
          Request seat (not live)
        </button>
      </form>
      <p className="mt-8 max-w-xl text-sm leading-6 text-ink-soft">
        Prefer the Kenya desk waitlist?{" "}
        <Link href="/subscribe" className="text-forest underline underline-offset-2">
          Subscribe
        </Link>
        . Institutional?{" "}
        <Link href="/advisory" className="text-forest underline underline-offset-2">
          Advisory
        </Link>
        . See your current seat on{" "}
        <Link href="/account" className="text-forest underline underline-offset-2">
          account
        </Link>
        .
      </p>
    </LayerPage>
  );
}
