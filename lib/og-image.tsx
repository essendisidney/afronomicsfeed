import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function ogImage({ kicker, title }: { kicker: string; title: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A1B4B",
          color: "#F6F7F9",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 20,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "#C41E3A",
            }}
          >
            {kicker}
          </div>
          <div
            style={{
              fontSize: 54,
              lineHeight: 1.15,
              fontFamily: "Georgia, Times New Roman, serif",
              maxWidth: 980,
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#C41E3A" }}>
          AFRONOMICS FEED
        </div>
      </div>
    ),
    ogSize,
  );
}
