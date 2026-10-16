import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/data/PageShell";
import { institutions, kindLabels } from "@/lib/registry";
import { rpc } from "@/lib/store";
import { LINK_DAYS, watchLinksEnabled, watchUrl } from "@/lib/watch-link";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Watch packs", robots: { index: false, follow: false } };

/**
 * The desk's Watch pack page (docs/rebuild/phase-5-plan.md): pick a SACCO, get its private link to send to the named
 * contacts, and preview the pack. Behind the desk key; anyone else gets a 404.
 */
export default async function DeskWatchPage({ searchParams }: { searchParams: Promise<{ slug?: string }> }) {
  const key = (await cookies()).get("af_desk")?.value ?? "";
  const check = key ? await rpc("af_desk", { p_secret: key }) : null;
  if (!check?.ok || check.value == null) notFound();
  const { slug } = await searchParams;
  const saccos = institutions().filter((i) => i.kind.startsWith("sacco") && i.status !== "revoked" && i.status !== "expired");
  const chosen = saccos.find((s) => s.slug === slug) ?? null;
  const link = chosen ? watchUrl(chosen.slug) : null;

  return (
    <PageShell share={false} crumbs={[{ href: "/desk", label: "Desk" }, { label: "Watch packs" }]} kicker="Private" title="Watch packs">
      <p className="max-w-2xl text-[15px] leading-7 text-ink-soft">
        A private pack about one SACCO for its board. Included in Pack with alerts for SACCO subscribers. Choose the SACCO, copy its link and send it to the
        named contacts; the link works for {LINK_DAYS} days and can be withdrawn in <code>data/watch/revoked.json</code>.{" "}
        <a href="/watch/sample" target="_blank" rel="noopener" className="font-semibold text-forest underline underline-offset-2">
          Public sample
        </a>
      </p>
      {!watchLinksEnabled() ? <p className="mt-4 text-[14px] text-down">Links are off: no signing secret is set on this deployment.</p> : null}
      <form action="/desk/watch" className="mt-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-[14px]">
          <span className="text-[12px] font-semibold text-muted">SACCO</span>
          <select name="slug" defaultValue={chosen?.slug ?? ""} className="min-h-11 max-w-[80vw] rounded-lg border border-rule bg-surface px-3 text-ink">
            <option value="">Choose a SACCO…</option>
            {saccos.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name} ({kindLabels[s.kind]}{s.tier ? `, ${s.tier}` : ""})
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="min-h-11 rounded-lg border border-forest px-4 font-semibold text-forest hover:bg-forest hover:text-paper">
          Make link
        </button>
      </form>
      {chosen && link ? (
        <section className="mt-8 rounded-2xl border border-rule bg-surface px-5 py-5">
          <h2 className="font-serif text-xl text-ink">{chosen.name}</h2>
          <p className="mt-2 break-all font-mono text-[13px] text-ink">{link}</p>
          <p className="mt-2 text-[13px] text-muted">Send only to the SACCO&rsquo;s named contacts. The pack&rsquo;s soundness page sets its ratios beside SASRA&rsquo;s minimums.</p>
          <a href={link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center font-semibold text-forest underline underline-offset-4">
            Preview the pack
          </a>
        </section>
      ) : null}
    </PageShell>
  );
}
