import { buildSearchIndex } from "@/lib/search";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MarketStrip } from "@/components/ui/MarketStrip";
import { PageCounter } from "./PageCounter";
import { AppInstall } from "./AppInstall";
import { PageFeedback } from "@/components/ui/PageFeedback";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const searchIndex = buildSearchIndex();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-gold focus:px-3 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <MarketStrip />
      <Header searchIndex={searchIndex} />
      <div id="main" className="flex-1">
        {children}
        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
          <PageFeedback />
        </div>
      </div>
      <Footer />
      <PageCounter />
      <AppInstall />
    </>
  );
}
