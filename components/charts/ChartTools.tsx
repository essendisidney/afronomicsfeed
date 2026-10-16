"use client";

import { useRef, useState } from "react";
import type { ChartExport } from "@/lib/charts/export";

/**
 * Download, embed and share for one chart. The work (drawing the PNG, writing the CSV) lives in lib/charts/export.ts
 * and loads only when a reader presses a button, so the page's script budget does not pay for it.
 */
export function ChartTools({ chart }: { chart: ChartExport }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const png = useRef<Promise<Blob> | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const snippet = `<iframe src="${chart.embedUrl}" title="${chart.title.replace(/"/g, "&quot;")}" width="100%" height="${chart.embedHeight}" style="border:0;max-width:640px" loading="lazy"></iframe>`;

  const lib = () => import("@/lib/charts/export");
  // Drawn once and reused, and started as soon as a finger or pointer reaches Share, so the share sheet opens while
  // the browser still counts it as the reader's tap.
  const pngBlob = () => (png.current ??= lib().then((m) => m.chartPng(chart)));

  async function download(kind: "png" | "csv") {
    setBusy(true);
    setStatus("");
    try {
      const m = await lib();
      const blob = kind === "png" ? await pngBlob() : m.csvBlob(chart);
      m.save(blob, `${chart.fileName}.${kind}`);
      setStatus(kind === "png" ? "Chart image saved." : "Chart data saved.");
    } catch {
      png.current = null;
      setStatus("Could not make the file. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    setStatus("");
    try {
      const blob = await pngBlob();
      const file = new File([blob], `${chart.fileName}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: chart.title, text: `${chart.title} ${chart.pageUrl}` });
        return;
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return; // the reader closed the share sheet
    }
    try {
      await navigator.clipboard.writeText(chart.pageUrl);
      setStatus("Link to this chart copied.");
    } catch {
      setStatus(`Copy this link: ${chart.pageUrl}`);
    }
  }

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setStatus("Embed code copied.");
    } catch {
      setStatus("Select the code and copy it.");
    }
  }

  const btn =
    "inline-flex min-h-11 items-center rounded-lg border border-rule bg-surface px-3 text-[13px] font-semibold text-ink hover:border-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent)] disabled:opacity-60";

  return (
    <div className="mt-3 border-t border-rule pt-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn} disabled={busy} onClick={() => download("png")}>
          Download PNG
        </button>
        <button type="button" className={btn} disabled={busy} onClick={() => download("csv")}>
          Download CSV
        </button>
        <button type="button" className={btn} onClick={() => dialog.current?.showModal()} aria-haspopup="dialog">
          Embed
        </button>
        <button type="button" className={btn} onClick={share} onPointerEnter={() => void pngBlob().catch(() => (png.current = null))} onFocus={() => void pngBlob().catch(() => (png.current = null))}>
          Share
        </button>
      </div>
      <p role="status" className="mt-1 min-h-5 text-[12.5px] text-muted">
        {status}
      </p>
      <dialog
        ref={dialog}
        aria-labelledby={`${chart.fileName}-embed`}
        className="m-auto w-[min(36rem,calc(100vw-2rem))] rounded-2xl border border-rule bg-surface p-0 text-ink backdrop:bg-black/50"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      >
        <div className="px-5 py-5">
          <h2 id={`${chart.fileName}-embed`} className="t-h3 text-ink">
            Embed this chart
          </h2>
          <p className="mt-1 text-[14px] leading-6 text-ink-soft">
            Paste this code into your page. The chart resizes to fit, carries its source and links back to this Receipt. Free to use with the credit in place.
          </p>
          <label className="mt-3 block text-[12.5px] font-semibold text-muted" htmlFor={`${chart.fileName}-code`}>
            Embed code
          </label>
          <textarea
            id={`${chart.fileName}-code`}
            readOnly
            rows={4}
            value={snippet}
            onFocus={(e) => e.currentTarget.select()}
            className="mt-1 block w-full resize-none rounded-lg border border-rule bg-paper px-3 py-2 font-mono text-[12px] leading-5 text-ink"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={btn} onClick={copySnippet}>
              Copy code
            </button>
            <a href={chart.embedUrl} target="_blank" rel="noopener" className={btn}>
              Preview
            </a>
            <button type="button" className={btn} onClick={() => dialog.current?.close()}>
              Close
            </button>
          </div>
          <p role="status" className="mt-2 min-h-5 text-[12.5px] text-muted">
            {status === "Embed code copied." || status === "Select the code and copy it." ? status : ""}
          </p>
        </div>
      </dialog>
    </div>
  );
}
