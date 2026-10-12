import { partnerFor } from "@/lib/data/transfer-partners";
import { countryName, type Corridor } from "@/lib/data/remittances";

const usd = (pct: number) => `$${((200 * pct) / 100).toFixed(2)}`;
const typeName: Record<string, string> = {
  Bank: "Bank",
  "Money Transfer Operator": "Transfer company",
  "Mobile Operator": "Mobile money",
  "Post Office": "Post office",
};

/** One corridor's services, cheapest first, each with a "Send money" button where the provider has an online service. */
export function SendMoneyTable({ c }: { c: Corridor }) {
  const firms = c.firms?.length ? c.firms : [c.cheapest];
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Service</th>
            <th className="text-right">Cost of sending $200</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {firms.map((f, i) => {
            const p = partnerFor(f.firm);
            return (
              <tr key={`${f.firm}-${i}`}>
                <td className="text-xs text-muted">{i + 1}</td>
                <td>
                  <span className="font-medium text-ink">{f.firm}</span>
                  <span className="block text-[11px] text-muted">
                    {typeName[f.type] ?? f.type}
                    {i === 0 ? " · cheapest surveyed" : ""}
                  </span>
                </td>
                <td className="text-right">
                  <span className="font-semibold">{usd(f.cost_pct)}</span>
                  <span className="block text-[11px] text-muted">{f.cost_pct.toFixed(2)}% of the amount</span>
                </td>
                <td className="text-right">
                  {p ? (
                    <a
                      href={`/go/${p.slug}?from=${c.src}&to=${c.dst}`}
                      rel="sponsored nofollow noopener"
                      target="_blank"
                      className="inline-block whitespace-nowrap rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-semibold text-paper hover:bg-forest"
                    >
                      Send with {p.name}
                    </a>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-[12px] text-muted">
        {c.services} services surveyed from {countryName(c.src_name)}. Average {c.avg_cost_pct.toFixed(2)}% ({usd(c.avg_cost_pct)} on $200).
      </p>
    </div>
  );
}
