import type { Metadata } from "next";
import { ProsePage } from "@/components/data/ProsePage";
import { disclaimer } from "@/lib/site";

export const metadata: Metadata = { title: "Disclaimer" };

export default function DisclaimerPage() {
  return (
    <ProsePage crumbs={[{ href: "/", label: "Home" }, { label: "Disclaimer" }]} kicker="Legal" title="Disclaimer">
      <p>{disclaimer}</p>
      <p>
        Data is compiled from third-party publishers and shown as they print it. Publishers revise figures; we refresh on the schedule set out
        on the sources page, and there may be a delay. Currency references are indicative mid-market rates, not rates at which you can deal.
      </p>
      <p>
        Headlines on the Wire are the work of their publishers. We do not verify or endorse third-party reporting; follow the link to read it in
        context.
      </p>
      <p>
        Nothing on this site is an offer or solicitation to deal in securities, deposits or insurance products, and nothing is tailored to your
        circumstances. Check the linked primary source before relying on any figure, and take professional advice before acting.
      </p>
    </ProsePage>
  );
}
