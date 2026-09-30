import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { site } from "@/lib/site";
import "./globals.css";

/* Self-hosted: no build-time or runtime call to Google Fonts. */
const sans = localFont({
  variable: "--font-sans",
  src: [{ path: "./fonts/outfit-latin-wght-normal.woff2", weight: "100 900", style: "normal" }],
  display: "swap",
});

const serif = localFont({
  variable: "--font-serif",
  src: [
    { path: "./fonts/source-serif-4-latin-wght-normal.woff2", weight: "200 900", style: "normal" },
    { path: "./fonts/source-serif-4-latin-wght-italic.woff2", weight: "200 900", style: "italic" },
  ],
  display: "swap",
});

const mono = localFont({
  variable: "--font-mono",
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    siteName: site.name,
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${serif.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
