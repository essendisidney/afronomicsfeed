import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand/card-style";
import { StampBadge } from "@/lib/brand/stamp-badge";
import { categoryLabel, formatDate } from "@/lib/format";
import { cardSize, fonts } from "@/lib/og-card";
import type { Article } from "@/lib/types";

/**
 * The share card for a story (1200×630): night background under a laterite bar (D-026), the section, the headline, the
 * date and where the figures come from, with the Afronomics mark. Text only — no photograph stands in for the news.
 */

const NIGHT = brand.night;
const NIGHT_2 = brand.night2;
const INK = brand.nightInk;
const SOFT = brand.nightSoft;
const MUTED = brand.nightMuted;
const ACCENT = brand.lateriteLight;
const ACCENT_SOFT = brand.sand;

/** "Central Bank of Kenya — Treasury bill results" → "Central Bank of Kenya"; publishers once each, at most two. */
export function sourceLine(sources: Article["sources"]): string {
  const names = [...new Set(sources.map((s) => s.name.split(/\s[—–-]\s/)[0].trim()).filter(Boolean))];
  if (names.length === 0) return "";
  const shown = names.slice(0, 2).join(" · ");
  const line = names.length > 2 ? `${shown} and ${names.length - 2} more` : shown;
  return line.length > 70 ? `${line.slice(0, line.lastIndexOf(" ", 68))}…` : line;
}

function fitHeadline(title: string, max = 120) {
  return title.length <= max ? title : `${title.slice(0, title.lastIndexOf(" ", max - 1))}…`;
}

export async function articleCard(article: Article | null | undefined, fallbackKicker: string): Promise<Response> {
  const kicker = article ? categoryLabel(article.category) : fallbackKicker;
  const title = fitHeadline(article?.title ?? "The price of money in Africa");
  const size = title.length > 90 ? 58 : title.length > 60 ? 66 : 76;
  const source = article ? sourceLine(article.sources) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(160deg, ${NIGHT_2} 0%, ${NIGHT} 65%)`,
          borderTop: `14px solid ${brand.laterite}`,
          color: INK,
          padding: "56px 72px 44px",
          fontFamily: "Sans",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -180,
            top: -220,
            width: 620,
            height: 620,
            borderRadius: 620,
            background: "radial-gradient(circle, rgba(242,145,109,0.22) 0%, rgba(242,145,109,0) 70%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 4, borderRadius: 4, background: ACCENT }} />
            <div style={{ fontWeight: 600, fontSize: 24, letterSpacing: 4, textTransform: "uppercase", color: ACCENT_SOFT }}>{kicker}</div>
          </div>
          {article ? <div style={{ fontSize: 22, color: SOFT }}>{formatDate(article.date)}</div> : null}
        </div>
        <div style={{ display: "flex", flexGrow: 1, alignItems: "center" }}>
          <div style={{ display: "flex", fontFamily: "Serif", fontSize: size, lineHeight: 1.04, letterSpacing: -1, maxWidth: 1040 }}>{title}</div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(245,246,244,0.14)",
            paddingTop: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <StampBadge size={36} />
            <div style={{ fontFamily: "Headline", fontSize: 26, color: INK }}>Afronomics</div>
          </div>
          {source ? <div style={{ display: "flex", fontSize: 19, color: MUTED, maxWidth: 700 }}>{`Source: ${source}`}</div> : null}
        </div>
      </div>
    ),
    { ...cardSize, fonts: await fonts() },
  );
}
