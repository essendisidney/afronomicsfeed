import { buildSearchIndex } from "@/lib/search";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MarketStrip } from "@/components/ui/MarketStrip";
import { PageCounter } from "./PageCounter";
import { AppInstall } from "./AppInstall";
import { PageFeedback } from "@/components/ui/PageFeedback";
import { MicroSurvey } from "@/components/ui/MicroSurvey";

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
      <main id="main" className="flex-1">
        {children}
        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
          <PageFeedback />
        </div>
        <MicroSurvey />
      </main>
      <Footer />
      {/* Room for the phone tab bar (components/layout/Header.tsx), so it never covers the footer. */}
      <div aria-hidden="true" className="h-[calc(3.5rem+env(safe-area-inset-bottom))] lg:hidden" />
      <PageCounter />
      <AppInstall />
    </>
  );
}
