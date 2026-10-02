import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { ShareRow } from "@/components/ui/ShareRow";
import { renderTime } from "@/lib/data/fetcher";
import { pairHref } from "@/lib/data/fx";
import { buildMorningNote, morningSigned } from "@/lib/editions/morning";
import { morningLinesSw, morningTitleSw, swCountry, swCurrency, swDate } from "@/lib/editions/morning-sw";
import { site } from "@/lib/site";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Asubuhi ya Afronomics — masoko ya Afrika kabla ya saa moja",
  description:
    "Kila siku ya kazi saa moja asubuhi, Nairobi: sarafu zilizobadilika usiku kucha, matokeo ya minada ya hati za hazina, yanayotarajiwa leo, na hati za siku 364 katika masoko kumi ya Afrika. Kwa Kiswahili.",
  alternates: { canonical: `${site.url}/morning/sw`, languages: { en: `${site.url}/morning`, sw: `${site.url}/morning/sw` } },
};

export default async function MorningSwPage() {
  const note = await buildMorningNote(renderTime());
  const lines = morningLinesSw(note);

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Mwanzo" }, { href: "/morning", label: "Morning" }, { label: "Kiswahili" }]}
      kicker={`Asubuhi ya Afronomics · ${swDate(note.day)}`}
      title="Masoko ya Afrika kabla ya saa moja"
      lede={
        lines.length ? (
          <ul className="space-y-2">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p>Sarafu zilizobadilika usiku kucha, matokeo ya minada yaliyoingia, yanayotarajiwa leo, na habari muhimu.</p>
        )
      }
      aside={
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5 text-sm text-ink-soft">
          <p className="text-[14px] font-semibold text-ink">Kila asubuhi, bure</p>
          <p className="mt-1 leading-6">Namba zile zile zinazotumiwa na benki na wawekezaji, kwa lugha rahisi. Kila namba ina chanzo chake.</p>
          <Link href="/subscribe?list=morning" className="mt-4 inline-block rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-paper hover:bg-forest">
            Jisajili
          </Link>
          <p className="mt-4 text-[13px] leading-5">
            <Link href="/morning" className="underline underline-offset-2 hover:text-accent">Read in English</Link> ·{" "}
            <a href="/api/edition/morning?format=whatsapp&lang=sw" className="underline underline-offset-2 hover:text-accent">Maandishi ya WhatsApp</a>
          </p>
        </div>
      }
    >
      <div className="grid gap-12 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <SectionTitle kicker="Usiku kucha" title="Dhidi ya dola" href="/markets" hrefLabel="Viwango vyote" />
          {note.fx.moves.length ? (
            <table className="data-table mt-2">
              <tbody>
                {note.fx.moves.slice(0, 8).map((m) => (
                  <tr key={m.code}>
                    <td>
                      <Link href={pairHref(m.code)} className="hover:text-forest">
                        {swCurrency(m.code, m.name)}
                      </Link>
                    </td>
                    <td className="text-right text-sm">{m.now.toFixed(m.now >= 100 ? 1 : 3)}</td>
                    <td className={`text-right text-sm font-medium ${m.changePct > 0.005 ? "text-up" : m.changePct < -0.005 ? "text-down" : "text-muted"}`}>{morningSigned(m.changePct)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">Mabadiliko ya usiku yanaonekana baada ya siku mbili kuhifadhiwa.</p>
          )}
          <p className="mt-2 text-xs text-muted">Thamani ya kila sarafu dhidi ya dola; namba chanya ina maana sarafu iliimarika.</p>
        </section>

        <section className="lg:col-span-7">
          <SectionTitle kicker="Minada" title={note.auctions.length ? "Matokeo yaliyoingia" : "Hakuna matokeo mapya"} href="/markets/tbills" hrefLabel="Hati za hazina" />
          {note.auctions.length ? (
            <table className="data-table mt-2">
              <thead>
                <tr>
                  <th>Soko</th>
                  <th>Muda</th>
                  <th className="text-right">Riba</th>
                  <th className="text-right">Badiliko</th>
                </tr>
              </thead>
              <tbody>
                {note.auctions.map((a) => (
                  <tr key={`${a.market.slug}-${a.tenor}`}>
                    <td>
                      <Link href={a.market.href} className="font-medium hover:text-forest">
                        {swCountry(a.market.country)}
                      </Link>
                    </td>
                    <td>siku {a.tenor}</td>
                    <td className="text-right text-sm">{a.rate.toFixed(2)}%</td>
                    <td className={`text-right text-sm ${a.bps == null || a.bps === 0 ? "text-muted" : a.bps > 0 ? "text-down" : "text-up"}`}>{a.bps == null ? "—" : `${morningSigned(a.bps, 0)} pointi`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          {note.due.length ? (
            <p className="mt-4 text-sm text-ink-soft">Yanayotarajiwa: {note.due.map((d) => `${swCountry(d.market.country)} (${d.expected === note.day ? "leo" : "kesho"})`).join(", ")}.</p>
          ) : null}
          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-5">
            {note.board.map((b) => (
              <Link key={b.market.slug} href={b.market.href} className="bg-surface px-3 py-3 hover:bg-paper-2">
                <span className="block text-[12px] text-muted">{swCountry(b.market.country)} siku 364</span>
                <span className="block font-serif text-xl text-ink">{b.rate.toFixed(2)}%</span>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Riba ya hati ya hazina ya siku 364 ya hivi punde katika kila soko, kutoka kwa benki kuu husika.</p>
        </section>
      </div>

      <ShareRow text={lines[0] ? `Asubuhi ya Afronomics: ${lines[0]}` : morningTitleSw(note)} path="/morning/sw" label="Sambaza" />

      <section className="mt-14 rounded-2xl border border-rule bg-surface px-5 py-5 text-sm leading-6 text-ink-soft">
        <p className="text-[14px] font-semibold text-ink">Maneno machache</p>
        <p className="mt-2">
          <strong>Hati ya hazina</strong> ni mkopo wa muda mfupi unaotolewa na serikali: unaipa serikali pesa leo, inakurudishia pesa yote pamoja na riba baada ya siku 91, 182 au
          364. <strong>Riba</strong> ni ile serikali inakubali kulipa kwenye mnada wa wiki hiyo. <strong>Pointi</strong> ni mia moja ya asilimia: pointi 25 ni 0.25%.
          Kila ukurasa wa mnada una kipengele cha <Link href="/markets/kenya-tbills" className="underline underline-offset-2">“KES 100,000 inamaanisha nini”</Link> kwa Kiswahili.
        </p>
      </section>
    </PageShell>
  );
}
