"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex min-h-11 items-center rounded-full border border-rule bg-surface px-4 py-2 text-[13px] font-medium text-forest hover:border-gold hover:text-gold sm:min-h-10"
    >
      Print or save as PDF
    </button>
  );
}
