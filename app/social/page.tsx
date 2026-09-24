import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { linkedInShareUrl, postedSocialItems, socialChannels } from "@/lib/demo/social";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Social",
  description: "LinkedIn and share doors for Afronomics. No invented engagement metrics.",
};

const shareTargets = [
  { label: "Homepage", path: "/" },
  { label: "Morning file", path: "/today" },
  { label: "Method", path: "/method" },
  { label: "Go live", path: "/golive" },
] as const;

export default function SocialPage() {
  const channels = socialChannels();
  const posted = postedSocialItems();
  const company = channels.find((c) => c.id === "linkedin-company");

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Social" }]}
      kicker="Social"
      title="LinkedIn without fake reach"
      lede="Interconnect the company page and share intents. Posted history stays empty until a real post is logged — this desk does not invent impressions."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Channels</p>
          <p className="mt-1 font-serif text-xl">{channels.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Posted log</p>
          <p className="mt-1 font-serif text-xl">{posted.length}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/press" className="text-forest underline underline-offset-2">
          Press
        </Link>
        {" · "}
        <Link href="/golive" className="text-forest underline underline-offset-2">
          Go live
        </Link>
        {" · "}
        <Link href="/about" className="text-forest underline underline-offset-2">
          About
        </Link>
        {" · "}
        <Link href="/partners" className="text-forest underline underline-offset-2">
          Partners
        </Link>
        {" · "}
        <Link href="/embeds" className="text-forest underline underline-offset-2">
          Embeds
        </Link>
        {" · "}
        <Link href="/runbooks" className="text-forest underline underline-offset-2">
          Runbooks
        </Link>
      </p>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Channels</h2>
        <ul className="mt-4 space-y-3">
          {channels.map((channel) => (
            <li key={channel.id} className="border-b border-rule pb-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{channel.status}</p>
              {channel.href ? (
                <a
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block font-serif text-xl hover:text-forest"
                >
                  {channel.label}
                </a>
              ) : (
                <p className="mt-1 font-serif text-xl">{channel.label}</p>
              )}
              <p className="mt-1 text-sm text-ink-soft">{channel.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Share to LinkedIn</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Opens LinkedIn’s share dialog with the page URL.{" "}
          {company?.href ? "Tag the company page manually when posting." : "Add the company URL in lib/site.ts first."}
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {shareTargets.map((target) => {
            const pageUrl = `${site.url}${target.path === "/" ? "" : target.path}`;
            return (
              <li key={target.path} className="border border-rule px-4 py-3">
                <p className="font-serif text-xl">{target.label}</p>
                <p className="mt-1 font-mono text-[10px] text-muted">{pageUrl}</p>
                <a
                  href={linkedInShareUrl(pageUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-forest underline underline-offset-2"
                >
                  Share on LinkedIn
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <Provenance source="No social scheduler" methodology="No invented followers, likes or post history." />
    </LayerPage>
  );
}
