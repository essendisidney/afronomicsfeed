"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

/** Registers the service worker and offers "Install app" where the browser supports it (Chrome, Edge, Android). */
export function AppInstall() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => undefined);
    }
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallEvent);
    };
    const onInstalled = () => setPrompt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!prompt) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        await prompt.prompt();
        await prompt.userChoice.catch(() => undefined);
        setPrompt(null);
      }}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-forest px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-paper shadow-lg hover:bg-forest-deep"
    >
      <span aria-hidden className="flex items-end gap-[2px]">
        {[6, 10, 13, 9].map((h, i) => (
          <span key={i} className="inline-block w-[3px] bg-gold-soft" style={{ height: h }} />
        ))}
      </span>
      Install the Afronomics app
    </button>
  );
}
