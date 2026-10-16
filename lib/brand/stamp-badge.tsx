import { brand } from "@/lib/brand/card-style";

/**
 * The stamp-disc "Af" badge for next/og cards, drawn with boxes (next/og draws no SVG text). Needs the "Headline"
 * font, which lib/og-card.tsx fonts() supplies. The site draws the same mark as SVG (components/brand/Wordmark.tsx).
 */
export function StampBadge({ size = 56 }: { size?: number }) {
  const inner = Math.round(size * 0.82);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: size, background: brand.stampPaper, transform: "rotate(-9deg)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: inner,
          height: inner,
          borderRadius: inner,
          border: `${Math.max(2, Math.round(size / 28))}px dashed ${brand.laterite}`,
          fontFamily: "Headline",
          fontSize: Math.round(size * 0.46),
          color: brand.laterite,
        }}
      >
        Af
      </div>
    </div>
  );
}
