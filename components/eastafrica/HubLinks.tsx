import Link from "next/link";

type L = { href: string; label: string; note: string };

const groups: { title: string; links: L[] }[] = [
  {
    title: "Kenya",
    links: [
      { href: "/markets/kenya-tbills", label: "Kenya T-bill auctions", note: "Every result since the first notice Afronomics read" },
      { href: "/markets/kenya-tbills/auction", label: "This week’s auction", note: "Likely rates, and did my bid win?" },
      { href: "/markets/bonds/kenya", label: "Kenya bonds", note: "Every bond auction, rate and bid cover" },
      { href: "/markets/kenya-bonds", label: "Kenya bond auctions and yield curve", note: "Results by date, curve from auctions" },
      { href: "/rates/kenya", label: "Kenya savings and loan rates", note: "Bills, bonds, funds and banks on one scale" },
      { href: "/countries/kenya", label: "Kenya economy", note: "Country profile and economic data" },
    ],
  },
  {
    title: "Uganda and Tanzania",
    links: [
      { href: "/markets/tbills/uganda", label: "Uganda T-bill auctions", note: "Bank of Uganda results" },
      { href: "/markets/bonds/uganda", label: "Uganda bonds", note: "Every bond auction, yield and bid cover" },
      { href: "/countries/uganda", label: "Uganda economy", note: "Country profile and economic data" },
      { href: "/markets/tbills/tanzania", label: "Tanzania T-bill auctions", note: "Bank of Tanzania results" },
      { href: "/countries/tanzania", label: "Tanzania economy", note: "Country profile and economic data" },
    ],
  },
  {
    title: "Across Africa",
    links: [
      { href: "/rates/policy", label: "Policy rates", note: "Every central bank, beside its one-year bill" },
      { href: "/markets/tbills", label: "T-bill monitor", note: "Ten markets, latest auctions" },
      { href: "/markets/borrowing-costs", label: "Borrowing costs", note: "Real yields, auction demand and the calendar" },
      { href: "/markets/eurobonds", label: "Eurobond yields", note: "Read from government bulletins" },
      { href: "/markets/bill-index", label: "Sovereign Bill Index", note: "One number for African bill rates" },
    ],
  },
];

export function HubLinks() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {groups.map((g) => (
        <nav key={g.title} aria-label={g.title} className="min-w-0">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">{g.title}</h3>
          <ul className="mt-2 divide-y divide-rule border-y border-rule">
            {g.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="group block py-2.5">
                  <span className="font-medium text-ink group-hover:text-forest">{l.label} →</span>
                  <span className="block text-[12px] text-muted">{l.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </div>
  );
}
