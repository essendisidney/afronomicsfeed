import { fairBench, fundLeague, rateOptions } from "@/lib/data/kenya-rates";
import { loadHealth } from "@/lib/data/health";
import { mmfMonths } from "@/lib/data/mmf-months";
import { mobileLoanBoard } from "@/lib/data/mobile-loans";
import { flat, reducing, savingsGrowth } from "@/lib/learn-calc";
import { calcUi, shareUi, ui, type ShareLang } from "@/lib/learn-ui";
import { pct, type Card } from "@/lib/og-card";
import { fairSentence, fairWho, rateText, sharePath, whole, type ShareSpec } from "@/lib/share";

/**
 * What a share shows: the card (drawn by /share/card) and the title and description link previews print
 * (served by /share). Reader inputs come from the validated spec; every published figure is read here.
 */
export type ShareView = { card: Card; title: string; description: string };

const host = "afronomicsfeed.com";
const notAdvice = (lang: ShareLang) => (lang === "en" ? "Information, not advice." : ui[lang].notAdvice);
const short = (s: string, n = 22) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Shared with the pages, so the message beside the share buttons says what the card says. */
export function mmfSentence(best: { name: string; net: number }, bill: { net: number }) {
  return `${best.name} keeps ${best.net.toFixed(2)}% after tax, the best published Kenyan money market fund; the 364-day Treasury bill keeps ${bill.net.toFixed(2)}%`;
}

export function mmfMonthSentence(m: { label: string; complete: boolean; rows: { name: string; net: number }[] }) {
  const [a, b] = m.rows;
  return `${a.name} ${m.complete ? "ranked first" : "leads"} at ${a.net.toFixed(2)}% after tax${b ? `, ahead of ${b.name} at ${b.net.toFixed(2)}%` : ""}`;
}

export function mobileSentence(cheapest: { product: string; costPer1000: number; from: boolean }, lendingAvg: number) {
  const bankMonth = (1000 * lendingAvg * 30) / 365 / 100;
  return `KES 1,000 for a month costs ${cheapest.from ? "from " : ""}KES ${whole(cheapest.costPer1000)} on ${cheapest.product}, the lowest published charge; about KES ${whole(bankMonth)} at the bank lending average`;
}

export function shareView(spec: ShareSpec): ShareView | null {
  const { path } = sharePath(spec);

  if (spec.kind === "fair") {
    const bench = fairBench();
    if (!bench) return null;
    const head = fairSentence(spec, bench);
    const who = fairWho(spec);
    const bars =
      spec.mode === "save"
        ? [
            { label: who, value: spec.mine, display: pct(spec.mine) },
            { label: "364-day T-bill", value: bench.bill364Gross, display: pct(bench.bill364Gross) },
            { label: "Bank deposit average", value: bench.depositAvg, display: pct(bench.depositAvg) },
          ]
        : [
            { label: who, value: spec.mine, display: pct(spec.mine) },
            { label: "Bank lending average", value: bench.lendingAvg, display: pct(bench.lendingAvg) },
            { label: "364-day T-bill", value: bench.bill364Gross, display: pct(bench.bill364Gross) },
          ];
    return {
      title: `${head} Is your rate fair?`,
      description: "Check a Kenya savings or loan rate against the published benchmarks: the Treasury bill, the best money market fund and the Central Bank's bank averages. Information, not advice.",
      card: {
        kicker: "Is my rate fair? · Kenya",
        title: head,
        bars,
        barsCaption: `% a year, before tax · T-bill: latest CBK auction · bank averages: CBK, ${bench.asOf}`,
        cta: `Is your rate fair? ${host}${path}`,
        source: "Central Bank of Kenya",
      },
    };
  }

  if (spec.kind === "savings") {
    // Arabic needs a font the card does not carry: the picture falls back to English; the preview text stays Arabic.
    const lang = spec.lang === "ar" ? "en" : spec.lang;
    const t = shareUi[lang];
    const c = calcUi(lang);
    const g = savingsGrowth(spec.monthly, spec.years, spec.rate);
    const title = t.savingsCard(whole(spec.monthly), String(spec.years), rateText(spec.rate));
    const own = shareUi[spec.lang];
    return {
      title: own.savingsText(whole(spec.monthly), String(spec.years), rateText(spec.rate), whole(g.total)),
      description: `${own.tryOwn} ${host}${path}`,
      card: {
        kicker: `${t.savingsTitle} · Afronomics`,
        title,
        stats: [
          { label: c.youWillHave, value: whole(g.total) },
          { label: c.youPutIn, value: whole(g.paidIn) },
          { label: c.interest, value: whole(g.interest) },
        ],
        cta: `${t.tryOwn} ${host}${path}`,
        source: notAdvice(lang),
      },
    };
  }

  if (spec.kind === "loan") {
    const lang = spec.lang === "ar" ? "en" : spec.lang;
    const t = shareUi[lang];
    const c = calcUi(lang);
    const r = reducing(spec.amount, spec.rate, spec.months);
    const f = flat(spec.amount, spec.rate, spec.months);
    const title = t.loanCard(whole(spec.amount), rateText(spec.rate), String(spec.months));
    const own = shareUi[spec.lang];
    return {
      title: own.loanText(whole(spec.amount), rateText(spec.rate), String(spec.months), whole(r.interest), whole(f.interest)),
      description: `${own.tryOwn} ${host}${path}`,
      card: {
        kicker: `${t.loanTitle} · Afronomics`,
        title,
        stats: [
          { label: c.monthly, value: whole(r.payment), note: c.reducing },
          { label: c.totalInterest, value: whole(r.interest), note: c.reducing },
          { label: c.totalInterest, value: whole(f.interest), note: c.flat },
        ],
        cta: `${t.tryOwn} ${host}${path}`,
        source: notAdvice(lang),
      },
    };
  }

  if (spec.kind === "mmf") {
    const best = fundLeague()[0];
    const { options } = rateOptions();
    const bill = options.find((o) => o.name === "364-day Treasury bill");
    const savings = options.find((o) => o.name.startsWith("Bank savings"));
    if (!best || !bill) return null;
    const bars = [
      { label: short(best.name), value: best.net, display: pct(best.net) },
      { label: "364-day T-bill", value: bill.net, display: pct(bill.net) },
      ...(savings ? [{ label: "Bank savings average", value: savings.net, display: pct(savings.net) }] : []),
    ];
    const title = mmfSentence(best, bill);
    return {
      title: `Kenya money market funds: ${title}`,
      description: "Every Kenyan money market fund ranked by what a saver keeps after 15% withholding tax, each yield read from the manager's own website. Information, not advice.",
      card: {
        kicker: "Kenya money market funds · after tax",
        title,
        bars,
        barsCaption: "% a year, after 15% withholding tax · managers' own sites and the CBK",
        cta: `Every fund, from the source: ${host}${path}`,
        source: "Fund managers and the Central Bank of Kenya",
      },
    };
  }

  if (spec.kind === "mmf_month") {
    const months = mmfMonths();
    const m = spec.month ? months.find((x) => x.month === spec.month && x.complete) : months[0];
    if (!m || !m.rows.length) return null;
    const stale = new Set((loadHealth()?.items ?? []).filter((x) => x.area === "Money market funds" && x.status === "late").map((x) => x.name));
    const top = m.rows.slice(0, 5);
    const flagged = top.some((r) => stale.has(r.name));
    const title = mmfMonthSentence(m);
    const lead = `${short(m.rows[0].name, 36)} ${m.complete ? "ranked first" : "leads"} at ${pct(m.rows[0].net)} after tax`;
    return {
      title: `Best money market fund in Kenya, ${m.label}: ${title}`,
      description: `Kenyan money market funds ranked by average yield over ${m.label} after the 15% withholding tax, each yield read from the manager's own website or fact sheet. Information, not advice.`,
      card: {
        kicker: `Best money market fund in Kenya · ${m.label}${m.complete ? "" : " so far"}`,
        title: lead,
        bars: top.map((r) => ({ label: `${short(r.name.replace(/\s+(Money Market|Fixed Income) Fund.*$/, ""), 20)}${stale.has(r.name) ? " *" : ""}`, value: r.net, display: pct(r.net) })),
        barsCaption: `Average % a year over the month, after 15% withholding tax${flagged ? " · * yield unchanged on the manager's site for a week or more" : ""}`,
        cta: `The full ranking: ${host}${path}`,
        source: "Fund managers' own websites and fact sheets",
      },
    };
  }

  // mobile
  const loans = mobileLoanBoard();
  const bench = fairBench();
  const cheapest = loans[0];
  if (!cheapest || !bench) return null;
  const title = mobileSentence(cheapest, bench.lendingAvg);
  return {
    title: `What a mobile loan really costs: ${title}`,
    description: "Kenya's mobile loans, each provider's own published charge, set beside the bank lending average. Information, not advice.",
    card: {
      kicker: "What a mobile loan really costs · Kenya",
      title,
      bars: [
        ...loans.slice(0, 3).map((l) => ({ label: short(l.product, 18), value: l.yearlySimple, display: `${l.from ? "from " : ""}${l.yearlySimple.toFixed(0)}%` })),
        { label: "Bank average", value: bench.lendingAvg, display: pct(bench.lendingAvg, 1) },
      ],
      barsCaption: "As a simple yearly rate · providers' published charges and the CBK",
      cta: `Compare every provider: ${host}${path}`,
      source: "Providers and the Central Bank of Kenya",
    },
  };
}
