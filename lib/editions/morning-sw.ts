import { morningLines, morningSigned, type MorningNote } from "./morning";

/**
 * The Morning in Kiswahili. The English note is generated from templates, so the Kiswahili is the same
 * templates in Kiswahili: the same numbers, the same order, nothing paraphrased by a model.
 */

const country: Record<string, string> = {
  Egypt: "Misri",
  "South Africa": "Afrika Kusini",
  Mozambique: "Msumbiji",
  Nigeria: "Nigeria",
  Ghana: "Ghana",
  Kenya: "Kenya",
  Uganda: "Uganda",
  Tanzania: "Tanzania",
  Zambia: "Zambia",
  Malawi: "Malawi",
};
export const swCountry = (name: string) => country[name] ?? name;

const currency: Record<string, string> = {
  KES: "Shilingi ya Kenya",
  TZS: "Shilingi ya Tanzania",
  UGX: "Shilingi ya Uganda",
  NGN: "Naira ya Nigeria",
  GHS: "Cedi ya Ghana",
  ZAR: "Randi ya Afrika Kusini",
  EGP: "Pauni ya Misri",
  ETB: "Birr ya Ethiopia",
  RWF: "Faranga ya Rwanda",
  MZN: "Metical ya Msumbiji",
  ZMW: "Kwacha ya Zambia",
  MWK: "Kwacha ya Malawi",
  XOF: "Faranga ya CFA (Afrika Magharibi)",
  XAF: "Faranga ya CFA (Afrika ya Kati)",
  MAD: "Dirham ya Moroko",
  DZD: "Dinari ya Algeria",
  TND: "Dinari ya Tunisia",
  AOA: "Kwanza ya Angola",
  BWP: "Pula ya Botswana",
  MUR: "Rupia ya Mauritius",
  NAD: "Dola ya Namibia",
  SCR: "Rupia ya Shelisheli",
};
export const swCurrency = (code: string, fallback: string) => currency[code] ?? fallback;

const monthsSw = ["Januari", "Februari", "Machi", "Aprili", "Mei", "Juni", "Julai", "Agosti", "Septemba", "Oktoba", "Novemba", "Desemba"];
const daysSw = ["Jumapili", "Jumatatu", "Jumanne", "Jumatano", "Alhamisi", "Ijumaa", "Jumamosi"];
export function swDate(iso: string) {
  const d = new Date(iso);
  return `${daysSw[d.getUTCDay()]}, ${d.getUTCDate()} ${monthsSw[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function morningLinesSw(note: MorningNote): string[] {
  const lines: string[] = [];
  const lead = note.auctions.filter((a) => a.tenor === 364)[0] ?? note.auctions[0];
  if (lead) {
    const move = lead.bps == null ? "" : lead.bps === 0 ? ", bila mabadiliko" : `, ${lead.bps > 0 ? "juu" : "chini"} kwa pointi ${Math.abs(lead.bps)}`;
    lines.push(`Hati ya hazina ya siku ${lead.tenor} ya ${swCountry(lead.market.country)} iliuzwa kwa riba ya ${lead.rate.toFixed(2)}%${move}.`);
  }
  const fx = note.fx.moves[0];
  if (fx && Math.abs(fx.changePct) >= 0.15) {
    lines.push(`${swCurrency(fx.code, fx.name)} ${fx.changePct > 0 ? "iliimarika" : "ilishuka"} kwa ${Math.abs(fx.changePct).toFixed(2)}% dhidi ya dola usiku kucha.`);
  }
  if (note.due.length) {
    lines.push(`Matokeo yanayotarajiwa: ${note.due.map((d) => `${swCountry(d.market.country)} (${d.expected === note.day ? "leo" : "kesho"})`).join(", ")}.`);
  }
  return lines;
}

export function morningTitleSw(note: MorningNote) {
  return `Asubuhi ya Afronomics, ${swDate(note.day)}`;
}

/** Plain text in Kiswahili, for WhatsApp and the text email. */
export function morningTextSw(note: MorningNote, utm = "utm_source=whatsapp&utm_medium=share&utm_campaign=morning-sw") {
  const fx = note.fx.moves
    .slice(0, 5)
    .map((m) => `• ${swCurrency(m.code, m.name)} ${m.now.toFixed(2)}/$ (${morningSigned(m.changePct)}%)`)
    .join("\n");
  const auctions = note.auctions.map((a) => `• ${swCountry(a.market.country)} siku ${a.tenor}: ${a.rate.toFixed(2)}%${a.bps == null ? "" : ` (${morningSigned(a.bps, 0)} pointi)`}`).join("\n");
  const due = note.due.map((d) => `• ${swCountry(d.market.country)}: ${d.expected === note.day ? "leo" : "kesho"}`).join("\n");
  const board = note.board
    .slice(0, 10)
    .map((b) => `${b.market.iso} ${b.rate.toFixed(2)}%`)
    .join(" · ");
  return [
    `*${morningTitleSw(note)}*`,
    morningLinesSw(note).join(" ") || morningLines(note).join(" "),
    fx ? `*Usiku kucha, dhidi ya dola*\n${fx}` : "",
    auctions ? `*Matokeo ya minada*\n${auctions}` : "",
    due ? `*Yanayotarajiwa*\n${due}` : "",
    board ? `*Hati za siku 364, za hivi punde*\n${board}` : "",
    `Namba, chati na vyanzo: https://www.afronomicsfeed.com/morning/sw?${utm}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
