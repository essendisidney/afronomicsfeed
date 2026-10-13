/**
 * Tables that read on a phone.
 *
 * TableScroll wraps any wide <table>: it is a labelled, keyboard-focusable scroll region (so a keyboard user can
 * scroll it, WCAG 2.1.1), shows a soft edge while more columns sit off-screen, and below the sm breakpoint keeps
 * the first column pinned while the figures scroll (see .table-scroll in app/globals.css).
 *
 * DataTable renders rows from a column list. With mobile="cards", phones get one card per row (the first column
 * as the card title, every other column as a label and value pair) and wider screens get the table.
 */
export function TableScroll({
  label,
  children,
  className = "",
  sticky = true,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
}) {
  // A scroll region needs to be focusable so keyboard users can scroll it; the label names it for screen readers.
  return (
    <div role="region" aria-label={label} tabIndex={0} className={`table-scroll relative overflow-x-auto ${sticky ? "table-sticky" : ""} ${className}`}>
      {children}
    </div>
  );
}

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  /** Right-align figures. */
  numeric?: boolean;
  className?: string;
};

export function DataTable<T>({
  label,
  columns,
  rows,
  rowKey,
  mobile = "scroll",
  className = "",
  caption,
}: {
  label: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  mobile?: "scroll" | "cards";
  className?: string;
  caption?: React.ReactNode;
}) {
  const [first, ...rest] = columns;
  const table = (
    <table className="data-table">
      {caption ? <caption className="sr-only">{caption}</caption> : null}
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} scope="col" className={`${c.numeric ? "text-right" : ""} ${c.className ?? ""}`}>
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={rowKey(row, i)}>
            {columns.map((c, ci) =>
              ci === 0 ? (
                <th key={c.key} scope="row" className={`row-label ${c.className ?? ""}`}>
                  {c.cell(row)}
                </th>
              ) : (
                <td key={c.key} className={`${c.numeric ? "text-right" : ""} ${c.className ?? ""}`}>
                  {c.cell(row)}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (mobile === "scroll") {
    return (
      <TableScroll label={label} className={className}>
        {table}
      </TableScroll>
    );
  }

  return (
    <div className={className}>
      <ul className="divide-y divide-rule border-y border-rule sm:hidden" aria-label={label}>
        {rows.map((row, i) => (
          <li key={rowKey(row, i)} className="py-3">
            <div className="text-[15px] font-semibold text-ink">{first.cell(row)}</div>
            <dl className="mt-1.5 grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-x-3 gap-y-1 text-[13px]">
              {rest.map((c) => (
                <div key={c.key} className="contents">
                  <dt className="text-muted">{c.header}</dt>
                  <dd className="min-w-0 text-ink-soft tabular-nums">{c.cell(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <div className="hidden sm:block">
        <TableScroll label={label} sticky={false}>
          {table}
        </TableScroll>
      </div>
    </div>
  );
}
