import { SectionTitle } from "@/components/data/parts";
import { checkoutPlans, moneyLabel } from "@/lib/billing/plans";

/** The desk's money panel and funnels (af_desk_money, migration 0023). Real payments only; tests counted apart. */
export type Money = {
  revenue: { currency: string | null; payments: number; all_time: number; this_month: number; last_month: number }[];
  by_product: { plan: string; currency: string | null; payments: number; amount: number }[];
  tests: { payments: number; statuses: string[] };
  mrr: { currency: string | null; amount: number; subscriptions: number }[];
  windows: {
    days: number;
    people: number;
    newsletter_signups: number;
    new_subscribers: number;
    welcomed: number;
    unsubscribed: number;
    active_subscribers: number;
    alert_signups: number;
    alerts_created: number;
    alerts_confirmed: number;
    buying_page_people: number;
    buying_page_views: number;
    checkouts: number;
    enquiries: number;
    leads: number;
    payments: number;
    paid: { currency: string | null; amount: number }[];
  }[];
};

const sum = (rows: { currency: string | null; amount: number }[]) => (rows.length ? rows.map((r) => moneyLabel(r.amount, r.currency)).join(" + ") : "KES 0");
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "—");
const planName = (id: string) => (id in checkoutPlans ? checkoutPlans[id as keyof typeof checkoutPlans].label : id);

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="bg-surface px-4 py-4">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="mt-1 font-serif text-3xl text-ink">{value}</p>
      {note ? <p className="mt-0.5 text-[12px] text-muted">{note}</p> : null}
    </div>
  );
}

function Funnel({ title, steps }: { title: string; steps: { label: string; a: number; b: number }[] }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-ink">{title}</p>
      <table className="data-table mt-2">
        <thead>
          <tr>
            <th>Step</th>
            <th className="text-right">7 days</th>
            <th className="text-right">30 days</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((s, i) => (
            <tr key={s.label}>
              <td>{s.label}</td>
              <td className="text-right">
                {s.a}
                {i ? <span className="block text-[11px] text-muted">{pct(s.a, steps[0].a)} of first step</span> : null}
              </td>
              <td className="text-right">
                {s.b}
                {i ? <span className="block text-[11px] text-muted">{pct(s.b, steps[0].b)} of first step</span> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MoneyPanel({ money }: { money: Money | null }) {
  if (!money) return null;
  const [w7, w30] = [money.windows.find((w) => w.days === 7)!, money.windows.find((w) => w.days === 30)!];
  const month = money.revenue.map((r) => ({ currency: r.currency, amount: r.this_month }));
  const last = money.revenue.map((r) => ({ currency: r.currency, amount: r.last_month }));
  const all = money.revenue.map((r) => ({ currency: r.currency, amount: r.all_time }));
  const paidCount = money.revenue.reduce((n, r) => n + r.payments, 0);
  const subs = money.mrr.reduce((n, r) => n + r.subscriptions, 0);
  const step = (label: string, k: keyof Money["windows"][number]) => ({ label, a: Number(w7[k]), b: Number(w30[k]) });
  return (
    <section className="mt-10">
      <SectionTitle kicker="Money" title="How much Afronomics is making" note="Real payments only (Paystack status ‘success’). Test payments are counted apart and never added in." />
      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-rule bg-rule lg:grid-cols-4">
        <Tile label="This month" value={sum(month)} note={`last month ${sum(last)}`} />
        <Tile label="All time" value={sum(all)} note={`${paidCount} real payment${paidCount === 1 ? "" : "s"}`} />
        <Tile label="Monthly recurring" value={sum(money.mrr)} note={`${subs} active subscription${subs === 1 ? "" : "s"}`} />
        <Tile label="Test payments" value={String(money.tests.payments)} note="not revenue" />
      </div>
      {money.by_product.length ? (
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {money.by_product.map((p) => (
            <li key={`${p.plan}-${p.currency}`} className="rounded-full border border-rule bg-surface px-3 py-1">
              {planName(p.plan)}: <strong>{moneyLabel(p.amount, p.currency)}</strong> · {p.payments}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">No product has sold yet.</p>
      )}
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <Funnel
          title="Readers: visit → sign up"
          steps={[
            step("People on the site", "people"),
            step("Newsletter sign-ups", "newsletter_signups"),
            step("New subscribers", "new_subscribers"),
            step("Guide emailed", "welcomed"),
            step("Alert sign-ups", "alert_signups"),
            step("Alerts confirmed", "alerts_confirmed"),
          ]}
        />
        <Funnel
          title="Buyers: buying pages → paid"
          steps={[
            step("People on buying pages", "buying_page_people"),
            step("Checkouts started", "checkouts"),
            step("Enquiries sent", "enquiries"),
            step("Payments", "payments"),
          ]}
        />
      </div>
      <p className="mt-3 text-[12px] text-muted">
        {w30.active_subscribers} active newsletter subscribers · {w30.unsubscribed} unsubscribed in 30 days · paid in 30 days: {sum(w30.paid)}. Buying pages: pricing,
        for institutions, pack, licensing, advertise, advisory, prices, developers, job posting.
      </p>
    </section>
  );
}
