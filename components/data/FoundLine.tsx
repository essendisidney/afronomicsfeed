"use client";

import { useState } from "react";
import { ShareResult } from "@/components/ui/ShareResult";
import { foundName, money, toolLabel, type FoundResult } from "@/lib/found";
import { useFoundCount, type FoundPayload } from "@/lib/found-client";
import type { FoundFigures } from "@/lib/share";

/**
 * The "shillings found" line at the end of a money tool (lib/found.ts): the reader's option, the best or cheapest
 * option we hold for the same use, the yearly difference, and both sources. A positive difference is counted once per
 * page view (lib/found-client.ts). Sharing leaves the reader's figures out unless they tick "include my figures".
 * Nothing is shown when we hold no comparable option.
 */
export function FoundLine({
  result,
  payload,
  figures,
  lang = "en",
}: {
  result: FoundResult;
  /** What /api/found needs to recompute the result; null when nothing should be counted. */
  payload: FoundPayload | null;
  /** The reader's inputs for a share that includes them. */
  figures: FoundFigures;
  lang?: "en" | "sw";
}) {
  const [withMine, setWithMine] = useState(false);
  useFoundCount(result.status === "found" ? payload : null);
  if (result.status === "none" || !result.lines.length) return null;
  const found = result.status === "found";
  const name = foundName(result.currency, lang);
  const tool = toolLabel[result.tool][lang];
  const spec = { kind: "found" as const, tool: result.tool, market: result.market, mine: withMine ? figures : null };
  const shareText =
    lang === "sw"
      ? `${name} kwa ${tool} ya Afronomics: kila takwimu na chanzo chake. Angalia yako:`
      : withMine && found
        ? `${name} with ${tool}: ${money(result.currency, result.yearly)} a year, on published figures. Check yours:`
        : `${tool}: the ${result.tool === "save_check" || result.tool === "mmf" ? "best-earning" : "cheapest"} option we track, from the source. Check yours:`;
  return (
    <div data-found-tool={result.tool} data-found-status={result.status} className="mt-4 rounded-xl border border-rule bg-paper-2 px-4 py-4" aria-live="polite">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-sig-ink">{name}</p>
      {found ? (
        <p data-num className="af-figure tabular mt-1 inline-block font-serif text-[1.7rem] leading-tight text-ink">
          {money(result.currency, result.yearly)} {lang === "sw" ? "kwa mwaka" : "a year"}
        </p>
      ) : null}
      <div className="mt-2 space-y-1.5 text-[14.5px] leading-6 text-ink-soft">
        {result.lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
      {found ? (
        <p className="mt-2 text-[12px] leading-5 text-muted">
          {lang === "sw"
            ? "Tofauti inayoonyeshwa si pesa iliyohamishwa. Huhesabiwa bila jina katika jumla ya wasomaji."
            : "A difference shown is not money moved. It is added, anonymously, to the readers’ total."}{" "}
          <a href="/method#shillings-found" className="underline underline-offset-2">
            {lang === "sw" ? "Jinsi tunavyohesabu" : "How it is counted"}
          </a>
        </p>
      ) : null}
      <label className="mt-3 flex min-h-11 items-center gap-2 text-[13px] text-ink-soft sm:min-h-0">
        <input type="checkbox" checked={withMine} onChange={(e) => setWithMine(e.target.checked)} className="h-4 w-4 accent-[var(--sig)]" />
        {lang === "sw" ? "Weka takwimu zangu kwenye picha ya kushiriki" : "Include my figures in the share card"}
      </label>
      <ShareResult spec={spec} text={shareText} lang={lang} />
    </div>
  );
}
