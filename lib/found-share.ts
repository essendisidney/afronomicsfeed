import { foundLoan, foundMmf, foundName, foundRemit, foundSave, foundSlug, loanCharge, money, toolLabel, type FoundResult, type FoundSide } from "@/lib/found";
import { countrySaveOptions, fulizaTariff, fundOptions, kenyaSaveOptions, loanProducts, remitCorridors, remitSurvey } from "@/lib/found-data";
import type { SignatureCard } from "@/lib/og-signature";
import { accentFor } from "@/lib/og-tokens";
import { cardDay } from "@/lib/share-cards";
import type { ShareSpec } from "@/lib/share";

/**
 * The share card for a "shillings found" result, in the signature (Laterite) look shared with every other card (D-026).
 * By default it carries no personal figures: the tool, and the best or cheapest option we track with its source and
 * date. Only when the reader ticked "include my figures" does the link carry their inputs; the difference is then
 * recomputed here from those inputs and our own data, exactly as on the page. A link never carries a difference.
 */

type Found = Extract<ShareSpec, { kind: "found" }>;
const host = "afronomicsfeed.com";
const day = (iso: string) => (/^\d{4}-\d{2}-\d{2}/.test(iso) ? cardDay(iso) : iso);
const pctN = (n: number) => `${n.toFixed(2)}%`;

/** Rebuild the reader's result from the validated inputs in the link (null when they no longer match our data). */
function resultFor(spec: Found): FoundResult | null {
  const m = spec.mine;
  if (!m) return null;
  switch (spec.tool) {
    case "save_check":
      if (m.rate == null || m.amount == null) return null;
      return spec.market === "kenya"
        ? foundSave({ market: "kenya", currency: "KES", rate: m.rate, amount: m.amount, tax: 0.15, options: kenyaSaveOptions() })
        : foundSave({ market: spec.market, currency: spec.market === "ghana" ? "GHS" : "NGN", rate: m.rate, amount: m.amount, tax: 0, options: countrySaveOptions(spec.market === "ghana" ? "ghana" : "nigeria") });
    case "mobile_loans":
    case "fuliza": {
      const products = loanProducts();
      const p = products.find((x) => foundSlug(x.product) === m.product);
      if (!p || m.amount == null || m.days == null || m.times == null) return null;
      if (spec.tool === "fuliza" && p.basis !== "access_plus_daily") return null;
      return foundLoan({ tool: spec.tool, product: p.product, amount: m.amount, days: m.days, times: m.times, products, fuliza: fulizaTariff() });
    }
    case "mmf": {
      const funds = fundOptions();
      const f = funds.find((x) => foundSlug(x.name) === m.fund);
      return f && m.amount != null ? foundMmf({ fund: f.name, amount: m.amount, funds }) : null;
    }
    case "remit": {
      const survey = remitSurvey();
      const c = remitCorridors().find((x) => x.src === m.src && x.market === spec.market) ?? null;
      const firm = c?.firms.find((f) => foundSlug(f.firm) === m.firm)?.firm;
      return survey && c && firm && m.sends != null ? foundRemit({ corridor: c, firm, sends: m.sends, survey, fx: null }) : null;
    }
  }
}

/** The best or cheapest option we track for the tool, with no reader figures. */
function comparableFor(spec: Found): { side: FoundSide; label: string } | null {
  switch (spec.tool) {
    case "save_check": {
      const opts = spec.market === "kenya" ? kenyaSaveOptions() : countrySaveOptions(spec.market === "ghana" ? "ghana" : "nigeria");
      const best = [...opts].sort((a, b) => b.rate - a.rate)[0];
      return best
        ? { side: { name: best.name, figure: pctN(best.rate), publisher: best.publisher, url: best.url, date: best.date }, label: `Best we track, ${spec.market === "kenya" ? "after tax" : "before tax"}: ${best.name}` }
        : null;
    }
    case "mobile_loans":
    case "fuliza": {
      // The page's own yardstick: KES 1,000 for 30 days, on charges published as a fixed figure (never a "from" rate).
      const fuliza = fulizaTariff();
      const cheapest = loanProducts()
        .filter((p) => !p.from)
        .map((p) => ({ p, cost: loanCharge(p, 1000, 30, fuliza) }))
        .filter((x): x is { p: (typeof x)["p"]; cost: number } => x.cost != null)
        .sort((a, b) => a.cost - b.cost)[0];
      if (!cheapest) return null;
      const src = cheapest.p.basis === "access_plus_daily" ? { url: fuliza.url, date: fuliza.date } : { url: cheapest.p.url, date: cheapest.p.date };
      return {
        side: { name: cheapest.p.product, figure: money("KES", cheapest.cost), publisher: cheapest.p.provider, ...src },
        label: `KES 1,000 for 30 days, cheapest we track: ${cheapest.p.product}`,
      };
    }
    case "mmf": {
      const best = [...fundOptions()].sort((a, b) => b.net - a.net)[0];
      return best ? { side: { name: best.name, figure: pctN(best.net), publisher: best.manager, url: best.url, date: best.date }, label: `Best fund we track, after tax: ${best.name}` } : null;
    }
    case "remit":
      return null;
  }
}

export function foundSignature(spec: Found): { card: SignatureCard; title: string; description: string } | null {
  const tool = toolLabel[spec.tool].en;
  const where = spec.market === "kenya" || spec.tool !== "save_check" ? "" : ` · ${spec.market === "ghana" ? "Ghana" : "Nigeria"}`;
  const description = "Each money tool on Afronomics sets what you pay or earn against the best option we track, from the publishers' own figures, and counts the difference shown. Information, not advice.";
  if (spec.mine) {
    const r = resultFor(spec);
    if (!r || r.status === "none" || !r.mine || !r.other) return null;
    const name = foundName(r.currency);
    const found = r.status === "found";
    const value = found ? `${money(r.currency, r.yearly)} a year` : r.mine.figure;
    const headline = found
      ? `${r.other.name} ${r.tool === "save_check" || r.tool === "mmf" ? "earns" : "costs"} ${money(r.currency, r.yearly)} a year ${r.tool === "save_check" || r.tool === "mmf" ? "more" : "less"} than ${r.mine.name.toLowerCase() === "your rate" ? "my rate" : r.mine.name}`
      : `${r.mine.name}: already the best option we track`;
    return {
      title: `${name} with ${tool}: ${headline}`,
      description,
      card: {
        accent: accentFor("cost-of-living"),
        kicker: `${name} · ${tool}${where}`,
        stamp: { word: "FOUND", date: day(r.other.date || r.mine.date) },
        headline,
        figure: { value, label: found ? `the yearly difference on my figures: ${r.mine.figure} against ${r.other.figure}` : `${r.mine.name}, on my figures` },
        line: { text: "A difference shown is not money moved. Information, not advice." },
        source: `Source: ${r.other.publisher}${r.other.date ? ` · ${day(r.other.date)}` : ""}`,
      },
    };
  }
  const c = comparableFor(spec);
  const name = foundName(spec.tool === "remit" ? "USD" : spec.market === "ghana" ? "GHS" : spec.market === "nigeria" ? "NGN" : "KES");
  if (!c) {
    const survey = remitSurvey();
    return {
      title: `${name} · ${tool}: the cheapest service surveyed on every corridor`,
      description,
      card: {
        accent: accentFor("cost-of-living"),
        kicker: `${name} · ${tool}`,
        stamp: { word: "FOUND", date: survey ? survey.period : undefined },
        headline: "What does sending money home cost you, against the cheapest service surveyed?",
        line: { text: "Pick your corridor and your service; the difference comes from the World Bank's own survey." },
        source: `Source: World Bank, Remittance Prices Worldwide${survey ? ` · ${survey.period}` : ""}`,
      },
    };
  }
  const headline = `${tool}: how far is your option from the best we track?`;
  return {
    title: `${name} · ${headline}`,
    description,
    card: {
      accent: accentFor("cost-of-living"),
      kicker: `${name} · ${tool}${where}`,
      stamp: { word: "FOUND", date: day(c.side.date) },
      headline,
      figure: { value: c.side.figure, label: c.label },
      line: { text: `Check yours at ${host}. Information, not advice.` },
      source: `Source: ${c.side.publisher} · ${day(c.side.date)}`,
    },
  };
}
