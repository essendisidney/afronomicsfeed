import { SectionTitle } from "@/components/data/parts";
import { AddWebhook, CopyLink, CreateInvoice, StopWebhook, GrantEntitlement, LoadTargets, MarkInvoicePaid, MarkPack, RenameOrg, ReviewBenchmark, SetKraPin, STAGES, UpdateTarget } from "./TreasuryActions";

export type Treasury = {
  period: string;
  targets: {
    id: number;
    organisation: string;
    segment: string;
    product: string;
    stage: string;
    objection: string | null;
    price_quoted_kes: number | null;
    board_date: string | null;
    decision_maker: boolean | null;
    sample_sent_on: string | null;
    next_step: string | null;
    next_date: string | null;
    updated_at: string;
  }[];
  stages: Record<string, number>;
  decision_makers: number;
  samples_sent: number;
  paying: number;
  desk_tier: number;
  mrr_kes: number;
  orgs: { org_id: number; name: string; kind: string; product: string; amount_kes_month: number; ends_at: string; source: string }[];
  packs_due: { org_id: number; name: string; product: string; checked_by: string | null; checked_at: string | null; sent_at: string | null }[];
};

export type DeskInvoice = { id: number; number: string; org_id: number; name: string; kra_pin: string | null; amount: number; currency: string; issued_on: string; paid_on: string | null; method: string | null };
export type DeskBenchmark = { id: number; org_id: number; name: string; quarter: string; holdings: number; uploaded_at: string; reviewed_by: string | null; reviewed_at: string | null; released_at: string | null };
export type DeskWebhook = { id: number; key_id: number; key_label: string; url: string; markets: string[] | null; active: boolean; delivered: number; failed: number; secret: string | null };
export type OrgLinks = Record<number, { pack: string | null; benchmark: string | null }>;

/** The 90-day test's goals (founder-strategy-pack.md section K; D-035). */
const GOALS = [
  { key: "conversations", label: "Qualified conversations", d45: 20, d90: 40 },
  { key: "samples", label: "Named samples sent", d45: 10, d90: 25 },
  { key: "paying", label: "Paying institutions", d45: 2, d90: 10 },
  { key: "mrr", label: "Booked a month (KES)", d45: 30_000, d90: 300_000 },
  { key: "desk", label: "On the Treasury Desk tier", d45: 0, d90: 2 },
] as const;

const kes = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
const stageLabel = (id: string) => STAGES.find((s) => s.id === id)?.label ?? id;

export function TreasuryPanel({ data, applyNote, links = {}, invoices = null, benchmarks = null, webhooks = null }: { data: Treasury | null; applyNote: string | null; links?: OrgLinks; invoices?: DeskInvoice[] | null; benchmarks?: DeskBenchmark[] | null; webhooks?: DeskWebhook[] | null }) {
  if (!data) {
    return (
      <section>
        <SectionTitle kicker="D-035 · D-036" title="Treasury Desk" />
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">{applyNote ?? "The Treasury Desk could not be read just now."}</p>
      </section>
    );
  }
  const past = (stage: string) => STAGES.findIndex((s) => s.id === stage);
  const reached = (from: string) => data.targets.filter((t) => t.stage !== "lost" && past(t.stage) >= past(from)).length;
  const now: Record<(typeof GOALS)[number]["key"], number> = {
    conversations: reached("qualified"),
    samples: data.samples_sent,
    paying: data.paying,
    mrr: data.mrr_kes,
    desk: data.desk_tier,
  };
  return (
    <div className="space-y-12">
      <section>
        <SectionTitle kicker="The 90-day test · D-035" title="Against the goals" note="Kill line: fewer than 3 paying after 40 qualified conversations." />
        <div className="mt-3 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Measure</th>
                <th className="text-right">Now</th>
                <th className="text-right">Day 45</th>
                <th className="text-right">Day 90</th>
              </tr>
            </thead>
            <tbody>
              {GOALS.map((g) => (
                <tr key={g.key}>
                  <td className="text-sm">{g.label}</td>
                  <td className="text-right text-sm font-semibold">{kes(now[g.key])}</td>
                  <td className="text-right text-sm">{kes(g.d45)}</td>
                  <td className="text-right text-sm">{kes(g.d90)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">Decision-makers reached: {data.decision_makers}. Booked a month counts live entitlements only.</p>
      </section>

      <section>
        <SectionTitle kicker={`${data.targets.length} names · D-036`} title="Targets" note="Outreach only to these names, by the founder’s own channels. Email stays on hold." />
        <ul className="mt-3 flex flex-wrap gap-2 text-[13px]">
          {STAGES.map((s) => (
            <li key={s.id} className="rounded-full border border-rule px-3 py-1">
              {s.label} <strong>{data.stages[s.id] ?? 0}</strong>
            </li>
          ))}
        </ul>
        {data.targets.length === 0 ? (
          <div className="mt-4 max-w-xl">
            <LoadTargets />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-rule border-y border-rule">
            {data.targets.map((t) => (
              <li key={t.id} className="py-3">
                <details>
                  <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-ink">{t.organisation}</span>
                    <span className="text-[12px] text-muted">
                      {stageLabel(t.stage)} · {t.product.replace("_", " ")}
                      {t.board_date ? ` · board ${t.board_date}` : ""}
                      {t.next_date ? ` · next ${t.next_date}` : ""}
                    </span>
                  </summary>
                  <div className="mt-3 space-y-2 text-[13px] text-ink-soft">
                    {t.next_step ? <p>Next: {t.next_step}</p> : null}
                    {t.objection ? <p>Objection: “{t.objection}”</p> : null}
                    {t.price_quoted_kes ? <p>Quoted KES {kes(t.price_quoted_kes)} a month</p> : null}
                    <p>
                      <a href={`/pack/sample?for=${encodeURIComponent(t.organisation)}`} target="_blank" rel="noopener" className="font-semibold text-forest underline underline-offset-2">
                        Named sample pack
                      </a>{" "}
                      (print to PDF from the browser)
                    </p>
                    <UpdateTarget id={t.id} stage={t.stage} />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle kicker={`Pack for ${data.period}`} title="Packs due this month" note="Open, check every figure against its source, print to PDF, send from your own mailbox, then mark it." />
        {data.packs_due.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">No paying organisation yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-rule border-y border-rule">
            {data.packs_due.map((p) => (
              <li key={p.org_id} className="flex flex-wrap items-end justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{p.name}</p>
                  <p className="text-[12px] text-muted">
                    {p.product.replace("_", " ")} ·{" "}
                    {p.sent_at ? `sent ${p.sent_at.slice(0, 10)}` : p.checked_at ? `checked by ${p.checked_by} ${p.checked_at.slice(0, 10)}, not sent` : "not checked"}
                  </p>
                  <a href={`/desk/pack?org=${p.org_id}`} target="_blank" rel="noopener" className="text-[13px] font-semibold text-forest underline underline-offset-2">
                    Open this month’s pack
                  </a>
                </div>
                {p.sent_at ? null : <MarkPack org={p.org_id} period={data.period} />}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle kicker={`${data.paying} paying · KES ${kes(data.mrr_kes)} a month`} title="Paying organisations" />
        {data.orgs.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">None yet. A pack or benchmarking payment opens one automatically; invoices and paid pilots are opened below.</p>
        ) : (
          <ul className="mt-3 divide-y divide-rule border-y border-rule">
            {data.orgs.map((o) => (
              <li key={`${o.org_id}-${o.product}-${o.ends_at}`} className="flex flex-wrap items-end justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{o.name}</p>
                  <p className="text-[12px] text-muted">
                    {o.product.replace("_", " ")} · KES {kes(o.amount_kes_month)} a month · {o.source} · to {o.ends_at.slice(0, 10)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {links[o.org_id]?.pack ? <CopyLink href={links[o.org_id].pack!} label="Copy private pack link" /> : null}
                  {links[o.org_id]?.benchmark && ["benchmarking", "treasury_desk"].includes(o.product) ? <CopyLink href={links[o.org_id].benchmark!} label="Copy benchmarking link" /> : null}
                </div>
                {/^(Unnamed payer|[a-z0-9.-]+\.[a-z]{2,}$)/.test(o.name) ? <RenameOrg org={o.org_id} name={o.name} /> : null}
                <details className="w-full">
                  <summary className="cursor-pointer text-[13px] text-ink-soft">Invoice or KRA PIN</summary>
                  <div className="mt-2 space-y-3">
                    <CreateInvoice org={o.org_id} />
                    <SetKraPin org={o.org_id} />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[12px] text-muted">Private links expire (packs 45 days, benchmarking 120 days) and close at once if the subscription lapses. Share them yourself; nothing is emailed.</p>
        <details className="mt-6 max-w-2xl">
          <summary className="cursor-pointer text-sm font-semibold text-ink">Open an entitlement for an invoice or a paid pilot</summary>
          <div className="mt-3">
            <GrantEntitlement />
          </div>
        </details>
      </section>
      <section>
        <SectionTitle kicker="Quarterly benchmarks" title="Uploads to check" note="Open the draft, check it against the client's figures, then release it to their private page." />
        {benchmarks == null ? (
          <p className="mt-3 text-sm text-ink-soft">Waiting for migration 0049.</p>
        ) : benchmarks.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">No uploads yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-rule border-y border-rule">
            {benchmarks.map((u) => (
              <li key={u.id} className="flex flex-wrap items-end justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {u.name} · {u.quarter.replace("-", " ")}
                  </p>
                  <p className="text-[12px] text-muted">
                    {u.holdings} holdings · uploaded {u.uploaded_at.slice(0, 10)} ·{" "}
                    {u.released_at ? `released ${u.released_at.slice(0, 10)}` : u.reviewed_by ? `checked by ${u.reviewed_by}, not released` : "not checked"}
                  </p>
                  <a href={`/desk/benchmark?id=${u.id}`} target="_blank" rel="noopener" className="text-[13px] font-semibold text-forest underline underline-offset-2">
                    Open the {u.released_at ? "page" : "draft"}
                  </a>
                </div>
                {u.released_at ? null : <ReviewBenchmark id={u.id} />}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle kicker="Invoices" title="Issued and paid" note="Print to PDF and hand over or send yourself." />
        {invoices == null ? (
          <p className="mt-3 text-sm text-ink-soft">Waiting for migration 0049.</p>
        ) : invoices.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">None yet. Create one from a paying organisation above.</p>
        ) : (
          <ul className="mt-3 divide-y divide-rule border-y border-rule">
            {invoices.map((i) => (
              <li key={i.id} className="flex flex-wrap items-end justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {i.number} · {i.name}
                  </p>
                  <p className="text-[12px] text-muted">
                    {i.currency} {kes(Number(i.amount))} · issued {i.issued_on} · {i.paid_on ? `paid ${i.paid_on} by ${i.method}` : "unpaid"}
                  </p>
                  <a href={`/desk/invoice?id=${i.id}`} target="_blank" rel="noopener" className="text-[13px] font-semibold text-forest underline underline-offset-2">
                    Open to print
                  </a>
                </div>
                {i.paid_on ? null : <MarkInvoicePaid id={i.id} />}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <SectionTitle kicker="Data licence" title="auction.published webhooks" note="Signed POSTs after each auction lands. Give the customer the signing secret yourself; see /developers#webhooks." />
        {webhooks == null ? (
          <p className="mt-3 text-sm text-ink-soft">Waiting for migration 0050.</p>
        ) : (
          <>
            {webhooks.length ? (
              <ul className="mt-3 divide-y divide-rule border-y border-rule">
                {webhooks.map((w) => (
                  <li key={w.id} className="flex flex-wrap items-end justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        {w.key_label} · <span className="break-all font-normal">{w.url}</span>
                      </p>
                      <p className="text-[12px] text-muted">
                        {w.markets?.length ? w.markets.join(", ") : "all markets"} · {w.delivered} delivered · {w.failed} failed · {w.active ? "on" : "off"}
                      </p>
                      {w.secret && w.active ? <p className="mt-1 break-all font-mono text-[11px] text-ink-soft">Signing secret: {w.secret}</p> : null}
                    </div>
                    {w.active ? <StopWebhook id={w.id} /> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-soft">None yet.</p>
            )}
            <details className="mt-4 max-w-2xl">
              <summary className="cursor-pointer text-sm font-semibold text-ink">Add a webhook for an API key</summary>
              <div className="mt-3">
                <AddWebhook />
              </div>
            </details>
          </>
        )}
      </section>
    </div>
  );
}
