"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Tip = { label: string; value: string; left: number; top: number };

/**
 * The hover, tap and keyboard tooltip for one chart. It sits beside the server-drawn SVG (lib/charts/render.ts) and
 * reads each bar's period and value from its data attributes, so the chart itself ships no script and no data twice.
 * Mouse: hover. Phone: tap a bar (tap elsewhere to close). Keyboard: Tab to a bar, arrows to move, Escape to close.
 * Screen readers get the same figures from each bar's label and from the chart's hidden table, so the tooltip itself
 * is hidden from them.
 */
export function ChartTips({ unit }: { unit: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);

  // Centre the tooltip over its bar, then keep it inside the chart so it never pushes the page sideways.
  useLayoutEffect(() => {
    const el = tipRef.current;
    const box = ref.current;
    if (!el || !box || !tip) return;
    const left = Math.min(Math.max(0, tip.left - el.offsetWidth / 2), Math.max(0, box.clientWidth - el.offsetWidth));
    el.style.left = `${left}px`;
    // Above the bar's value label (floating over the title if need be), otherwise just below the bar's top.
    const above = tip.top - 24 - el.offsetHeight;
    el.style.top = `${above >= -140 ? above : tip.top + 8}px`;
    el.style.visibility = "visible";
  }, [tip]);

  useEffect(() => {
    const box = ref.current?.parentElement;
    const svg = box?.querySelector("svg");
    if (!box || !svg) return;
    const vb = svg.viewBox.baseVal;
    const points = Array.from(svg.querySelectorAll<SVGGElement>(".chart-pt"));
    let active: SVGGElement | null = null;

    const show = (g: SVGGElement) => {
      active?.classList.remove("is-active");
      active = g;
      g.classList.add("is-active");
      const scale = svg.getBoundingClientRect().width / vb.width;
      setTip({
        label: g.dataset.label ?? "",
        value: g.dataset.value ?? "",
        left: Number(g.dataset.cx) * scale,
        top: Number(g.dataset.top) * scale,
      });
    };
    const hide = () => {
      active?.classList.remove("is-active");
      active = null;
      setTip(null);
    };
    const pointAt = (e: Event) => (e.target as Element | null)?.closest?.(".chart-pt") as SVGGElement | null;

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const g = pointAt(e);
      if (g) show(g);
    };
    const onLeave = (e: PointerEvent) => e.pointerType === "mouse" && hide();
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const g = pointAt(e);
      if (g) show(g);
    };
    const onOutside = (e: PointerEvent) => !box.contains(e.target as Node) && hide();
    const onFocus = (e: FocusEvent) => {
      const g = pointAt(e);
      if (g) show(g);
    };
    const onBlur = (e: FocusEvent) => !box.contains(e.relatedTarget as Node | null) && hide();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return hide();
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const i = points.indexOf(pointAt(e) as SVGGElement);
      const next = points[i + (e.key === "ArrowRight" ? 1 : -1)];
      if (i >= 0 && next) {
        e.preventDefault();
        next.focus();
      }
    };

    svg.addEventListener("pointerover", onOver);
    svg.addEventListener("pointerleave", onLeave);
    svg.addEventListener("pointerdown", onDown);
    svg.addEventListener("focusin", onFocus);
    svg.addEventListener("focusout", onBlur);
    svg.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    return () => {
      svg.removeEventListener("pointerover", onOver);
      svg.removeEventListener("pointerleave", onLeave);
      svg.removeEventListener("pointerdown", onDown);
      svg.removeEventListener("focusin", onFocus);
      svg.removeEventListener("focusout", onBlur);
      svg.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0">
      {tip ? (
        <div
          ref={tipRef}
          className="chart-tip invisible absolute left-0 w-max max-w-[14rem] top-0 rounded-lg border border-rule bg-surface px-2.5 py-1.5 text-[12.5px] leading-5 text-ink shadow-md"
        >
          <span className="block text-[11.5px] text-muted">{tip.label}</span>
          <span className="tabular block text-[15px] font-semibold">{tip.value}</span>
          <span className="block text-[11.5px] text-ink-soft">{unit}</span>
        </div>
      ) : null}
    </div>
  );
}
