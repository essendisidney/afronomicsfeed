import type { Metadata } from "next";
import { CheckoutNotice } from "@/components/billing/CheckoutNotice";
import { PageShell } from "@/components/data/PageShell";
import { JobPostForm } from "@/components/jobs/JobPostForm";
import { paystackConfigured } from "@/lib/billing/paystack";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Post a role — KES 10,000 for 30 days",
  description: "List a treasury, risk, research or analyst role in front of the people who read African market data. KES 10,000 for 30 days, paid by M-Pesa or card.",
  alternates: { canonical: `${site.url}/jobs/post` },
};

export default async function PostJobPage({ searchParams }: { searchParams: Promise<{ checkout?: string; reference?: string; trxref?: string }> }) {
  const query = await searchParams;
  return (
    <PageShell crumbs={[{ href: "/", label: "Home" }, { href: "/jobs", label: "Jobs" }, { label: "Post a role" }]} kicker="Jobs" title="Post a role" lede={<p>KES 10,000 for 30 days. Fill in the listing, pay from the same email, and it is live on its own within minutes. The desk checks that the institution is real and takes down anything that is not.</p>}>
      <CheckoutNotice query={query} />
      <div className="max-w-2xl">
        <JobPostForm live={paystackConfigured()} />
      </div>
    </PageShell>
  );
}
