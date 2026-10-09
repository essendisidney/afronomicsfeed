import { RateAlertForm } from "@/components/ui/RateAlertForm";
import { SubscribeForm } from "@/components/ui/SubscribeForm";
import type { AlertKind } from "@/lib/rate-alerts-core";

/**
 * "Get the next one": asked at the moment a reader has just got something useful (a rate check's answer, the end
 * of a story), not at the foot of the page. One rate alert matched to the page, and the free weekday Morning.
 */
export function FollowUp({
  heading = "Get the next one",
  alert = "auction",
  alertTitle = "Every Thursday: Kenya’s T-bill result",
  alertNote = "One short email when CBK publishes the auction, with the rates and the source.",
}: {
  heading?: string;
  alert?: AlertKind;
  alertTitle?: string;
  alertNote?: string;
}) {
  return (
    <aside
      className="no-print mt-6 rounded-2xl border border-accent/40 bg-surface px-5 py-5"
      aria-label={heading}
    >
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
        {heading}
      </p>
      <div className="mt-3 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-[15px] font-semibold text-ink">{alertTitle}</p>
          <p className="mt-1 text-[13px] leading-5 text-ink-soft">
            {alertNote} Free; confirm by email; stop with one click.
          </p>
          <div className="mt-3">
            <RateAlertForm kinds={[alert]} compact />
          </div>
        </div>
        <div>
          <p className="text-[15px] font-semibold text-ink">
            The Morning, every weekday at 7:00
          </p>
          <p className="mt-1 text-[13px] leading-5 text-ink-soft">
            Rates, currencies and auction results before the day starts. Free, with our guide to where your shilling earns most.
          </p>
          <div className="mt-3">
            <SubscribeForm />
          </div>
        </div>
      </div>
    </aside>
  );
}
