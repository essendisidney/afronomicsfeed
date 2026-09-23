import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Afronomics accounts use Supabase Auth when the project is provisioned. Sign-in is not live.",
};

export default function LoginPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Sign in" }]}
      kicker="Account"
      title="Sign-in is not connected"
      lede="Supabase Auth is the planned door. This form does not create a session and will not pretend that it did."
    >
      <form className="max-w-md border border-rule p-6" action="/login" method="get">
        <label className="block text-sm">
          Email
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full border border-rule bg-paper px-3 py-2"
            autoComplete="email"
          />
        </label>
        <p className="mt-4 text-sm text-muted">
          Submitting returns you here. Provision Auth, then replace this page with a server action.
        </p>
        <button
          type="submit"
          className="mt-4 bg-forest px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-paper"
        >
          Request magic link (not live)
        </button>
      </form>
      <p className="mt-6 text-sm">
        No account yet?{" "}
        <Link href="/signup" className="text-forest underline underline-offset-2">
          Request access
        </Link>
        . Current seat:{" "}
        <Link href="/account" className="text-forest underline underline-offset-2">
          Account
        </Link>
        .
      </p>
    </LayerPage>
  );
}
