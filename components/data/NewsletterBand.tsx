import { SubscribeForm } from "@/components/ui/SubscribeForm";

/** One sign-up gets both editions: the Morning every weekday and the Weekly on Monday (lib/welcome-email.ts). */
export function NewsletterBand({
  title = "The Afronomics Morning",
  kicker = "Free · a two-minute read before 07:30, every weekday",
  lede,
}: {
  title?: string;
  kicker?: string;
  lede?: string;
}) {
  return (
    <section className="on-night mt-16 grid gap-8 rounded-3xl bg-night px-6 py-10 text-night-ink sm:px-10 lg:grid-cols-2 lg:py-12">
      <div>
        <p className="text-[14px] font-medium text-accent">{kicker}</p>
        <h2 className="mt-2 font-serif text-4xl leading-none">{title}</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-night-soft">
          {lede ??
            "Today’s rates, currencies and auction results before the day starts: what the T-bill paid this week, what moved overnight, what is due today. Every figure from the source."}
        </p>
        <p className="mt-3 max-w-md text-sm leading-6 text-night-ink">
          <span className="font-semibold text-accent">Free when you sign up:</span> our guide to where your shilling earns most — T-bills, money market
          funds, SACCOs and banks, after tax.
        </p>
      </div>
      <SubscribeForm tone="night" />
    </section>
  );
}
