import { site } from "@/lib/site";
import { headlines, type WeeklyEdition } from "./weekly";

const longDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });

/** A LinkedIn post for the week, built from the edition's numbers. Under LinkedIn's 3,000-character limit. */
export function linkedinPost(edition: WeeklyEdition) {
  const lines = headlines(edition);
  const bills = edition.bills
    .map((b) => `• ${b.label} T-bill: ${b.rate.toFixed(3)}%${b.changeBps == null ? "" : ` (${b.changeBps > 0 ? "+" : b.changeBps < 0 ? "−" : "±"}${Math.abs(b.changeBps)} bps)`}`)
    .join("\n");
  const fx = (edition.fx?.moves ?? [])
    .slice(0, 3)
    .map((m) => `• ${m.name}: ${m.changePct > 0 ? "+" : "−"}${Math.abs(m.changePct).toFixed(1)}% vs USD`)
    .join("\n");
  const stories = edition.stories
    .slice(0, 3)
    .map((s) => `• ${s.title} (${s.publisher})`)
    .join("\n");
  const parts = [
    `Africa’s week in numbers — ${longDate.format(new Date(edition.weekOf))}`,
    lines.filter((line) => !line.startsWith("Kenya’s")).slice(0, 2).join("\n\n"),
    bills ? `Kenya government auctions\n${bills}` : "",
    fx ? `Biggest currency moves this week\n${fx}` : "",
    stories ? `Stories that moved the week\n${stories}` : "",
    `Every figure is linked to its source. Full edition and free data: ${site.url}/weekly?utm_source=linkedin&utm_medium=social&utm_campaign=weekly`,
    "#Africa #Kenya #Markets #Economy #Finance #Afronomics",
  ];
  return parts.filter(Boolean).join("\n\n").slice(0, 2900);
}

export function emailSubject(edition: WeeklyEdition) {
  const bill = edition.bills.find((b) => b.tenor === 91);
  return bill
    ? `Afronomics Weekly: 91-day bill at ${bill.rate.toFixed(2)}%, and the week in African markets`
    : `Afronomics Weekly — ${longDate.format(new Date(edition.weekOf))}`;
}
