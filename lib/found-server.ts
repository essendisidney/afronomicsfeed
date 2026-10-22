import { capFor, countable, foundLoan, foundMmf, foundRemit, foundSave, type FoundCurrency, type FoundInput, type FoundResult, type FoundTool } from "@/lib/found";
import { countrySaveOptions, fulizaTariff, fundOptions, fxRef, kenyaSaveOptions, loanProducts, remitCorridors, remitSurvey } from "@/lib/found-data";
import { rpcRead } from "@/lib/store";

/**
 * The server side of "shillings found": recompute a reader's result from their inputs and our own data files (never
 * from anything the browser says about a comparable or a difference), and read the public totals.
 */

/** The result for these inputs, worked out exactly as the page does, and what it may add to the count (null: nothing). */
export async function recomputeFound(input: FoundInput): Promise<{ result: FoundResult; minor: number | null }> {
  let result: FoundResult;
  switch (input.tool) {
    case "save_check":
      result =
        input.market === "kenya"
          ? foundSave({ market: "kenya", currency: "KES", rate: input.rate, amount: input.amount, tax: 0.15, options: kenyaSaveOptions() })
          : foundSave({ market: input.market, currency: input.market === "ghana" ? "GHS" : "NGN", rate: input.rate, amount: input.amount, tax: 0, options: countrySaveOptions(input.market) });
      break;
    case "mobile_loans":
    case "fuliza": {
      const products = loanProducts();
      // Fuliza's own line only ever costs Fuliza.
      if (input.tool === "fuliza" && products.find((p) => p.product === input.product)?.basis !== "access_plus_daily") {
        result = foundLoan({ ...input, product: "", products, fuliza: null });
        break;
      }
      result = foundLoan({ ...input, products, fuliza: fulizaTariff() });
      break;
    }
    case "mmf":
      result = foundMmf({ fund: input.fund, amount: input.amount, funds: fundOptions() });
      break;
    case "remit": {
      const survey = remitSurvey();
      const corridor = remitCorridors().find((c) => c.src === input.src && c.dst === input.dst) ?? null;
      // Counted in dollars, so the shilling equivalent (fx) is not needed here.
      result = foundRemit({ corridor: survey ? corridor : null, firm: input.firm, sends: input.sends, survey: survey ?? { period: "", url: "", publisher: "", date: "" }, fx: null });
      break;
    }
  }
  if (result.status !== "found") return { result, minor: null };
  // Cedis and naira are capped at KES 500,000 converted at the day's reference rates; with none, nothing is counted.
  const rates = result.currency === "GHS" || result.currency === "NGN" ? (await fxRef()).rates : null;
  return { result, minor: countable(result, capFor(result.currency, rates)) };
}

export type FoundRow = { tool: FoundTool; market: string; currency: FoundCurrency; results: number; total_minor: number };
export type FoundTotals = { since: string; rows: FoundRow[]; byCurrency: { currency: FoundCurrency; results: number; total: number }[] };

/**
 * Totals since the counter started (or since `since`), by tool, market and currency (af_found_total, migration 0046).
 * Null until the migration is applied, when the read fails, or when nothing has been counted: the counter then hides.
 */
export async function foundTotals(since: string | null = null, revalidate = 900): Promise<FoundTotals | null> {
  const r = await rpcRead("af_found_total", { p_since: since }, revalidate).catch(() => null);
  if (!r?.ok || !r.value || typeof r.value !== "object") return null;
  const v = r.value as { since?: string | null; rows?: FoundRow[] };
  const rows = (v.rows ?? []).filter((x) => x && Number(x.total_minor) > 0);
  if (!v.since || !rows.length) return null;
  const order: FoundCurrency[] = ["KES", "USD", "GHS", "NGN"];
  const byCurrency = order
    .map((currency) => {
      const list = rows.filter((x) => x.currency === currency);
      return { currency, results: list.reduce((n, x) => n + Number(x.results), 0), total: list.reduce((n, x) => n + Number(x.total_minor), 0) / 100 };
    })
    .filter((c) => c.total > 0);
  return byCurrency.length ? { since: v.since, rows, byCurrency } : null;
}
