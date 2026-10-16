import { ImageResponse } from "next/og";
import { cardSize, fonts } from "@/lib/og-card";
import { ogTokens } from "@/lib/og-tokens";

/**
 * The signature share card (docs/rebuild/phase-7b-plan.md, 7b-2), in the chosen look, Laterite: a cream receipt slip
 * with a torn foot on a terracotta field, a tilted stamp naming what it is (RECEIPT, RATE, CALL, TOOL…) with its date,
 * the "Af" stamp disc and wordmark, and the key figure double-underlined in terracotta like an accountant's total.
 * One design for every Receipt, rate, call, tool, number and front-page card. All colours come from lib/og-tokens.ts.
 *
 * Crop safety. LinkedIn, X and Facebook show the whole 1.91:1 card. WhatsApp's small preview crops to a centred
 * square (the middle 630 px of the 1200), so the headline, the number and its label are centred on the slip and the
 * number stays inside that square; the kicker, the stamp, the badge and the source sit at the edges. Text is clamped by
 * length here, not by the renderer, so a long headline can never push the number off the card.
 */

export type SignatureCard = {
  /** The desk's colour (accentFor() in lib/og-tokens.ts): a small mark before the kicker. */
  accent: string;
  kicker: string;
  /** The stamp: what this card is ("RECEIPT", "RATE", "CALL", "TOOL", "NUMBER", "TODAY"), with its date line. */
  stamp?: { word: string; date?: string };
  /** Kept for callers; shown as the stamp's date when the stamp has none. */
  kickerRight?: string;
  headline: string;
  figure?: { value: string; label: string } | null;
  /** One supporting line under the number: the verdict, or what the example assumes. */
  line?: { label?: string; text: string } | null;
  /** Bottom right, on the field, e.g. "Source: Central Bank of Kenya · 15 Oct 2026". */
  source: string;
};

/**
 * The card fonts have no naira or cedi sign (and the renderer cannot fetch a fallback font offline), so those two are
 * written as their ISO codes on the card: the same amount, never a different figure.
 */
const currencyCodes = (text: string) => text.replace(/GH₵\s?/g, "GHS ").replace(/₵\s?/g, "GHS ").replace(/₦\s?/g, "NGN ");

/** Cut at a word so the text is at most `max` characters, with an ellipsis when anything was cut. */
export function clampText(text: string, max: number): string {
  const clean = currencyCodes(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const at = cut.lastIndexOf(" ");
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:—–-]+$/, "")}…`;
}

function headlineSize(text: string, busy: boolean) {
  if (text.length <= 48) return busy ? 50 : 58;
  if (text.length <= 80) return busy ? 42 : 50;
  return busy ? 37 : 44;
}

function figureSize(value: string) {
  if (value.length <= 7) return 108;
  if (value.length <= 11) return 94;
  if (value.length <= 16) return 76;
  return 60;
}

const W = 1088; // the slip
const SLIP_H = 470;
const TOOTH = 16;

export function signatureElement(card: SignatureCard) {
  const t = ogTokens();
  const headline = clampText(card.headline, card.figure ? 100 : 140);
  const line = card.line ? clampText(card.line.text, card.figure ? 130 : 180) : null;
  const value = card.figure ? clampText(card.figure.value, 22) : null;
  const label = card.figure ? clampText(card.figure.label, 72) : null;
  const stampDate = card.stamp?.date ?? card.kickerRight;
  const teeth = Math.floor(W / TOOTH);
  const zig = ["0,0", ...Array.from({ length: teeth }, (_, i) => `${i * TOOTH + TOOTH / 2},${TOOTH / 2} ${(i + 1) * TOOTH},0`), `${W},0`].join(" ");
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: t.sig, padding: "34px 56px 0", fontFamily: "Sans" }}>
      <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", width: W, height: SLIP_H, background: t.slip, color: t.ink, padding: "26px 40px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, height: 30, fontWeight: 600, fontSize: 21, letterSpacing: 3, color: t["sig-ink"], textTransform: "uppercase" }}>
            <div style={{ display: "flex", width: 12, height: 12, borderRadius: 12, background: card.accent }} />
            <div style={{ display: "flex" }}>{clampText(card.kicker, 46)}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, alignItems: "center", justifyContent: "center", textAlign: "center", marginTop: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                fontFamily: "Headline",
                fontWeight: 600,
                fontSize: headlineSize(headline, Boolean(value && line)),
                lineHeight: 1.1,
                letterSpacing: -0.4,
                maxWidth: 900,
                color: t.ink,
              }}
            >
              {headline}
            </div>
            {value ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
                  <div style={{ display: "flex", fontFamily: "Headline", fontWeight: 600, fontSize: figureSize(value), lineHeight: 1.02, color: t.ink, padding: "0 8px" }}>{value}</div>
                  <div style={{ display: "flex", height: 4, background: t.sig, marginTop: 4 }} />
                  <div style={{ display: "flex", height: 4, background: t.sig, marginTop: 4 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "center", fontSize: 23, color: t["ink-soft"], marginTop: 10, maxWidth: 900 }}>{label}</div>
              </div>
            ) : null}
            {line ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: value ? 14 : 24, maxWidth: 940 }}>
                {card.line?.label ? (
                  <div style={{ display: "flex", fontSize: 16, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: t["sig-ink"], marginBottom: 3 }}>{card.line.label}</div>
                ) : null}
                <div style={{ display: "flex", justifyContent: "center", fontSize: value ? 21 : 28, lineHeight: 1.3, color: t.muted }}>{line}</div>
              </div>
            ) : null}
          </div>
        </div>
        <svg width={W} height={TOOTH / 2} viewBox={`0 0 ${W} ${TOOTH / 2}`} style={{ display: "flex" }}>
          <polygon points={zig} fill={t.slip} />
        </svg>
        {card.stamp ? (
          <div
            style={{
              position: "absolute",
              right: 26,
              top: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              border: `4px solid ${t.sig}`,
              borderRadius: 8,
              padding: "5px 14px 4px",
              color: t.sig,
              transform: "rotate(-8deg)",
              opacity: 0.92,
            }}
          >
            <div style={{ display: "flex", fontFamily: "Mono", fontSize: 26, letterSpacing: 4 }}>{card.stamp.word}</div>
            {stampDate ? <div style={{ display: "flex", fontWeight: 600, fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>{stampDate}</div> : null}
          </div>
        ) : null}
      </div>
      <div style={{ display: "flex", flexGrow: 1, alignItems: "center", justifyContent: "space-between", color: t.onField }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 54, height: 54, borderRadius: 54, background: t["stamp-paper"], transform: "rotate(-9deg)" }}>
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 44, border: `2px dashed ${t.sig}`, fontFamily: "Headline", fontSize: 24, color: t.sig }}
            >
              Af
            </div>
          </div>
          <div style={{ display: "flex", fontFamily: "Headline", fontSize: 30 }}>Afronomics</div>
        </div>
        <div style={{ display: "flex", fontSize: 19, color: t.onFieldSoft, maxWidth: 760 }}>{clampText(card.source, 76)}</div>
      </div>
    </div>
  );
}

export async function renderSignature(card: SignatureCard, headers?: Record<string, string>) {
  return new ImageResponse(signatureElement(card), { ...cardSize, fonts: await fonts(), headers });
}
