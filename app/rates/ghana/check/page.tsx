import type { Metadata } from "next";
import { CountryCheck } from "@/components/data/CountryCheck";
import { ghanaBench } from "@/lib/data/west-africa-rates";
import { site } from "@/lib/site";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const b = ghanaBench();
  return {
    title: b
      ? `Is my interest rate fair? Ghana: banks pay ${b.savingsAvg.toFixed(2)}% on savings, the government ${b.save[0].rate.toFixed(2)}%`
      : "Is my rate fair? Check a Ghana savings or loan rate",
    description:
      "Type the rate a Ghanaian bank, savings and loans company or lender offered you and compare it with Treasury bills and the Bank of Ghana's averages for savings, time deposits and bank lending, with the gap in cedis.",
    alternates: { canonical: `${site.url}/rates/ghana/check` },
  };
}

export default function GhanaCheckPage() {
  const b = ghanaBench();
  return (
    <CountryCheck
      slug="ghana"
      bench={b}
      intro={
        <p>
          A saver who knows the government pays {b ? `${b.save[0].rate.toFixed(2)}%` : "far more"} on its bills can judge the{" "}
          {b ? `${b.savingsAvg.toFixed(2)}%` : "low rate"} banks pay on savings on average. A borrower who knows banks charge {b ? `${b.lendRef.rate.toFixed(2)}%` : "the average lending rate"} on average can
          judge the rate a lender quotes. Type yours; the comparison uses only the Bank of Ghana&rsquo;s own figures.
        </p>
      }
    />
  );
}
