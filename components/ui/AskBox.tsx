"use client";

import { useState, type FormEvent } from "react";

type Answer = { ok: boolean; q?: string; answer?: string; sources?: { label: string; href: string }[]; understood?: boolean; suggestions?: string[]; reason?: string };

export function AskBox({ initial = "", suggestions = [] }: { initial?: string; suggestions?: string[] }) {
  const [q, setQ] = useState(initial);
  const [a, setA] = useState<Answer | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(question: string) {
    const text = question.trim();
    if (text.length < 3) return;
    setBusy(true);
    setQ(text);
    try {
      const r = await fetch(`/api/ask?q=${encodeURIComponent(text)}`);
      setA((await r.json()) as Answer);
      if (typeof window !== "undefined") window.history.replaceState(null, "", `/ask?q=${encodeURIComponent(text)}`);
    } catch {
      setA({ ok: false, reason: "Could not reach the data." });
    } finally {
      setBusy(false);
    }
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void run(q);
  }

  return (
    <div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What is Kenya's 91-day rate?"
          maxLength={300}
          className="w-full rounded-full border border-rule bg-surface px-5 py-3 text-[15px] text-ink outline-none placeholder:text-muted focus:border-accent"
          aria-label="Your question"
        />
        <button type="submit" disabled={busy} className="shrink-0 rounded-full bg-ink px-5 py-3 text-[14px] font-semibold text-paper hover:bg-forest disabled:opacity-60">
          {busy ? "…" : "Ask"}
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {(a?.suggestions ?? suggestions).map((s) => (
          <button key={s} type="button" onClick={() => void run(s)} className="rounded-full border border-rule bg-surface px-3 py-1 text-[12.5px] text-ink-soft hover:border-accent hover:text-ink">
            {s}
          </button>
        ))}
      </div>
      {a ? (
        <div className={`mt-6 rounded-2xl border px-5 py-5 ${a.ok && a.understood ? "border-rule bg-surface" : "border-down/30 bg-surface"}`} aria-live="polite">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-accent">{a.ok && a.understood ? "From the data" : "Not in the data"}</p>
          <p className="mt-2 text-[16px] leading-7 text-ink">{a.answer ?? a.reason}</p>
          {a.sources?.length ? (
            <p className="mt-3 text-[12.5px] text-muted">
              Source{a.sources.length > 1 ? "s" : ""}:{" "}
              {a.sources.map((s, i) => (
                <span key={s.href}>
                  <a href={s.href} className="underline underline-offset-2 hover:text-ink">
                    {s.label}
                  </a>
                  {i < a.sources!.length - 1 ? " · " : ""}
                </span>
              ))}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
