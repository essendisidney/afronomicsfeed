import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/data/ProsePage";

export const metadata: Metadata = {
  title: "Cookies",
  description: "How Afronomics uses cookies and local storage.",
};

export default function CookiesPage() {
  return (
    <ProsePage crumbs={[{ href: "/", label: "Home" }, { href: "/legal/privacy", label: "Legal" }, { label: "Cookies" }]} kicker="Legal" title="Cookies">
      <p>Afronomics does not use advertising or cross-site tracking cookies.</p>
      <ul>
        <li>
          <strong>Theme preference</strong> — your light or dark choice is kept in your browser’s local storage. It never leaves your device.
        </li>
        <li>
          <strong>Payments</strong> — when you pay, Paystack’s hosted checkout sets its own cookies under its own policy.
        </li>
        <li>
          <strong>Hosting</strong> — our host may use strictly necessary cookies for security and performance.
        </li>
      </ul>
      <p>
        If this changes, this page changes first. See also the <Link href="/legal/privacy">privacy notice</Link>.
      </p>
    </ProsePage>
  );
}
