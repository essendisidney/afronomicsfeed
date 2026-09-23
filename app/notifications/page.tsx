import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { enabledPrefs, notificationChannels, notificationPrefs } from "@/lib/demo/notifications";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Notification channels and prefs for Afronomics. Delivery is offline.",
};

export default function NotificationsPage() {
  const enabled = enabledPrefs();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Notifications" }]}
      kicker="Notifications"
      title="Channels that do not ring yet"
      lede="Prefs describe what would fire after a cited print or pack lands. Every channel is offline until Auth and delivery exist."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Enabled prefs</p>
          <p className="mt-1 font-serif text-xl">{enabled.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Delivery</p>
          <p className="mt-1 font-serif text-xl">Offline</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/alerts" className="text-forest underline underline-offset-2">
          Alerts
        </Link>
        {" · "}
        <Link href="/packs" className="text-forest underline underline-offset-2">
          Packs
        </Link>
        {" · "}
        <Link href="/account" className="text-forest underline underline-offset-2">
          Account
        </Link>
        {" · "}
        <Link href="/searches" className="text-forest underline underline-offset-2">
          Searches
        </Link>
      </p>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Channels</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {notificationChannels.map((channel) => (
            <li key={channel.id} className="border border-rule px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{channel.status}</p>
              <p className="mt-1 font-serif text-xl">{channel.label}</p>
              <p className="mt-2 text-sm text-ink-soft">{channel.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Prefs</h2>
        <ul className="mt-4 space-y-3">
          {notificationPrefs.map((pref) => (
            <li key={pref.slug} className="border-b border-rule pb-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                {pref.channelIds.join(" · ")}
              </p>
              <p className="mt-1 font-serif text-xl">{pref.label}</p>
              <p className="mt-1 text-sm text-ink-soft">{pref.lede}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                Enable — auth required
              </p>
            </li>
          ))}
        </ul>
      </section>

      <Provenance source="No notification store" methodology="Offline channels. No fake push history." />
    </LayerPage>
  );
}
