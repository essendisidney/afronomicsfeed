import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Card } from "@/components/ui/Card";
import { whatsappChannelUrl } from "@/lib/channels";
import { renderTime } from "@/lib/data/fetcher";
import { buildMorningNote, morningLongDate } from "@/lib/editions/morning";
import { morningChannelText } from "@/lib/editions/morning-channel";
import { rpc } from "@/lib/store";
import { CopyPost } from "./CopyPost";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "WhatsApp Channel", robots: { index: false, follow: false } };

/**
 * Today's Morning as a WhatsApp Channel post, ready to copy (docs/rebuild/upgrade-U6-plan.md, item D). WhatsApp has
 * no free way for a server to post to a Channel, so posting is by hand from the phone: copy, open the channel, paste,
 * send. Behind the desk key; anyone else gets a 404. In local development the key "preview-empty" opens it.
 */
export default async function DeskWhatsAppPage() {
  const key = (await cookies()).get("af_desk")?.value ?? "";
  const preview = process.env.NODE_ENV === "development" && key === "preview-empty";
  if (!preview) {
    const check = key ? await rpc("af_desk", { p_secret: key }) : null;
    if (!check?.ok || check.value == null) notFound();
  }
  const note = await buildMorningNote(renderTime());
  const [en, sw] = await Promise.all([morningChannelText(note, "en"), morningChannelText(note, "sw")]);
  const channel = whatsappChannelUrl();

  return (
    <PageShell share={false} crumbs={[{ href: "/desk", label: "Desk" }, { label: "WhatsApp Channel" }]} kicker="Private · Distribution" title="The Morning for the WhatsApp Channel">
      <p className="max-w-2xl text-[15px] leading-7 text-ink-soft">
        Built from the same figures as <Link href="/morning" className="font-semibold text-forest underline underline-offset-2">the Morning</Link> for{" "}
        {morningLongDate.format(new Date(note.day))}, with the publishers named and the house line at the end. Post it after the Morning email has gone
        (07:30 Nairobi). Nothing here is sent automatically.
      </p>

      <Card tone="muted" className="mt-6 max-w-3xl">
        <p className="text-[14px] font-semibold text-ink">{channel ? "Channel link is set" : "No channel link yet"}</p>
        {channel ? (
          <p className="mt-1 break-all text-[13.5px] leading-6 text-ink-soft">
            “Join on WhatsApp” shows on Today, the Morning, Asubuhi and the Kiswahili page, pointing to{" "}
            <a href={channel} target="_blank" rel="noopener noreferrer" className="font-semibold text-forest underline underline-offset-2">
              {channel}
            </a>
            .
          </p>
        ) : (
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13.5px] leading-6 text-ink-soft">
            <li>In WhatsApp on the phone: Updates → Channels → + → Create channel. Name it, add the Afronomics mark (/icons/icon-512.png).</li>
            <li>Open the channel’s info, Share → Copy link. It starts https://whatsapp.com/channel/.</li>
            <li>In Vercel, add it as WHATSAPP_CHANNEL_URL (Production) and redeploy. The “Join on WhatsApp” slots appear; until then they stay hidden.</li>
          </ol>
        )}
      </Card>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {[
          { lang: "en", title: "English", text: en, api: "/api/edition/morning?format=channel" },
          { lang: "sw", title: "Kiswahili (Asubuhi)", text: sw, api: "/api/edition/morning?format=channel&lang=sw" },
        ].map((p) => (
          <section key={p.lang} className="min-w-0">
            <SectionTitle kicker="Post" title={p.title} note={`${p.text.length.toLocaleString("en-US")} characters. *Bold* and _italic_ show as formatting in WhatsApp.`} />
            <pre lang={p.lang} className="mt-3 max-h-[32rem] overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-rule bg-surface p-4 font-mono text-[12.5px] leading-6 text-ink">
              {p.text}
            </pre>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <CopyPost text={p.text} label={`Copy the ${p.lang === "sw" ? "Kiswahili" : "English"} post`} />
              <a href={p.api} className="inline-flex min-h-11 items-center text-[13px] font-semibold text-forest underline underline-offset-2">
                As plain text
              </a>
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
