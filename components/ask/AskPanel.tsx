"use client";

import { useState } from "react";

const examples = [
  "How has Kenya’s currency performed against regional peers?",
  "Show climate finance deployed into East Africa.",
  "Which African countries attracted the most fintech capital?",
  "What happened to Nigerian inflation over the last 24 months?",
  "Which sectors are receiving DFI capital in Kenya?",
];

export function AskPanel() {
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState<string | null>(null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const next = question.trim();
        if (next) setAsked(next);
      }}
      className="border border-rule bg-paper-2 p-5"
    >
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">Ask Afronomics</span>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
          placeholder="Ask a question that can be answered from a cited observation…"
          className="mt-2 w-full border border-rule bg-paper px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold/40"
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        {examples.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setQuestion(item)}
            className="border border-rule px-2 py-1 text-left text-[11px] text-ink-soft hover:border-gold"
          >
            {item}
          </button>
        ))}
      </div>
      <button
        type="submit"
        className="mt-4 bg-forest px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-paper"
      >
        Retrieve with citations
      </button>
      {asked ? (
        <div className="mt-5 border-t border-rule pt-4 text-sm leading-6 text-ink-soft" role="status">
          <p className="font-serif text-lg text-ink">{asked}</p>
          <p className="mt-3">
            The document index is empty. Afronomics will not generate a number, ranking, or time series
            without a stored observation and a source citation. Connect `documents`, `document_chunks`,
            and pgvector embeddings before this desk answers.
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
            Fact / calculation / model signal / interpretation stay separate
          </p>
        </div>
      ) : null}
    </form>
  );
}
