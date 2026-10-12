"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print rounded-full border border-rule bg-surface px-4 py-2 text-[13px] font-medium text-forest hover:border-gold hover:text-gold"
    >
      Print or save as PDF
    </button>
  );
}
