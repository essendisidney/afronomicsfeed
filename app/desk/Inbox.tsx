import { SectionTitle } from "@/components/data/parts";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { MarkHandled } from "./DeskActions";
import { CATEGORY_LABEL, type InboxCategory, type InboxItem } from "./today-core";

/**
 * Everything that came in, newest first: pilot requests, invoice requests, enquiries, survey notes and page feedback.
 * "Mark handled" needs migration 0040 (af_desk_handle); before it, the list is read-only. Lead emails are shown as
 * the desk always has; nothing here is logged.
 */

const TONE: Record<InboxCategory, BadgeTone> = { pilot: "accent", invoice: "warn", enquiry: "neutral", survey: "neutral", feedback: "neutral" };

function ago(iso: string, now: number) {
  const h = (now - Date.parse(iso)) / 3600000;
  return h < 1 ? `${Math.max(1, Math.round(h * 60))} min ago` : h < 48 ? `${Math.round(h)} h ago` : `${Math.round(h / 24)} d ago`;
}

function Item({ i, now, canHandle }: { i: InboxItem; now: number; canHandle: boolean }) {
  return (
    <li className={`py-3 sm:flex sm:items-start sm:gap-4 ${i.handled ? "opacity-60" : ""}`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Badge tone={TONE[i.category]}>{CATEGORY_LABEL[i.category]}</Badge>
          <span className="text-[12px] text-muted">{ago(i.at, now)}</span>
          {i.handled ? <span className="text-[12px] text-up">handled</span> : null}
        </div>
        <p className="mt-1 text-sm font-medium text-ink [overflow-wrap:anywhere]">{i.title}</p>
        {i.meta || i.email ? (
          <p className="text-[12px] text-muted [overflow-wrap:anywhere]">
            {i.meta}
            {i.email ? (
              <>
                {i.meta ? " · " : ""}
                <a href={`mailto:${i.email}`} className="underline">
                  {i.email}
                </a>
              </>
            ) : null}
          </p>
        ) : null}
        {i.text ? <p className="mt-1 line-clamp-4 whitespace-pre-line text-[13px] text-ink-soft [overflow-wrap:anywhere]">{i.text}</p> : null}
      </div>
      {canHandle && i.id != null ? (
        <div className="mt-2 shrink-0 sm:mt-0">
          <MarkHandled kind={i.kind} id={i.id} undo={i.handled} />
        </div>
      ) : null}
    </li>
  );
}

export function Inbox({ items, now, canHandle }: { items: InboxItem[]; now: number; canHandle: boolean }) {
  const waiting = items.filter((i) => !i.handled);
  const handled = items.filter((i) => i.handled);
  return (
    <section id="inbox" className="scroll-mt-20">
      <SectionTitle
        kicker="Inbox · last 30 days"
        title={waiting.length ? `${waiting.length} waiting` : "Nothing waiting"}
        note={
          canHandle
            ? "Newest first. Reply from Gmail, then mark handled. Handled items fold away below."
            : "Newest first. Read-only until migration 0040 is applied (then each item gets “mark handled”)."
        }
      />
      {waiting.length ? (
        <ul className="mt-2 divide-y divide-rule">
          {waiting.slice(0, 25).map((i, n) => (
            <Item key={`${i.kind}-${i.id ?? n}-${i.at}`} i={i} now={now} canHandle={canHandle} />
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">No leads, pilot or invoice requests, survey notes or feedback waiting.</p>
      )}
      {waiting.length > 25 ? <p className="mt-1 text-[12px] text-muted">{waiting.length - 25} older items not shown.</p> : null}
      {handled.length ? (
        <details className="mt-2">
          <summary className="cursor-pointer text-[13px] font-semibold text-muted">Handled ({handled.length})</summary>
          <ul className="mt-1 divide-y divide-rule">
            {handled.slice(0, 30).map((i, n) => (
              <Item key={`${i.kind}-${i.id ?? n}-h`} i={i} now={now} canHandle={canHandle} />
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
