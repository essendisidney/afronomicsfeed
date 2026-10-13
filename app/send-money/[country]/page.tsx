import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { SendMoneyTable } from "@/components/data/SendMoneyTable";
import { Questions } from "@/components/seo/Questions";
import { corridorsTo, countryName, destSlug, loadRemittances, periodLabel } from "@/lib/data/remittances";
import { fitDescription, fitTitle } from "@/lib/seo";
import { site } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: Promise<{ country: string }> };

export function generateStaticParams() {
  return [...new Set((loadRemittances()?.corridors ?? []).map((c) => destSlug(c.dst_name)))].map((country) => ({ country }));
}

const usd = (pct: number) => `$${((200 * pct) / 100).toFixed(2)}`;

function view(slug: string) {
  const list = corridorsTo(slug);
  if (!list.length) return null;
  const name = countryName(list[0].dst_name);
  const best = [...list].sort((a, b) => a.cheapest.cost_pct - b.cheapest.cost_pct)[0];
  return { list, name, best };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const v = view(country);
  if (!v) return {};
  return {
    title: fitTitle(`Cheapest way to send money to ${v.name}`),
    description: fitDescription(
      `Sending $200 to ${v.name}: cheapest is ${v.best.cheapest.firm} from ${countryName(v.best.src_name)} at ${usd(v.best.cheapest.cost_pct)}. Every service the World Bank surveyed, from ${v.list.length} sending countries, ranked by total cost.`,
    ),
    alternates: { canonical: `${site.url}/send-money/${country}` },
  };
}

export default async function SendMoneyCountryPage({ params }: Props) {
  const { country } = await params;
  const v = view(country);
  if (!v) notFound();
  const file = loadRemittances()!;
  const period = periodLabel(file.period);
  const items = [
    {
      q: `What is the cheapest way to send money to ${v.name}?`,
      a: `In the World Bank's latest survey (${period}), the cheapest service into ${v.name} was ${v.best.cheapest.firm} from ${countryName(v.best.src_name)}, at ${usd(v.best.cheapest.cost_pct)} to send $200 (${v.best.cheapest.cost_pct.toFixed(2)}%, fee plus exchange-rate margin). The cheapest service depends on where you send from; each sending country is listed on this page.`,
    },
    {
      q: "Why compare the total cost and not just the fee?",
      a: "Many services advertise a low or zero fee but give a worse exchange rate. The total cost adds the fee and the exchange-rate margin together, so it shows what the person at home actually loses.",
    },
  ];
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/send-money", label: "Send money home" }, { label: v.name }]}
      kicker="Afronomics comparison · sending money"
      title={`Cheapest way to send money to ${v.name}`}
      lede={
        <p>
          Every service the World Bank surveyed into {v.name}, ranked by what it really costs to send $200: the fee plus the exchange-rate margin. Pick the country you send from.
        </p>
      }
      aside={
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
          <p className="text-[13px] font-medium text-muted">Cheapest surveyed into {v.name}</p>
          <p className="mt-1 font-serif text-3xl text-ink">{usd(v.best.cheapest.cost_pct)}</p>
          <p className="mt-1 text-[14px] text-ink">{v.best.cheapest.firm}</p>
          <p className="mt-1 text-[12px] text-muted">to send $200 from {countryName(v.best.src_name)}</p>
        </div>
      }
    >
      <nav className="flex flex-wrap gap-2" aria-label="Sending country">
        {v.list.map((c) => (
          <a key={c.src} href={`#from-${c.src.toLowerCase()}`} className="rounded-full border border-rule bg-surface px-3 py-1 text-[13px] text-ink hover:border-accent">
            From {countryName(c.src_name)}
          </a>
        ))}
      </nav>

      <p className="mt-5 max-w-3xl rounded-xl border border-rule bg-surface px-4 py-3 text-[13px] leading-5 text-ink-soft">
        If you send money through some of these buttons, Afronomics may earn a fee from the provider. It never changes the order: services are ranked by
        cost alone, and services that pay us nothing are listed the same way. Prices are from the World Bank&rsquo;s survey of {period}; check the
        provider&rsquo;s live price before you send. Information, not advice.
      </p>

      {v.list.map((c) => (
        <section key={c.src} id={`from-${c.src.toLowerCase()}`} className="mt-12 scroll-mt-24">
          <SectionTitle kicker={`${countryName(c.src_name)} to ${v.name}`} title={`From ${countryName(c.src_name)}: ${c.cheapest.firm} is cheapest at ${usd(c.cheapest.cost_pct)}`} />
          <div className="mt-4">
            <SendMoneyTable c={c} />
          </div>
        </section>
      ))}

      <p className="mt-10 text-sm text-ink-soft">
        Source:{" "}
        <a href={file.source_page} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          World Bank, Remittance Prices Worldwide
        </a>{" "}
        ({period}). Every African destination:{" "}
        <Link href="/send-money" className="font-medium text-forest underline underline-offset-2">
          send money home
        </Link>
        .
      </p>
      {country === "kenya" ? (
        <p className="mt-8 text-sm">
          <Link href="/diaspora" className="font-semibold text-forest underline underline-offset-2">
            Living abroad? The Diaspora Desk: what money earns at home after tax, and how to invest from abroad →
          </Link>
        </p>
      ) : null}
      <Questions items={items} />
      <NewsletterBand />
    </PageShell>
  );
}
