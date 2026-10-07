"use client";

import { useSyncExternalStore } from "react";

/** Marks this browser as the owner's, so its visits never count as readers. Opening the desk on a device is enough. */
function mark(): boolean {
  try {
    localStorage.setItem("af_owner", "1");
    return true;
  } catch {
    return false;
  }
}

const noop = () => () => {};

export function OwnerDevice() {
  const on = useSyncExternalStore(noop, mark, () => null);
  if (on == null) return null;
  return (
    <p className="text-[12px] text-muted">
      {on ? "This device is yours: your visits are not counted as readers. Open the desk once on each phone and laptop you use." : "This browser blocks storage, so its visits are still counted."}
    </p>
  );
}
