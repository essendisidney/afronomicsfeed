import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/data/ProsePage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <ProsePage crumbs={[{ href: "/", label: "Home" }, { label: "Privacy" }]} kicker="Legal" title="Privacy notice" lede="What we collect, why, and your rights under Kenya’s Data Protection Act, 2019.">
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Newsletter sign-ups</strong> — your email address and the sector you choose, to send the newsletter.
        </li>
        <li>
          <strong>Payments</strong> — if you subscribe, Paystack processes your payment. We receive your email, plan and payment status, never
          your full card details.
        </li>
        <li>
          <strong>Emails you send us</strong> — kept to answer you and to keep a record of corrections and agreements.
        </li>
        <li>
          <strong>Server logs</strong> — our host records standard request data (IP address, browser, pages) for security and reliability.
        </li>
      </ul>
      <h2>What we don’t do</h2>
      <p>We don’t sell or rent personal data, and we don’t run advertising trackers.</p>
      <p>
        To know which pages are read, we count page views: the page, the day, the referring website and the visitor’s country as reported by our
        host. No cookie is set and no IP address, device identifier or other personal data is stored with the count.
      </p>
      <h2>Where it is kept</h2>
      <p>
        Data is stored with our hosting and database providers, which may process it outside Kenya under appropriate safeguards. Newsletter data
        is kept until you unsubscribe; payment records as long as the law requires.
      </p>
      <h2>Your rights</h2>
      <p>
        You can ask to see, correct or delete your data, or object to its use, by writing to{" "}
        <a href={`mailto:${site.contactEmail}?subject=Privacy`}>{site.contactEmail}</a>. You may also complain to the Office of the Data
        Protection Commissioner. See also <Link href="/legal/cookies">cookies</Link>.
      </p>
    </ProsePage>
  );
}
