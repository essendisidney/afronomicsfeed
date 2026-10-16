import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { sourceLine } from "@/lib/og-article";
import { cardSize, fonts } from "@/lib/og-card";
import { lookPalettes, type Look } from "@/lib/look";
import { sectorNames, type Receipt } from "@/lib/receipts";

/**
 * Signature-look preview (lib/look.ts): the 1200×630 share card of a Receipt in each of the three looks, so the founder
 * can judge them where readers meet us first, as a link preview on WhatsApp and LinkedIn. Each card must be
 * recognisable at 300px wide: the signature colour holds the frame, and the badge and the device survive the shrink.
 * Headlines are Source Serif, as on the site (a static instance cut from the site's own font file, for the card only).
 */

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const day = (iso: string) => fmt.format(new Date(`${iso}T00:00:00Z`));

let serifPromise: Promise<Buffer> | null = null;
function serif() {
  serifPromise ??= readFile(path.join(process.cwd(), "assets", "og-fonts", "SourceSerif4-Semibold.ttf"));
  return serifPromise;
}

function fit(title: string, max = 110) {
  return title.length <= max ? title : `${title.slice(0, title.lastIndexOf(" ", max - 1))}…`;
}

type Parts = { kicker: string; title: string; date: string; figures: { value: string; label: string }[]; source: string };

function parts(r: Receipt): Parts {
  return {
    kicker: `${sectorNames[r.sector] ?? "Markets"} · Receipt`,
    title: fit(r.title),
    date: day(r.date),
    figures: r.tiles.slice(0, 2).map((t) => ({ value: t.value, label: t.label.length > 44 ? `${t.label.slice(0, t.label.lastIndexOf(" ", 42))}…` : t.label })),
    // "Afronomics auction file, CBK Treasury bill results of 1 April 2024" → "CBK Treasury bill results", once each.
    source: sourceLine(r.sources.map((s) => ({ ...s, name: s.name.replace(/^Afronomics [^,]+, /, "").replace(/ of \d{1,2} \w+ \d{4}$/, "") }))),
  };
}

const titleSize = (t: string) => (t.length > 90 ? 50 : t.length > 64 ? 56 : 64);

/** A: Kente Gold. Ink black inside a gold frame; the figures double-ruled in gold, like a ledger's total. */
function kenteGold(p: Parts) {
  const c = lookPalettes.a;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: c.sig, padding: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, background: c.mast, color: "#F6F4EF", padding: "36px 48px 30px", fontFamily: "Sans" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 64, height: 64, background: c.sig, borderRadius: 4, paddingTop: 4 }}>
              <div style={{ fontFamily: "Headline", fontSize: 34, color: c.mast, lineHeight: 1.1 }}>Af</div>
              <div style={{ width: 36, height: 3, background: c.mast, marginTop: 1 }} />
              <div style={{ width: 36, height: 3, background: c.mast, marginTop: 3 }} />
            </div>
            <div style={{ fontFamily: "Mono", fontSize: 26, letterSpacing: 6, color: c.sig }}>AFRONOMICS</div>
          </div>
          <div style={{ fontWeight: 600, fontSize: 22, letterSpacing: 3, color: "#D6CFC0", textTransform: "uppercase" }}>{`${p.kicker} · ${p.date}`}</div>
        </div>
        <div style={{ display: "flex", fontFamily: "Headline", fontSize: titleSize(p.title), lineHeight: 1.08, letterSpacing: -0.5, marginTop: 30, maxWidth: 1060 }}>{p.title}</div>
        <div style={{ display: "flex", flexGrow: 1, alignItems: "flex-end", gap: 64 }}>
          {p.figures.map((f) => (
            <div key={f.label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 20, color: "#A39A88" }}>{f.label}</div>
              <div style={{ fontFamily: "Headline", fontSize: 76, color: c.sig, lineHeight: 1.05 }}>{f.value}</div>
              <div style={{ height: 4, background: c.sig, marginTop: 4 }} />
              <div style={{ height: 4, background: c.sig, marginTop: 4 }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22, fontSize: 19, color: "#A39A88" }}>
          <div style={{ display: "flex" }}>{p.source ? `Source: ${p.source}` : ""}</div>
          <div style={{ display: "flex", color: "#D6CFC0" }}>afronomicsfeed.com</div>
        </div>
      </div>
    </div>
  );
}

/** B: Laterite. A cream receipt slip with a torn foot on a terracotta field, stamped "Receipt". */
function laterite(p: Parts) {
  const c = lookPalettes.b;
  const W = 1088;
  const tooth = 16;
  const teeth = Math.floor(W / tooth);
  const zig = [`0,0`, ...Array.from({ length: teeth }, (_, i) => `${i * tooth + tooth / 2},${tooth / 2} ${(i + 1) * tooth},0`), `${W},0`].join(" ");
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: c.sig, padding: "40px 56px 26px", fontFamily: "Sans" }}>
      <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", width: W, height: 452, background: "#FBF6F2", color: c.ink, padding: "34px 44px 20px" }}>
          <div style={{ display: "flex", fontWeight: 600, fontSize: 22, letterSpacing: 3, color: c.sigInk, textTransform: "uppercase" }}>{`${p.kicker} · ${p.date}`}</div>
          <div style={{ display: "flex", fontFamily: "Headline", fontSize: titleSize(p.title) - 4, lineHeight: 1.08, letterSpacing: -0.5, marginTop: 18, maxWidth: 840 }}>{p.title}</div>
          <div style={{ display: "flex", flexGrow: 1, alignItems: "flex-end", gap: 56 }}>
            {p.figures.map((f) => (
              <div key={f.label} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 19, color: "#6C5E55" }}>{f.label}</div>
                <div style={{ display: "flex", fontFamily: "Headline", fontSize: 72, lineHeight: 1.1, backgroundImage: `linear-gradient(180deg, transparent 58%, rgba(179,64,31,0.32) 58%)`, padding: "0 6px" }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
        <svg width={W} height={tooth / 2} viewBox={`0 0 ${W} ${tooth / 2}`} style={{ display: "flex" }}>
          <polygon points={zig} fill="#FBF6F2" />
        </svg>
        <div
          style={{
            position: "absolute",
            right: 34,
            top: 30,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: `5px solid ${c.sig}`,
            borderRadius: 8,
            padding: "8px 18px 6px",
            color: c.sig,
            transform: "rotate(-8deg)",
          }}
        >
          <div style={{ fontFamily: "Mono", fontSize: 34, letterSpacing: 5 }}>RECEIPT</div>
          <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: 3, textTransform: "uppercase" }}>{`Checked · ${p.date}`}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexGrow: 1, alignItems: "center", justifyContent: "space-between", color: "#FFFFFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 56, background: "#FBEFE6", transform: "rotate(-9deg)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: 46, border: `2px dashed ${c.sig}`, fontFamily: "Headline", fontSize: 26, color: c.sig }}>Af</div>
          </div>
          <div style={{ fontFamily: "Headline", fontSize: 32 }}>Afronomics</div>
        </div>
        <div style={{ display: "flex", fontSize: 19, color: "#FBE3D6" }}>{p.source ? `Source: ${p.source}` : "afronomicsfeed.com"}</div>
      </div>
    </div>
  );
}

const BANDS = ["#063A2C", "#0B7A57", "#2FBF8A", "#0B7A57", "#0A5C43"];
const BAND_W = [7, 4, 3, 4, 6];

/** C: Malachite. Deep green with the stone's banding down the edge; the figures on a bright malachite tab. */
function malachite(p: Parts) {
  const c = lookPalettes.c;
  const stripes = Array.from({ length: 4 }, () => BANDS.map((b, i) => ({ b, w: BAND_W[i] * 2 }))).flat();
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: c.mast, fontFamily: "Sans", color: "#F3F6F4" }}>
      <div style={{ display: "flex", flexDirection: "column", width: 48, height: "100%" }}>
        {Array.from({ length: 6 }, () => stripes)
          .flat()
          .slice(0, 63)
          .map((s, i) => (
            <div key={i} style={{ width: 48, height: s.w, background: s.b }} />
          ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, padding: "38px 56px 30px 52px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", position: "relative", width: 64, height: 64, borderRadius: 14, overflow: "hidden", background: "#063A2C", border: "2px solid #2FBF8A" }}>
              <div style={{ position: "absolute", left: 18, top: 18, width: 90, height: 90, borderRadius: 90, border: "6px solid #0B7A57" }} />
              <div style={{ position: "absolute", left: 32, top: 32, width: 62, height: 62, borderRadius: 62, border: "5px solid #2FBF8A" }} />
              <div style={{ position: "absolute", left: 44, top: 44, width: 38, height: 38, borderRadius: 38, border: "4px solid #0B7A57" }} />
              <div style={{ position: "absolute", left: 7, top: 6, fontFamily: "Headline", fontSize: 32, color: "#FFFFFF" }}>Af</div>
            </div>
            <div style={{ fontFamily: "Headline", fontSize: 36 }}>Afronomics</div>
          </div>
          <div style={{ fontWeight: 600, fontSize: 22, letterSpacing: 3, color: "#9DBCAF", textTransform: "uppercase" }}>{`${p.kicker} · ${p.date}`}</div>
        </div>
        <div style={{ display: "flex", fontFamily: "Headline", fontSize: titleSize(p.title), lineHeight: 1.08, letterSpacing: -0.5, marginTop: 28, maxWidth: 1040 }}>{p.title}</div>
        <div style={{ display: "flex", flexGrow: 1, alignItems: "flex-end", gap: 40 }}>
          {p.figures.map((f) => (
            <div key={f.label} style={{ display: "flex", flexDirection: "column", borderLeft: "10px solid #2FBF8A", paddingLeft: 18 }}>
              <div style={{ fontSize: 19, color: "#9DBCAF" }}>{f.label}</div>
              <div style={{ fontFamily: "Headline", fontSize: 76, lineHeight: 1.05 }}>{f.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22, paddingTop: 14, borderTop: "1px solid rgba(243,246,244,0.18)", fontSize: 19, color: "#9DBCAF" }}>
          <div style={{ display: "flex" }}>{p.source ? `Source: ${p.source}` : ""}</div>
          <div style={{ display: "flex", color: "#CFE0D8" }}>afronomicsfeed.com</div>
        </div>
      </div>
    </div>
  );
}

export async function lookReceiptCard(look: Look, r: Receipt): Promise<Response> {
  const p = parts(r);
  const body = look === "a" ? kenteGold(p) : look === "b" ? laterite(p) : malachite(p);
  const base = await fonts();
  return new ImageResponse(body, {
    ...cardSize,
    fonts: [...base, { name: "Headline", data: await serif(), weight: 600, style: "normal" }],
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}
