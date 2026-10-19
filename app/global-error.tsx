"use client";

/**
 * Last resort when the root layout itself fails: it replaces the whole document, so global styles do not load and the
 * brand colours are written in (light and dark, as in app/globals.css).
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <title>Something went wrong · Afronomics</title>
        <style>{`
          :root { color-scheme: light dark; --paper: #f7f3ef; --ink: #1d1512; --soft: #45372f; --accent: #a33a1c; }
          @media (prefers-color-scheme: dark) { :root { --paper: #120d0b; --ink: #f1e9e4; --soft: #d4c6bd; --accent: #f2916d; } }
          body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
          main { max-width: 36rem; margin: 0 auto; padding: 6rem 1rem; text-align: center; }
          h1 { font: 2.25rem/1.15 Georgia, "Times New Roman", serif; margin: .75rem 0 0; }
          p { color: var(--soft); font-size: .875rem; }
          .k { color: var(--accent); font-weight: 600; font-size: 12.5px; }
          .row { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem; }
          button, a { min-height: 44px; box-sizing: border-box; border-radius: 999px; padding: .75rem 1.25rem; font: 600 14px system-ui, sans-serif; cursor: pointer; text-decoration: none; }
          button { background: var(--accent); color: var(--paper); border: 0; }
          a { color: var(--ink); border: 1px solid currentColor; }
        `}</style>
        <main>
          <p className="k">Something went wrong</p>
          <h1>Afronomics did not load</h1>
          <p>Trying again usually works.</p>
          <div className="row">
            <button type="button" onClick={() => retry()}>
              Try again
            </button>
            {/* A full page load on purpose: the root layout failed, so client navigation cannot be trusted. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/">Return home</a>
          </div>
          {error.digest ? <p>Reference {error.digest}</p> : null}
        </main>
      </body>
    </html>
  );
}
