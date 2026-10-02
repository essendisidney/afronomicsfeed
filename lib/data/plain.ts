/**
 * "What this means for you": the auction result as money in a saver's pocket, in English and, for
 * East Africa, Kiswahili. Everything here is arithmetic on the published rate; nothing is written by hand.
 *
 * Interest on a bill is rate × days/364 (the convention central banks in the region use for bills; the
 * difference from /365 is under 0.3%). Tax is shown only where the rate is certain (Kenya: 15% withholding
 * on bill interest for residents); elsewhere the figure is before withholding tax.
 */

export type PlainRow = { tenor: number; rate: number; prev?: number | null };

/** A round sum a saver in each market would recognise. */
export const plainAmount: Record<string, number> = {
  KES: 100_000,
  NGN: 1_000_000,
  GHS: 10_000,
  UGX: 10_000_000,
  TZS: 1_000_000,
  EGP: 100_000,
  ZAR: 100_000,
  ZMW: 50_000,
  MWK: 1_000_000,
  MZN: 100_000,
};

const withholding: Record<string, number> = { KES: 0.15 };
const swahili = new Set(["KE", "TZ", "UG"]);

const fmt = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));

export function plainMeaning(input: { currency: string; iso: string; country: string; rows: PlainRow[] }) {
  const amount = plainAmount[input.currency] ?? 100_000;
  const tax = withholding[input.currency] ?? null;
  const cur = input.currency;
  const rows = [...input.rows].sort((a, b) => b.tenor - a.tenor);
  const lead = rows.find((r) => r.tenor === 364) ?? rows[0];
  if (!lead) return null;

  const interest = (r: PlainRow) => (amount * (r.rate / 100) * r.tenor) / 364;
  const net = (g: number) => (tax == null ? g : g * (1 - tax));
  const gross = interest(lead);
  const take = net(gross);
  const prevTake = lead.prev != null ? net((amount * (lead.prev / 100) * lead.tenor) / 364) : null;
  const diff = prevTake != null ? take - prevTake : null;
  const months = Math.round((lead.tenor / 365) * 12);
  const monthly = take / months;

  const en: string[] = [];
  en.push(
    `Put ${cur} ${fmt(amount)} into the ${lead.tenor}-day bill at this auction and you get back ${cur} ${fmt(amount + take)} after ${months} month${months === 1 ? "" : "s"}: ${cur} ${fmt(take)} in interest${
      tax != null ? ` after ${Math.round(tax * 100)}% withholding tax (${cur} ${fmt(gross)} before)` : " before any withholding tax"
    }, about ${cur} ${fmt(monthly)} a month.`,
  );
  if (diff != null) {
    const d = Math.round(Math.abs(diff));
    en.push(d < 1 ? `That is the same as at the previous auction.` : `That is ${cur} ${fmt(d)} ${diff > 0 ? "more" : "less"} than the same money would have earned at the previous auction.`);
  }
  const others = rows.filter((r) => r !== lead);
  if (others.length) {
    en.push(
      `For shorter money: ${others
        .map((r) => `${cur} ${fmt(net(interest(r)))} on the ${r.tenor}-day bill (${Math.round((r.tenor / 365) * 12)} month${Math.round((r.tenor / 365) * 12) === 1 ? "" : "s"})`)
        .join(", ")}.`,
    );
  }
  en.push(
    `${cur === "KES" ? "The Central Bank’s minimum bid is KES 100,000, and the " : "The "}government pays the full amount at maturity; the risk is ${input.country}’s government not paying, and the money is locked until then.`,
  );

  let sw: string[] | null = null;
  if (swahili.has(input.iso)) {
    sw = [];
    sw.push(
      `Ukiweka ${cur} ${fmt(amount)} kwenye hati ya siku ${lead.tenor} kwa riba ya mnada huu, utarudishiwa ${cur} ${fmt(amount + take)} baada ya miezi ${months}: riba ya ${cur} ${fmt(take)}${
        tax != null ? ` baada ya kodi ya zuio ya ${Math.round(tax * 100)}% (${cur} ${fmt(gross)} kabla ya kodi)` : " kabla ya kodi yoyote ya zuio"
      }, yaani takriban ${cur} ${fmt(monthly)} kwa mwezi.`,
    );
    if (diff != null) {
      const d = Math.round(Math.abs(diff));
      sw.push(d < 1 ? `Ni sawa na mnada uliopita.` : `Hiyo ni ${cur} ${fmt(d)} ${diff > 0 ? "zaidi" : "pungufu"} ya kiasi ambacho pesa hiyo hiyo ingepata kwenye mnada uliopita.`);
    }
    sw.push(`${cur === "KES" ? "Kiwango cha chini cha Benki Kuu ni KES 100,000. " : ""}Serikali hulipa yote mwishoni mwa muda; hatari ni serikali kushindwa kulipa, na pesa haipatikani hadi muda uishe.`);
  }

  return { amount, currency: cur, lead, take, gross, months, en, sw, taxRate: tax };
}
