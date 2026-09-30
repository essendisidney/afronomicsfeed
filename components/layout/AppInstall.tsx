"use client";

import { Mark } from "@/components/brand/Wordmark";

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
      className="on-night fixed bottom-4 right-4 z-40 flex items-center gap-2.5 rounded-full bg-night py-2.5 pl-3 pr-5 text-[14px] font-semibold text-night-ink shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] ring-1 ring-night-line hover:bg-night-2"
    >
      <Mark className="h-6 w-auto" />
      Install the Afronomics app
    </button>
  );
}
