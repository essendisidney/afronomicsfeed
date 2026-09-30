import { SubscribeForm } from "@/components/ui/SubscribeForm";

export function NewsletterBand({ title = "The Afronomics Weekly", lede }: { title?: string; lede?: string }) {
  return (
    <section className="mt-16 grid gap-8 bg-night px-6 py-10 text-night-ink sm:px-10 lg:grid-cols-2">
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-soft">Free · every Monday</p>
        <h2 className="mt-2 font-serif text-3xl tracking-[-0.02em]">{title}</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-night-soft">
          {lede ??
            "The week’s moves across 54 economies in five minutes: currencies, rates, DFI approvals, the prints that changed, and what to watch next."}
        </p>
      </div>
      <SubscribeForm tone="night" />
    </section>
  );
}
