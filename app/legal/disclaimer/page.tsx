import type { Metadata } from "next";
import { ProsePage } from "@/components/data/ProsePage";
import { disclaimer } from "@/lib/site";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Disclaimer",
  alternates: { canonical: `${site.url}/legal/disclaimer` },
  description: "Afronomics publishes information, not investment, legal or tax advice. How the data is sourced and the limits of relying on it.",
};

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
        Rankings and league tables (for example of money market funds, loan costs or money-transfer services) order published or reported figures
        by one stated measure. They are not ratings or recommendations, they do not weigh risk, fees or suitability unless they say so, and past
        yields or prices are not a guide to future returns.
      </p>
      <p>
        Nothing on this site is an offer or solicitation to deal in securities, deposits or insurance products, and nothing is tailored to your
        circumstances. Check the linked primary source before relying on any figure, and take professional advice before acting.
      </p>
    </ProsePage>
  );
}
