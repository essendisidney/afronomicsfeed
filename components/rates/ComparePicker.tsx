import Link from "next/link";
import { AutoSubmitSelect } from "@/components/rates/AutoSubmitSelect";
import { allSeries } from "@/lib/data/rate-series";
import { compareHref, defaultPairs, type CompareRange, type RateSeries } from "@/lib/rate-series-core";

const field = "mt-1 w-full rounded-xl border border-rule bg-paper px-3 py-2.5 text-[15px] text-ink outline-none focus:ring-2 focus:ring-gold/40";

function Options({ exclude }: { exclude?: string }) {
  const groups = new Map<string, RateSeries[]>();
  for (const s of allSeries()) if (s.id !== exclude) groups.set(s.group, [...(groups.get(s.group) ?? []), s]);
  return (
    <>
      {[...groups.entries()].map(([group, list]) => (
        <optgroup key={group} label={group}>
          {list.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}

/**
 * "Compare with…": picks the second series and goes to /rates/compare?a=…&b=…, a plain GET form (works without
 * script; with it, choosing submits at once). `editA` adds a picker for the first series too (the compare page).
 */
export function ComparePicker({ a, b, range, editA = false }: { a: RateSeries; b?: RateSeries | null; range?: CompareRange; editA?: boolean }) {
  const suggestions = defaultPairs
    .filter(([x, y]) => x === a.id || y === a.id)
    .map(([x, y]) => (x === a.id ? y : x))
    .concat(defaultPairs.map(([x, y]) => (x === "kenya-91d" ? y : x === a.id ? y : "")).filter(Boolean))
    .filter((id, i, list) => id !== a.id && id !== b?.id && list.indexOf(id) === i);
  const byId = new Map(allSeries().map((s) => [s.id, s]));
  return (
    <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
      <form action="/rates/compare" method="get" className={`grid gap-3 ${editA ? "sm:grid-cols-[1fr_1fr_auto]" : "sm:grid-cols-[1fr_auto]"} sm:items-end`}>
        {editA ? (
          <label className="block">
            <span className="text-[13px] font-medium text-muted">Series</span>
            <AutoSubmitSelect name="a" defaultValue={a.id} label="First series" className={field}>
              <Options />
            </AutoSubmitSelect>
          </label>
        ) : (
          <input type="hidden" name="a" value={a.id} />
        )}
        <label className="block">
          <span className="text-[13px] font-medium text-muted">Compare with…</span>
          <AutoSubmitSelect name="b" defaultValue={b?.id ?? ""} label={`Compare ${a.label} with`} className={field}>
            {b ? null : <option value="">Choose a series</option>}
            <Options exclude={a.id} />
          </AutoSubmitSelect>
        </label>
        {range && range !== "1y" ? <input type="hidden" name="range" value={range} /> : null}
        <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-[14px] font-semibold text-paper hover:bg-forest">
          Compare
        </button>
      </form>
      {suggestions.length ? (
        <div className="mt-4">
          <p className="text-[13px] font-medium text-muted">One tap</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {suggestions.slice(0, 4).map((id) => {
              const s = byId.get(id);
              if (!s) return null;
              return (
                <li key={id}>
                  <Link
                    href={compareHref(a.id, id, range)}
                    className="inline-flex min-h-11 items-center rounded-full border border-rule px-3 text-[13px] font-medium text-ink-soft hover:border-forest hover:text-ink"
                  >
                    {a.short} vs {s.short}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
