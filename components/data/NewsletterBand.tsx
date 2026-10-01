import { SubscribeForm } from "@/components/ui/SubscribeForm";

export function NewsletterBand({ title = "The Afronomics Morning", lede }: { title?: string; lede?: string }) {
  return (
    <section className="on-night mt-16 grid gap-8 rounded-3xl bg-night px-6 py-10 text-night-ink sm:px-10 lg:grid-cols-2 lg:py-12">
      <div>
        <p className="text-[14px] font-medium text-accent">Free, every weekday at 7:00</p>
        <h2 className="mt-2 font-serif text-4xl leading-none">{title}</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-night-soft">
          {lede ??
            "Africa’s markets before 7am: the currencies that moved overnight, the auction results that landed, what is due today and the headlines that matter. Plus the Weekly every Monday."}
        </p>
      </div>
      <SubscribeForm tone="night" />
    </section>
  );
}
