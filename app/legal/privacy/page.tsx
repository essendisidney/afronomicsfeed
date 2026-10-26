import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/data/ProsePage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  alternates: { canonical: `${site.url}/legal/privacy` },
  description: "What Afronomics collects and why, under Kenya’s Data Protection Act, 2019: no data sold, no advertising trackers, page counts without cookies.",
};

export default function PrivacyPage() {
  return (
    <ProsePage crumbs={[{ href: "/", label: "Home" }, { label: "Privacy" }]} kicker="Legal" title="Privacy notice" lede="What we collect, why, and your rights under Kenya’s Data Protection Act, 2019.">
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Newsletter sign-ups</strong> — your email address and the sector you choose, to send the newsletter.
        </li>
        <li>
          <strong>Email rate alerts</strong> — your email address, the alert you chose (for example a rate level) and what we last told you
          about, so nothing is sent twice. Alert emails go out through our email provider. Nothing is sent until you confirm from the email we send; each alert email has a one-click stop
          link. Unconfirmed requests are deleted after 7 days and stopped alerts within 30 days.
        </li>
        <li>
          <strong>Phone alerts</strong> — for phone (push) alerts, only the browser’s push address and the markets you chose; no name or email.
        </li>
        <li>
          <strong>Enquiries and pilot requests</strong> — the name, email, organisation and message you send, to reply to you, run a pilot and
          keep a record of what was agreed. We note the stage of a conversation (for example “pilot” or “proposal”) and the next follow-up date.
        </li>
        <li>
          <strong>API keys</strong> — if you have a pilot or licence key, we count your calls per key, day and endpoint (for example which
          markets you query), to support you and to invoice. The key itself is stored only as a one-way hash.
        </li>
        <li>
          <strong>Prices, rates and stories you report</strong> — what you submit, plus any contact detail you choose to add. To stop one person
          voting many times, we keep a one-way code made from your connection and the day; it cannot be turned back into an IP address and changes daily.
        </li>
        <li>
          <strong>Feedback and one-question surveys</strong> — your answer (for example “Did you find it?”, “What would you pay for next?” or
          “What do you use this for?”), the page and your country as reported by our host. Answering is optional and anonymous; please don’t type
          personal details in the free-text box.
        </li>
        <li>
          <strong>Shillings found</strong> &mdash; when a money tool shows you a yearly difference against the best option we track, our server
          works it out again from the figures you typed and adds only the tool, the market, the currency and the difference to an anonymous daily
          total; your figures are not stored, and no cookie, IP address or device id is kept with it.
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
        host. Each count also says whether this browser has visited before, from a first-visit date kept only in your browser’s local storage. No cookie is set and no IP address, device identifier or other personal data is stored with the count.
      </p>
      <p>
        We also count a few actions the same way, one total per action, page, day and country: sign-ups, data downloads, clicks on share
        buttons, on pricing and pilot buttons and on links to a central bank’s own notice, the start and sending of a pilot request form, and
        survey answers. Nothing identifies who clicked.
      </p>
      <p>
        On stories, we count how far each page is read (a quarter, half, three quarters, the end) and whether it held someone’s attention for 30
        seconds or two minutes. To learn whether readers come back, your browser notes in its local storage the week of your first visit and
        sends one count the first time you return within a week, a month and three months. When a search on the site finds nothing, we keep the
        words searched, lowercased and stripped of punctuation; a search containing an email address or a long run of digits (such as a phone or
        ID number) is never sent. These too are only daily totals, with nothing that identifies you.
      </p>
      <h2>Why, and on what basis</h2>
      <ul>
        <li>Newsletter, alerts and surveys: your consent, which you can withdraw at any time (every email has a stop link).</li>
        <li>Enquiries, pilots, API keys and payments: to take steps you asked for and to perform our agreement with you.</li>
        <li>
          Anonymous counts and security logs: our legitimate interest in knowing which data is useful, what to build or price next, and keeping
          the site safe.
        </li>
      </ul>
      <p>
        Only the founder’s desk and tools we control under the same rules (including an AI assistant that helps sort and draft replies) read
        this data. Nobody else sees it, and it is never used to profile you for advertising.
      </p>
      <h2>Where it is kept</h2>
      <p>
        Data is stored with our hosting and database providers, which may process it outside Kenya under appropriate safeguards. Newsletter data
        is kept until you unsubscribe, alert data as described above; payment records as long as the law requires.
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
