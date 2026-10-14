import type { Metadata } from "next";
import Link from "next/link";
import { EvidenceTag } from "@/components/evidence/EvidenceTag";
import { swDate } from "@/lib/editions/morning-sw";
import { fitDescription } from "@/lib/seo";
import { site } from "@/lib/site";
import { ourRecord, whatChanged, type TodayMove } from "@/lib/today";

export const revalidate = 900;

const title = `${site.name}: pesa za Afrika zilifanya nini leo, na kwa nini`;
const description =
  "Kumbukumbu ya Afrika yenye tarehe ya kile pesa zilifanya: gharama ya mikopo ya serikali, sarafu na riba za akiba, kutoka kwa chanzo chenyewe. Kwa Kiswahili.";

export const metadata: Metadata = {
  title: { absolute: title },
  description: fitDescription(description),
  alternates: { canonical: `${site.url}/sw`, languages: { en: site.url, sw: `${site.url}/sw` } },
  openGraph: { title, description, url: `${site.url}/sw`, siteName: site.name, locale: "sw_KE", type: "website" },
};

function MoveCard({ move }: { move: TodayMove }) {
  return (
    <li className="flex flex-col rounded-2xl border border-rule bg-surface px-5 py-5">
      <p className={`text-[12px] font-semibold uppercase tracking-[0.12em] ${move.direction === "up" ? "text-up" : "text-down"}`}>
        <span aria-hidden="true">{move.direction === "up" ? "▲" : "▼"}</span> {move.kind === "fx" ? "Sarafu" : "Mikopo ya serikali"}
      </p>
      <h3 className="mt-2 font-serif text-[1.3rem] leading-snug text-ink text-balance">
        <Link href={move.href} className="hover:text-forest">
          {move.sw.headline}
        </Link>
      </h3>
      {move.sw.shillings ? <p className="tabular mt-3 text-[15px] font-semibold leading-6 text-ink">{move.sw.shillings}.</p> : null}
      <p className="mt-2 text-[14px] leading-6 text-ink-soft">
        <span className="font-semibold text-ink">Inawagusa:</span> {move.sw.touches}.
      </p>
      <div className="mt-auto pt-4">
        <EvidenceTag {...move.evidence} />
      </div>
    </li>
  );
}

export default async function TodaySwPage() {
  const [moves, record] = await Promise.all([whatChanged(), Promise.resolve(ourRecord())]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div lang="sw" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="border-b border-rule pb-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">
          Leo · <time dateTime={today}>{swDate(today)}</time>
        </p>
        <h1 className="mt-2 max-w-3xl font-serif text-[2rem] leading-tight text-ink text-balance sm:text-[2.6rem]">
          Kumbukumbu ya Afrika yenye tarehe: pesa zilifanya nini, kwa nini, na nini kilifuata.
        </h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-7 text-ink-soft">
          Kila takwimu inataja chanzo chake na tarehe yake. Gusa lebo kufungua chanzo.{" "}
          <em className="not-italic font-semibold text-ink">Ni taarifa, si ushauri.</em>{" "}
          <Link href="/" lang="en" hrefLang="en" className="underline underline-offset-2">
            Read in English
          </Link>
        </p>
      </header>

      <section aria-labelledby="kilichobadilika" className="mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="kilichobadilika" className="font-serif text-2xl text-ink sm:text-3xl">
            Kilichobadilika
          </h2>
          <Link href="/morning/sw" className="inline-flex min-h-11 items-center text-[14px] font-semibold text-forest hover:text-gold">
            Asubuhi ya Afronomics →
          </Link>
        </div>
        {moves.length ? (
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {moves.map((move) => (
              <MoveCard key={move.id} move={move} />
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-rule bg-surface px-5 py-5 text-[15px] text-ink-soft">
            Hakuna soko tunalofuatilia lililochapisha matokeo yaliyobadilika wiki iliyopita.
          </p>
        )}
        <p className="mt-3 text-[13px] leading-5 text-muted">
          Jinsi zinavyochaguliwa: mabadiliko makubwa zaidi ya riba ya mnada katika soko lolote ndani ya siku 7 (dhidi ya mnada uliopita wa muda uleule),
          mabadiliko makubwa zaidi ya usiku kucha kati ya sarafu za Afrika, na mabadiliko makubwa zaidi ya Kenya (au yanayofuata mahali pengine). Hesabu za
          shilingi zinafanywa na programu kutoka kwa riba zilizochapishwa; hakuna kinachokadiriwa na modeli.
        </p>
      </section>

      {record ? (
        <section aria-labelledby="rekodi" className="mt-12 grid gap-6 rounded-3xl border border-rule bg-surface px-6 py-7 sm:px-8 lg:grid-cols-[1fr_2fr] lg:items-center">
          <div>
            <h2 id="rekodi" className="font-serif text-2xl text-ink sm:text-3xl">
              Jinsi mbinu ilivyofanya
            </h2>
            <p className="tabular mt-3 font-serif text-[2.6rem] leading-none text-ink">{Math.round(record.share * 100)}%</p>
          </div>
          <div>
            <p className="tabular text-[16px] leading-7 text-ink">
              Kabla ya kila mnada wa hati za hazina za Kenya tunaonyesha kiwango kinachotarajiwa kwa kila muda. Ikijaribiwa kwenye minada{" "}
              {record.tested.toLocaleString("en-US")} iliyopita ya muda {record.tenors} tangu 2011, matokeo yaliangukia ndani ya kiwango mara{" "}
              {record.inside.toLocaleString("en-US")}. Hili ni jaribio la mbinu kwenye minada ya zamani, si viwango tulivyochapisha wakati huo.
            </p>
            <div className="mt-3">
              <EvidenceTag source="Central Bank of Kenya auction results" href={record.source} asOf={record.asOf} />
            </div>
          </div>
        </section>
      ) : null}

      <p className="mt-10 text-[14px] text-ink-soft">
        Zaidi kwa Kiswahili:{" "}
        <Link href="/morning/sw" className="underline underline-offset-2">
          Asubuhi ya Afronomics
        </Link>{" "}
        ·{" "}
        <Link href="/learn/sw" className="underline underline-offset-2">
          Jifunze
        </Link>
      </p>
    </div>
  );
}
