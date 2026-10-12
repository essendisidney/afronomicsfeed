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
  description: site.description,
  creator: site.name,
  publisher: site.name,
  category: "finance",
  // Let search and answer engines show full snippets and large previews of the data pages.
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" } },
  alternates: { types: { "application/rss+xml": [{ url: "/rss.xml", title: `${site.name} RSS` }] } },
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
      className={`${sans.variable} h-full antialiased`}
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
