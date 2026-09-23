import { getAllArticles, toIndexItem } from "@/lib/content";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MarketStrip } from "@/components/ui/MarketStrip";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const articles = getAllArticles().map(toIndexItem);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-gold focus:px-3 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <MarketStrip />
      <Header articles={articles} />
      <div id="main" className="flex-1">
        {children}
      </div>
      <Footer />
    </>
  );
}
