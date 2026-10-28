import { SectionTitle } from "@/components/data/parts";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

/**
 * The People tab: one row per person who gave us an email, across every way to sign up (newsletter, rate alerts,
 * bond alerts, Call it, pilot requests, API keys, payments). From af_desk_people_list (migration 0047). Emails are
 * shown as the desk always has; nothing here is logged or sent anywhere.
 */

export type Person = {
  email: string;
  domain: string;
  personal: boolean;
  organisation: string | null;
  first_seen: string;
  last_seen: string;
  first_way: string;
  first_source: string | null;
  ways: string[];
  active: boolean;
  paid: boolean;
  has_key: boolean;
};

export type PeopleList = { total: number; new_7d: number; by_way: Record<string, number>; people: Person[] };

const WAY_TONE: Record<string, BadgeTone> = { payment: "up", "API key": "accent", "pilot request": "warn" };
const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "2-digit", timeZone: "Africa/Nairobi" });

/** "/markets/tbills/ghana" stays a path; "pilot:/data/frontier-local-debt" reads "pilot form on /data/…". */
function sourceText(s: string | null) {
  if (!s) return null;
  const m = s.match(/^pilot:(.*)$/);
  return m ? `pilot form on ${m[1]}` : s;
}

function status(p: Person): { label: string; tone: BadgeTone } {
  if (p.paid) return { label: "paying", tone: "up" };
  if (p.has_key) return { label: "has a key", tone: "accent" };
  if (!p.active) return { label: "unsubscribed", tone: "neutral" };
  return { label: "reader", tone: "neutral" };
}

export function PeoplePanel({ list, applyNote }: { list: PeopleList | null; applyNote: string | null }) {
  if (!list) {
    return (
      <section aria-labelledby="people-h">
        <SectionTitle kicker="People" title="Who gave us an email" />
        <p id="people-h" className="mt-2 max-w-xl text-sm text-muted">
          {applyNote ?? "Not available."}
        </p>
      </section>
    );
  }
  const org = list.people.filter((p) => !p.personal).length;
  return (
    <section aria-labelledby="people-h">
      <SectionTitle
        kicker="People"
        title="Who gave us an email"
        note="Every way to sign up, one row per person. Paying first, then key holders, then newest. Organisation is what they typed or paid as; otherwise the email domain."
      />
      <h2 id="people-h" className="sr-only">
        People
      </h2>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full border border-rule bg-surface px-3 py-1">
          <strong>{list.total}</strong> people
        </span>
        <span className="rounded-full border border-rule bg-surface px-3 py-1">
          <strong>{list.new_7d}</strong> new in 7 days
        </span>
        <span className="rounded-full border border-rule bg-surface px-3 py-1">
          <strong>{org}</strong> on a work domain
        </span>
        {Object.entries(list.by_way)
          .sort((a, b) => b[1] - a[1])
          .map(([way, n]) => (
            <span key={way} className="rounded-full border border-rule px-3 py-1 text-ink-soft">
              {way} {n}
            </span>
          ))}
      </div>

      {list.people.length ? (
        <ul className="mt-4 divide-y divide-rule rounded-xl border border-rule bg-surface">
          {list.people.map((p) => {
            const s = status(p);
            const src = sourceText(p.first_source);
            return (
              <li key={p.email} className="px-4 py-3 sm:grid sm:grid-cols-12 sm:items-baseline sm:gap-4">
                <div className="min-w-0 sm:col-span-5">
                  <p className="text-sm font-medium text-ink [overflow-wrap:anywhere]">
                    {p.organisation ?? (p.personal ? "Personal email" : p.domain)}
                  </p>
                  <p className="text-[12px] text-muted [overflow-wrap:anywhere]">
                    <a href={`mailto:${p.email}`} className="underline">
                      {p.email}
                    </a>
                  </p>
                </div>
                <div className="mt-1 min-w-0 text-[12px] text-ink-soft sm:col-span-4 sm:mt-0 [overflow-wrap:anywhere]">
                  First: {p.first_way}
                  {src ? <span className="text-muted"> · {src}</span> : null}
                  <span className="block text-muted">
                    since {dayFmt.format(new Date(p.first_seen))}
                    {p.last_seen !== p.first_seen ? ` · last ${dayFmt.format(new Date(p.last_seen))}` : ""}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1 sm:col-span-3 sm:mt-0 sm:justify-end">
                  <Badge tone={s.tone}>{s.label}</Badge>
                  {p.ways
                    .filter((w) => w !== "payment" && w !== "API key")
                    .map((w) => (
                      <Badge key={w} tone={WAY_TONE[w] ?? "neutral"}>
                        {w}
                      </Badge>
                    ))}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">Nobody yet.</p>
      )}
      <p className="mt-2 text-[12px] leading-5 text-muted">
        Not captured yet: the country and the campaign (for example a LinkedIn post) behind each sign-up. Only the page they signed up on is stored.
      </p>
    </section>
  );
}
