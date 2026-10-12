import type { TbillAuction } from "@/lib/data/kenya-tbills";

/**
 * "Did my bid win?" and what a Kenyan Treasury bill pays: pure arithmetic, safe to run in the browser.
 * See lib/data/auction-intel.ts for the reasoning behind each verdict.
 */

export const WHT = 0.15;

/** The CBK's discount convention (365-day year); reproduces its published "price per Kshs 100". */
export const priceFor = (rate: number, days: number) => 100 / (1 + (rate * days) / 36500);

export type BidVerdict = "won" | "likely" | "unknown" | "noncompetitive";

export type BidCheck = {
  auction: TbillAuction;
  verdict: BidVerdict;
  why: string;
  pricePer100: number;
  cost: number;
  interest: number;
  tax: number;
  net: number;
  netYield: number; // after-tax return over the bill's life, annualised on the same 365-day basis, %
};

/** Was a bid accepted at the latest auction for its tenor, and what does the bill pay? Amount is face value in KES. */
export function checkBid(auction: TbillAuction, kind: "competitive" | "noncompetitive", amount: number, bidRate?: number): BidCheck {
  const avg = auction.weighted_avg_rate;
  const rate = kind === "noncompetitive" || bidRate == null ? avg : bidRate;
  let verdict: BidVerdict;
  let why: string;
  const takeUp = auction.received_kes_m && auction.accepted_kes_m ? auction.accepted_kes_m / auction.received_kes_m : null;
  if (kind === "noncompetitive") {
    verdict = "noncompetitive";
    why = `Non-competitive bids (up to KES 50 million per account per tenor) are issued at the weighted average of accepted bids: ${avg.toFixed(4)}%.`;
  } else if (rate <= avg + 1e-9) {
    verdict = "won";
    why = `Your rate is at or below the average accepted rate of ${avg.toFixed(4)}%. The highest accepted rate (the cut-off) cannot be below the average, so your bid was accepted, unless the CBK pro-rated bids at a common rate.`;
  } else if (takeUp != null && takeUp >= 0.99) {
    verdict = "likely";
    why = `Your rate is above the average of ${avg.toFixed(4)}%, but the CBK accepted ${(takeUp * 100).toFixed(1)}% of all the money bid, so nearly every bid was taken.`;
  } else {
    verdict = "unknown";
    why = `Your rate is ${(rate - avg).toFixed(4)} points above the average accepted rate of ${avg.toFixed(4)}%. The CBK does not publish the cut-off rate, so whether it was accepted depends on it${takeUp != null ? ` (it accepted ${(takeUp * 100).toFixed(1)}% of the money bid)` : ""}. Your DhowCSD account shows the answer.`;
  }
  const pricePer100 = priceFor(rate, auction.tenor);
  const cost = (amount * pricePer100) / 100;
  const interest = amount - cost;
  const tax = interest * WHT;
  const net = interest - tax;
  const netYield = (net / cost) * (36500 / auction.tenor);
  return { auction, verdict, why, pricePer100, cost, interest, tax, net, netYield };
}

