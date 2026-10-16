import { ImageResponse } from "next/og";
import { brand, cardFrame } from "@/lib/brand/card-style";
import { StampBadge } from "@/lib/brand/stamp-badge";
import { sourceLine } from "@/lib/og-article";
import { fonts } from "@/lib/og-card";
import { sectorNames, type Receipt } from "@/lib/receipts";

/**
 * The Receipt share card (D-026): a cream receipt slip with a torn foot on a laterite field, stamped "Receipt", the
 * headline in Source Serif and the key figures double-ruled. Built to be recognised at 300px wide, the size WhatsApp
 * shows a link preview. Colours and frame come from lib/brand/card-style.ts.
 */

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const day = (iso: string) => fmt.format(new Date(`${iso}T00:00:00Z`));

function fit(title: string, max = 110) {
  return title.length <= max ? title : `${title.slice(0, title.lastIndexOf(" ", max - 1))}…`;
}

export async function receiptCard(r: Receipt): Promise<Response> {
  const kicker = `${sectorNames[r.sector] ?? "Markets"} · Receipt`;
  const title = fit(r.title);
  const date = day(r.date);
  const figures = r.tiles.slice(0, 2).map((t) => ({ value: t.value, label: t.label.length > 44 ? `${t.label.slice(0, t.label.lastIndexOf(" ", 42))}…` : t.label }));
  // "Afronomics auction file, CBK Treasury bill results of 1 April 2024" → "CBK Treasury bill results", once each.
  const source = sourceLine(r.sources.map((s) => ({ ...s, name: s.name.replace(/^Afronomics [^,]+, /, "").replace(/ of \d{1,2} \w+ \d{4}$/, "") })));
  const size = (title.length > 90 ? 50 : title.length > 64 ? 56 : 64) - 4;

  const { field, slipHeight, tooth, stamp } = cardFrame;
  const W = cardFrame.width - field.side * 2;
  const teeth = Math.floor(W / tooth);
  const zig = ["0,0", ...Array.from({ length: teeth }, (_, i) => `${i * tooth + tooth / 2},${tooth / 2} ${(i + 1) * tooth},0`), `${W},0`].join(" ");

  const body = (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: brand.laterite, padding: `${field.top}px ${field.side}px ${field.bottom}px`, fontFamily: "Sans" }}>
      <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", width: W, height: slipHeight, background: brand.slip, color: brand.ink, padding: "34px 44px 20px" }}>
          <div style={{ display: "flex", fontWeight: 600, fontSize: 22, letterSpacing: 3, color: brand.lateriteInk, textTransform: "uppercase" }}>{`${kicker} · ${date}`}</div>
          <div style={{ display: "flex", fontFamily: "Headline", fontSize: size, lineHeight: 1.08, letterSpacing: -0.5, marginTop: 18, maxWidth: 840 }}>{title}</div>
          <div style={{ display: "flex", flexGrow: 1, alignItems: "flex-end", gap: 56 }}>
            {figures.map((f) => (
              <div key={f.label} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 19, color: brand.muted }}>{f.label}</div>
                <div style={{ fontFamily: "Headline", fontSize: 72, lineHeight: 1.05 }}>{f.value}</div>
                {/* The ledger's double rule. */}
                <div style={{ height: 4, background: brand.laterite, marginTop: 4 }} />
                <div style={{ height: 4, background: brand.laterite, marginTop: 4 }} />
              </div>
            ))}
          </div>
        </div>
        <svg width={W} height={tooth / 2} viewBox={`0 0 ${W} ${tooth / 2}`} style={{ display: "flex" }}>
          <polygon points={zig} fill={brand.slip} />
        </svg>
        <div
          style={{
            position: "absolute",
            right: 34,
            top: 30,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: `${stamp.border}px solid ${brand.laterite}`,
            borderRadius: 8,
            padding: "8px 18px 6px",
            color: brand.laterite,
            transform: `rotate(${stamp.rotate}deg)`,
          }}
        >
          <div style={{ fontFamily: "Mono", fontSize: 34, letterSpacing: 5 }}>RECEIPT</div>
          <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: 3, textTransform: "uppercase" }}>{`Checked · ${date}`}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexGrow: 1, alignItems: "center", justifyContent: "space-between", color: "#FFFFFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <StampBadge size={56} />
          <div style={{ fontFamily: "Headline", fontSize: 32 }}>Afronomics</div>
        </div>
        <div style={{ display: "flex", fontSize: 19, color: brand.sandSoft }}>{source ? `Source: ${source}` : "afronomicsfeed.com"}</div>
      </div>
    </div>
  );

  return new ImageResponse(body, {
    width: cardFrame.width,
    height: cardFrame.height,
    fonts: await fonts(),
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
