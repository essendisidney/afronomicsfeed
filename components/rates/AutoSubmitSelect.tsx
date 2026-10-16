"use client";

import type { ReactNode } from "react";

/** A select that submits its form as soon as a choice is made (the form still has a button for no-script readers). */
export function AutoSubmitSelect({ name, defaultValue, className, children, label }: { name: string; defaultValue?: string; className?: string; children: ReactNode; label: string }) {
  return (
    <select name={name} defaultValue={defaultValue} aria-label={label} className={className} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
      {children}
    </select>
  );
}
