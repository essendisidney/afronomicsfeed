import Link from "next/link";
import { foundDate, money } from "@/lib/found";
import { foundTotals } from "@/lib/found-server";

/**
 * The public "shillings found" counter (decisions B and E, D-029): the yearly differences readers were shown since the
 * first counted day, by currency, never added across currencies. Shown only once a total is above zero; until migration
 * 0046 is applied, or if the read fails, nothing renders.
 */
export async function FoundCounter({ lang = "en", variant = "line" }: { lang?: "en" | "sw"; variant?: "line" | "panel" }) {
  const t = await foundTotals();
  if (!t) return null;
  const kes = t.byCurrency.find((c) => c.currency === "KES");
  const others = t.byCurrency.filter((c) => c.currency !== "KES");
  const since = foundDate(t.since, lang);
  const where = (c: string) =>
    lang === "sw"
      ? c === "USD"
        ? "katika kutuma pesa nyumbani"
        : c === "GHS"
          ? "Ghana"
          : "Nigeria"
      : c === "USD"
        ? "on sending money home"
        : c === "GHS"
          ? "in Ghana"
          : "in Nigeria";
  const head = kes
    ? lang === "sw"
      ? `Shilingi zilizopatikana na wasomaji tangu ${since}: ${money("KES", kes.total)}`
      : `Shillings found by readers since ${since}: ${money("KES", kes.total)}`
    : lang === "sw"
      ? `Pesa zilizopatikana na wasomaji tangu ${since}`
      : `Money found by readers since ${since}`;
  const rest = others.map((c) => `${money(c.currency, c.total)} ${where(c.currency)}`);
  const restText = rest.length ? (kes ? (lang === "sw" ? ` (na ${rest.join(", ")})` : ` (and ${rest.join(", ")})`) : `: ${rest.join(", ")}`) : "";
  const note =
    lang === "sw"
      ? "Tofauti ya kila mwaka kati ya chaguo la msomaji na chaguo bora tunalofuatilia. Tofauti inayoonyeshwa si pesa iliyohamishwa."
      : "The yearly difference between a reader’s option and the best one we track. A difference shown is not money moved.";
  const how = lang === "sw" ? "Jinsi tunavyohesabu" : "How it is counted";
  if (variant === "panel") {
    return (
      <div className="rounded-xl border border-rule bg-surface px-4 py-4">
        <p data-num className="tabular font-serif text-[1.35rem] leading-snug text-ink">
          {head}
          {restText}
        </p>
        <p className="mt-1 text-[13px] leading-5 text-muted">{note}</p>
      </div>
    );
  }
  return (
    <Link href="/method#shillings-found" className="group flex min-h-11 items-center text-[13.5px] leading-5 text-ink-soft hover:text-ink">
      <span className="tabular">
        <span className="font-semibold text-ink">{head}</span>
        {restText}. {note} <span className="text-forest group-hover:text-ink">{how} →</span>
      </span>
    </Link>
  );
}
