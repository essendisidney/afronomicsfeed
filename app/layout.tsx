import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/schema";
import { site } from "@/lib/site";
import "./globals.css";

/* Self-hosted: no build-time or runtime call to Google Fonts. */
const sans = localFont({
  variable: "--font-sans",
  src: [
    { path: "./fonts/archivo-latin-wdth-normal.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/archivo-latin-wdth-italic.woff2", weight: "100 900", style: "italic" },
  ],
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  display: "swap",
  // A fallback sized to Archivo's metrics, so text keeps its shape when the font arrives (no layout shift).
  fallback: ["Arial", "Helvetica", "sans-serif"],
  adjustFontFallback: "Arial",
});

/* Headlines and case titles (rebuild brief, section 7): Source Serif 4, SIL Open Font Licence (fonts/SOURCE-SERIF-4-OFL.txt). */
const serif = localFont({
  variable: "--font-headline",
  src: [{ path: "./fonts/source-serif-4-latin-wght-normal.woff2", weight: "200 900", style: "normal" }],
  fallback: ["Georgia", "Times New Roman", "serif"],
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0e1524" },
    { media: "(prefers-color-scheme: dark)", color: "#070b16" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: "Afronomics",
  // Google Search Console ownership (the same token as the DNS TXT record).
  verification: { google: "u1UlXBQerC72luTGgrMuAfDOQHpKue-tFd0gDtjAouc" },
  appleWebApp: { capable: true, title: "Afronomics", statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  // site.description runs past what a search result shows, so pages without their own description get this one.
  description: "The price of money in Africa: Treasury bill and bond auction results, currencies and inflation from the central banks, the day they publish.",
  creator: site.name,
  publisher: site.name,
  category: "finance",
  // Let search and answer engines show full snippets and large previews of the data pages.
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" } },
  alternates: { types: { "application/rss+xml": [{ url: "/rss.xml", title: `${site.name} RSS` }] } },
  // No og:title or og:description here. Metadata merges shallowly, so a page that sets no openGraph of its own
  // would inherit "Afronomics" and the site blurb, and every T-bill page shared on WhatsApp or LinkedIn would look
  // the same. Without them, link previews fall back to each page's own <title> and description.
  openGraph: {
    siteName: site.name,
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
