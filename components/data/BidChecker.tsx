"use client";

import { useState } from "react";
import { checkBid } from "@/lib/auction-math";
import type { TbillAuction, Tenor } from "@/lib/data/kenya-tbills";

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;
const verdictLabel = { won: "Accepted", likely: "Almost certainly accepted", unknown: "Can't tell from the CBK's figures", noncompetitive: "Issued at the average rate" } as const;
const verdictTone = { won: "border-forest bg-forest/10", likely: "border-forest bg-forest/5", unknown: "border-accent bg-accent/5", noncompetitive: "border-forest bg-forest/10" } as const;

/** "Did my bid win?" for the latest auction, and what the bill pays after tax. Everything runs in the browser. */
export function BidChecker({ auctions }: { auctions: Partial<Record<Tenor, TbillAuction>> }) {
  const available = ([91, 182, 364] as Tenor[]).filter((t) => auctions[t]);
  const [tenor, setTenor] = useState<Tenor>(available.includes(364) ? 364 : available[0]);
  const [kind, setKind] = useState<"competitive" | "noncompetitive">("noncompetitive");
  const [amount, setAmount] = useState("100000");
  const [rate, setRate] = useState("");
  const auction = auctions[tenor];
  if (!auction) return null;
  const face = Math.max(0, Number(amount.replace(/[^\d.]/g, "")) || 0);
  const bid = Number(rate);
  const ready = face > 0 && (kind === "noncompetitive" || (rate !== "" && Number.isFinite(bid) && bid > 0 && bid < 60));
  const result = ready ? checkBid(auction, kind, face, kind === "competitive" ? bid : undefined) : null;
  const field = "mt-1 w-full rounded-lg border border-rule bg-surface px-3 py-2 text-[15px] text-ink";

  return (
    <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-[13px] text-ink-soft">
          Bill
          <select className={field} value={tenor} onChange={(e) => setTenor(Number(e.target.value) as Tenor)}>
            {available.map((t) => (
              <option key={t} value={t}>
                {t}-day, auction of {auctions[t]!.value_date}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[13px] text-ink-soft">
          Your bid
          <select className={field} value={kind} onChange={(e) => setKind(e.target.value as "competitive" | "noncompetitive")}>
            <option value="noncompetitive">Non-competitive (no rate)</option>
            <option value="competitive">Competitive (I chose a rate)</option>
          </select>
        </label>
        <label className="text-[13px] text-ink-soft">
          Face value (KES)
          <input className={field} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        {kind === "competitive" ? (
          <label className="text-[13px] text-ink-soft">
            Rate you bid (%)
            <input className={field} inputMode="decimal" placeholder="e.g. 9.10" value={rate} onChange={(e) => setRate(e.target.value)} />
          </label>
        ) : null}
      </div>

      {result ? (
        <div className={`mt-5 rounded-xl border-l-4 px-4 py-4 ${verdictTone[result.verdict]}`}>
          {kind === "competitive" && face < 2_000_000 ? (
            <p className="mb-2 text-[13px] font-medium text-accent">Competitive bids need a face value of at least KES 2 million; below that, bid non-competitive.</p>
          ) : kind === "noncompetitive" && face < 50_000 ? (
            <p className="mb-2 text-[13px] font-medium text-accent">The minimum non-competitive bid is KES 50,000.</p>
          ) : null}
          <p className="font-semibold text-ink">{verdictLabel[result.verdict]}</p>
          <p className="mt-1 text-[14px] leading-6 text-ink-soft">{result.why}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-[14px] sm:grid-cols-4">
            <div>
              <dt className="text-[12px] text-muted">You pay</dt>
              <dd className="font-semibold text-ink">{kes(result.cost)}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-muted">You get back</dt>
              <dd className="font-semibold text-ink">{kes(face)}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-muted">Interest after 15% tax</dt>
              <dd className="font-semibold text-ink">{kes(result.net)}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-muted">After-tax return, a year</dt>
              <dd className="font-semibold text-ink">{result.netYield.toFixed(2)}%</dd>
            </div>
          </dl>
          <p className="mt-3 text-[12px] text-muted">
            Price per KES 100: {result.pricePer100.toFixed(4)} (the CBK’s 365-day convention). Withholding tax {kes(result.tax)}. Minimum bids: KES 50,000
            non-competitive, KES 2 million competitive.
          </p>
        </div>
      ) : (
        <p className="mt-4 text-[13px] text-muted">Enter the rate you bid to see the answer.</p>
      )}
    </div>
  );
}
