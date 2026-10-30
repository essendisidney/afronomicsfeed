import { channelPost } from "@/lib/channels";
import { loadFxQuote } from "@/lib/data/fx";
import { morningWhatsApp, type MorningNote } from "./morning";
import { morningTextSw } from "./morning-sw";

/**
 * The Morning for the WhatsApp Channel (docs/rebuild/upgrade-U6-plan.md, item D): the WhatsApp text already built for
 * sharing, plus the publishers behind its figures and the house line. WhatsApp offers no free way to post to a Channel
 * from a server, so the founder (or the Distribution desk) copies this from /desk/whatsapp and pastes it in the app.
 */
export async function morningChannelText(note: MorningNote, lang: "en" | "sw" = "en") {
  const publishers = [...note.auctions.map((a) => a.market.publisher), ...note.board.map((b) => b.market.publisher)];
  if (note.bonds.length) publishers.unshift("Central Bank of Kenya");
  const fx = note.fx.moves.length ? await loadFxQuote() : null;
  const sources = [...publishers, ...(fx ? [`${fx.sourceName} (${lang === "sw" ? "sarafu" : "currencies"})`] : [])];
  return channelPost(lang === "sw" ? morningTextSw(note) : morningWhatsApp(note), sources, lang);
}
