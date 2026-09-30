import { SubscribeForm } from "@/components/ui/SubscribeForm";

export function NewsletterBand({ title = "The Afronomics Weekly", lede }: { title?: string; lede?: string }) {
  return (
    <section className="on-night mt-16 grid gap-8 rounded-3xl bg-night px-6 py-10 text-night-ink sm:px-10 lg:grid-cols-2 lg:py-12">
      <div>
        <p className="text-[14px] font-medium text-accent">Free, every Monday</p>
        <h2 className="mt-2 font-serif text-4xl leading-none">{title}</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-night-soft">
          {lede ??
            "The week’s moves across 54 economies in five minutes: currencies, rates, DFI approvals, the prints that changed, and what to watch next."}
        </p>
      </div>
      <SubscribeForm tone="night" />
    </section>
  );
}
