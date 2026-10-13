"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { isOwnerDevice, track } from "@/lib/track";

/** Pages for institutions: they get "What would you pay for next?" in place of the found-it question. */
export const INSTITUTIONAL_PATHS = /^\/(data\/frontier-local-debt|markets\/bonds|pricing|licensing|data-api)(\/|$)/;
/** Reader tools and guides: an optional "What do you use this for?". */
const READER_PATHS = /^\/(rates|prices|learn|send-money|rent-check|pay-check|chama|diaspora|guides|explainers|morning|brief|tenders|jobs)(\/|$)/;

type Q = "pay_next" | "use_for";

const QUESTIONS: Record<Q, { ask: string; note?: string; options: [string, string][]; other: string }> = {
  pay_next: {
    ask: "What would you pay for next?",
    options: [
      ["fx", "FX rates"],
      ["eurobonds", "Eurobonds"],
      ["inflation", "Inflation"],
      ["other", "Something else"],
    ],
    other: "What would it be?",
  },
  use_for: {
    ask: "What do you use this for?",
    note: "Optional",
    options: [
      ["work", "My work"],
      ["investing", "Investing"],
      ["business", "Running a business"],
      ["study", "Study"],
      ["personal", "My own money"],
      ["other", "Something else"],
    ],
    other: "Tell us in a few words (optional)",
  },
};

// Questions this browser has already answered or closed, read once per page load (nothing leaves the browser).
let answered: string | null = null;
const readAnswered = () => {
  if (answered == null) {
    try {
      answered = `${localStorage.getItem("af_survey_pay_next") ?? ""},${localStorage.getItem("af_survey_use_for") ?? ""}`;
    } catch {
      answered = "pay_next,use_for"; // storage blocked: do not ask on every page
    }
  }
  return answered;
};
const noop = () => () => {};

/**
 * One anonymous question, at most one per page: on institutional pages and after any data download, "What would
 * you pay for next?"; on reader tools, an optional "What do you use this for?". Each is asked until answered or
 * closed once in this browser. Answers go to /api/survey (migration 0034); the owner's own devices send nothing.
 */
export function MicroSurvey() {
  const path = usePathname() ?? "";
  const stored = useSyncExternalStore(noop, readAnswered, () => null);
  const [floating, setFloating] = useState(false);
  const [done, setDone] = useState<Q[]>([]);
  const [thanks, setThanks] = useState<{ q: Q; path: string } | null>(null);
  const [other, setOther] = useState<Q | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    const onDownload = () => setFloating(true);
    window.addEventListener("af:download", onDownload);
    return () => window.removeEventListener("af:download", onDownload);
  }, []);

  if (stored == null) return null;
  const isDone = (q: Q) => stored.includes(q) || done.includes(q);
  const pageQ: Q | null = INSTITUTIONAL_PATHS.test(path) ? "pay_next" : READER_PATHS.test(path) ? "use_for" : null;
  const afterDownload = floating && !isDone("pay_next");
  const q: Q | null = afterDownload ? "pay_next" : pageQ && !isDone(pageQ) ? pageQ : null;

  function close(question: Q) {
    try {
      localStorage.setItem(`af_survey_${question}`, question);
    } catch {}
    setDone((d) => [...d, question]);
    setOther(null);
    setNote("");
  }

  function answer(question: Q, value: string, text = "") {
    if (!isOwnerDevice()) {
      void fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, question, answer: value, note: text }),
        keepalive: true,
      }).catch(() => undefined);
      track("survey_answer");
    }
    close(question);
    setFloating(false);
    setThanks({ q: question, path });
  }

  const box = afterDownload
    ? "fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md rounded-2xl border border-rule bg-surface px-4 py-4 shadow-lg sm:left-auto sm:right-6 sm:mx-0"
    : "mt-12 border-t border-rule pt-4";

  if (!q) {
    return thanks && thanks.path === path ? <p className="mx-auto mt-12 max-w-7xl border-t border-rule px-4 pt-4 text-sm text-ink-soft sm:px-6">Thank you — the desk reads every answer.</p> : null;
  }

  const def = QUESTIONS[q];
  return (
    <section data-no-track className={afterDownload ? box : `mx-auto max-w-7xl px-4 sm:px-6 ${box}`} aria-label="One-question survey">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-soft">
          {afterDownload ? "Thanks for downloading. " : ""}
          {def.ask}
          {def.note ? <span className="text-muted"> ({def.note.toLowerCase()})</span> : null}
        </span>
        {other !== q
          ? def.options.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => (value === "other" ? setOther(q) : answer(q, value))}
                className="rounded-full border border-rule px-3 py-1 text-[12.5px] font-medium text-ink hover:border-gold"
              >
                {label}
              </button>
            ))
          : null}
        {afterDownload ? (
          <button type="button" onClick={() => close(q)} aria-label="Close" className="ml-auto px-2 text-muted hover:text-ink">
            ×
          </button>
        ) : null}
      </div>
      {other === q ? (
        <form
          className="mt-2 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            answer(q, "other", note);
          }}
        >
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={300}
            placeholder={def.other}
            aria-label={def.other}
            className="min-w-0 flex-1 border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted"
          />
          <button type="submit" className="rounded-full bg-forest px-4 py-2 text-[14px] font-semibold text-paper hover:bg-forest-deep">
            Send
          </button>
        </form>
      ) : null}
      <p className="mt-2 text-[11px] text-muted">
        Anonymous: no name or email is asked for or kept. Please don’t type personal details. <Link href="/legal/privacy" className="underline">Privacy</Link>
      </p>
    </section>
  );
}
