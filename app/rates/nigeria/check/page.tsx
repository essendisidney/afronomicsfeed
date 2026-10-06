import type { Metadata } from "next";
import { CountryCheck } from "@/components/data/CountryCheck";
import { nigeriaBench } from "@/lib/data/west-africa-rates";
import { site } from "@/lib/site";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const b = nigeriaBench();
  return {
    title: b
      ? `Is my interest rate fair? Nigeria: banks pay ${b.savingsAvg.toFixed(2)}% on savings, the government ${b.save[0].rate.toFixed(2)}%`
      : "Is my rate fair? Check a Nigeria savings or loan rate",
    description:
      "Type the rate a Nigerian bank, cooperative or lender offered you and compare it with Treasury bills, the FGN Savings Bond and the Central Bank of Nigeria's averages for savings, prime and maximum lending rates, with the gap in naira.",
    alternates: { canonical: `${site.url}/rates/nigeria/check` },
  };
}

export default function NigeriaCheckPage() {
  const b = nigeriaBench();
  return (
    <CountryCheck
      slug="nigeria"
      bench={b}
      intro={
        <p>
          A saver who knows the government pays {b ? `${b.save[0].rate.toFixed(2)}%` : "far more"} can judge the {b ? `${b.savingsAvg.toFixed(2)}%` : "low rate"}{" "}
          banks pay on savings on average. A borrower who knows banks charge their best customers {b ? `${b.lendRef.rate.toFixed(2)}%` : "the prime rate"} can
          judge the rate a lender quotes. Type yours; the comparison uses only the central bank&rsquo;s and debt office&rsquo;s own figures.
        </p>
      }
    />
  );
}
