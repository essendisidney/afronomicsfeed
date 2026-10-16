import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { PageShell } from "@/components/data/PageShell";
import { buttonClass } from "@/components/ui/Button";
import { FREE_MONTHS } from "@/lib/api";
import { billMarkets, loadBillMarket } from "@/lib/data/sovereign-bills";
import { bondMarkets, loadBondMarket } from "@/lib/data/sovereign-bonds";
import { fullHistoryHref, safeNext, SESSION_COOKIE, SESSION_HOURS } from "@/lib/downloads-core";
import { downloadsEnabled, verifySession } from "@/lib/downloads";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Full-history downloads",
  description: "Sign in with your Afronomics key to download full-history CSV files in your browser.",
  robots: { index: false, follow: false },
};

const messages: Record<string, { tone: "ok" | "warn"; text: string }> = {
  signed_in: { tone: "ok", text: `Signed in. Full-history CSV links now work in this browser for ${SESSION_HOURS} hours.` },
  signed_out: { tone: "ok", text: "Signed out. CSV links in this browser are back to the free latest 12 months." },
  invalid: { tone: "warn", text: "That key was not accepted: it is unknown, revoked or expired. Check it and try again, or ask the desk for a new one." },
  limited: { tone: "warn", text: "Too many attempts from here. Wait 15 minutes and try again." },
  unavailable: { tone: "warn", text: "Sign-in is not available right now. Try again shortly; developers can send the key as a header meanwhile." },
};

const time = (unix: number) =>
  new Date(unix * 1000).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";

/** The full-history CSV of every market that has data, for the signed-in list. */
function files() {
  const bonds = bondMarkets
    .map((m) => ({ m, rows: loadBondMarket(m.slug).rows }))
    .filter((x) => x.rows.length)
    .map(({ m, rows }) => ({ label: `${m.country} bonds`, href: `/api/data/bonds/${m.slug}`, count: rows.length }));
  const bills = billMarkets
    .map((m) => ({ m, rows: loadBillMarket(m.slug).rows }))
    .filter((x) => x.rows.length)
    .map(({ m, rows }) => ({ label: `${m.country} Treasury bills`, href: `/api/data/tbills/${m.slug}`, count: rows.length }));
  return [...bonds, ...bills];
}

/**
 * /downloads: where a key holder (pilot, Analyst, Team and API) signs in once so the site's CSV links give the full
 * history in a browser. The key is posted to /downloads/session and never appears in a URL; this page only reads the
 * signed session cookie to say whether it is active. Not indexed.
 */
export default async function DownloadsPage({ searchParams }: { searchParams: Promise<{ status?: string; next?: string }> }) {
  const query = await searchParams;
  const next = safeNext(query.next);
  const session = verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  const message = query.status ? messages[query.status] : undefined;
  const enabled = downloadsEnabled();
  const field = "mt-1 w-full border border-rule bg-paper px-3 py-3 font-mono text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-gold/40 sm:py-2.5";

  return (
    <PageShell
      share={false}
      crumbs={[{ href: "/", label: "Home" }, { href: "/data-api", label: "Data API" }, { label: "Full-history downloads" }]}
      kicker="Afronomics data · key holders"
      title="Full-history downloads"
      lede={
        <p>
          The site’s CSV links give everyone the latest {FREE_MONTHS} months. With a pilot, Analyst or Team and API key, sign in here once and the same links
          give the full history in this browser.
        </p>
      }
    >
      <div className="grid max-w-5xl gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          {message ? (
            <p role="status" className={`mb-6 border px-4 py-3 text-[14px] leading-6 ${message.tone === "ok" ? "border-forest/40 bg-paper-2 text-ink" : "border-gold/60 bg-paper-2 text-ink"}`}>
              {message.text}
            </p>
          ) : null}

          {session ? (
            <section>
              <h2 className="font-serif text-2xl text-ink">You are signed in</h2>
              <p className="mt-2 text-[15px] leading-7 text-ink-soft">
                Key <span className="font-mono text-ink">{session.prefix}…</span> ({session.plan.replace(/_/g, " ")}), until {time(session.expiresAt)}. Every download
                counts against this key, as API calls do.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {next ? (
                  <Link href={next} className={buttonClass()}>
                    Back to the page you were on
                  </Link>
                ) : null}
                <form method="post" action="/downloads/session">
                  <input type="hidden" name="action" value="signout" />
                  <button type="submit" className={buttonClass({ variant: "secondary" })}>
                    Sign out on this device
                  </button>
                </form>
              </div>

              <h3 className="mt-10 font-serif text-xl text-ink">Every full-history file</h3>
              <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-[14px] sm:grid-cols-2">
                {files().map((f) => (
                  <li key={f.href} className="flex items-baseline justify-between gap-3 border-b border-rule py-1.5">
                    <a href={fullHistoryHref(f.href)} download className="font-medium text-forest underline underline-offset-2">
                      {f.label}
                    </a>
                    <span className="shrink-0 text-[12px] text-muted">{f.count.toLocaleString("en-US")} rows</span>
                  </li>
                ))}
                <li className="flex items-baseline justify-between gap-3 border-b border-rule py-1.5">
                  <a href={fullHistoryHref("/api/data/kenya-bonds")} download className="font-medium text-forest underline underline-offset-2">
                    Kenya bonds, with CBK notice links
                  </a>
                </li>
                <li className="flex items-baseline justify-between gap-3 border-b border-rule py-1.5">
                  <a href={fullHistoryHref("/api/data/kenya-tbills")} download className="font-medium text-forest underline underline-offset-2">
                    Kenya Treasury bills, with CBK notice links
                  </a>
                </li>
              </ul>
            </section>
          ) : (
            <section>
              <h2 className="font-serif text-2xl text-ink">Sign in with your key</h2>
              {enabled ? (
                <form method="post" action="/downloads/session" className="mt-4 max-w-xl" autoComplete="off">
                  {next ? <input type="hidden" name="next" value={next} /> : null}
                  <label className="block">
                    <span className="block text-[13px] font-medium leading-5 text-muted">Your key (starts with afk_)</span>
                    <input
                      required
                      type="password"
                      name="key"
                      autoComplete="off"
                      spellCheck={false}
                      inputMode="text"
                      pattern="afk_[0-9a-f]{48}"
                      title="afk_ followed by 48 characters 0-9 and a-f"
                      maxLength={60}
                      className={field}
                      placeholder="afk_…"
                    />
                  </label>
                  <button type="submit" className={`${buttonClass()} mt-4`}>
                    Sign in for {SESSION_HOURS} hours
                  </button>
                </form>
              ) : (
                <p className="mt-3 text-[15px] leading-7 text-ink-soft">Browser sign-in is not set up yet. Send your key as a header (below), or ask the desk for the files.</p>
              )}
              <p className="mt-6 text-[14px] leading-6 text-ink-soft">
                No key yet? Start a{" "}
                <Link href="/data/frontier-local-debt#pilot" className="font-semibold text-forest underline underline-offset-2">
                  free 30-day pilot
                </Link>{" "}
                or see{" "}
                <Link href="/pricing" className="underline underline-offset-2">
                  Analyst and Team and API
                </Link>
                .
              </p>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-rule bg-surface px-5 py-5 text-[14px] leading-6 text-ink-soft">
          <p className="text-[15px] font-semibold text-ink">How this works</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Your key is checked once and is not kept in this browser. It never goes into a link, so it cannot leak through history or a shared URL.</li>
            <li>This browser gets a sign-in that lasts {SESSION_HOURS} hours and only works on {site.url.replace("https://", "")}.</li>
            <li>If the key is revoked or runs out, its downloads stop too.</li>
            <li>On a shared computer, sign out when you are done.</li>
            <li>
              In code, send the key as a header instead:{" "}
              <code className="font-mono text-[12px] break-all text-ink">Authorization: Bearer afk_…</code> (
              <Link href="/developers#terms" className="underline underline-offset-2">
                terms
              </Link>
              ).
            </li>
          </ul>
        </aside>
      </div>
    </PageShell>
  );
}
