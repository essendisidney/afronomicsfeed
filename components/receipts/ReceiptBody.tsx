import { Children, isValidElement, type ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugify } from "@/lib/format";

/**
 * A Receipt's text (RECEIPTS.md section 1). Each paragraph that opens with (Facts), (Analysis) or (Opinion) gets the
 * label as a styled chip, so the reader always sees which kind of sentence they are reading. Opinion is set apart
 * with a rule in the margin.
 */
const LABEL = /^\((Facts|Analysis|Opinion)\)\s*/;

function labelled(children: ReactNode): { label: string | null; rest: ReactNode[] } {
  const parts = Children.toArray(children);
  const first = parts[0];
  if (typeof first === "string") {
    const m = LABEL.exec(first);
    if (m) return { label: m[1], rest: [first.slice(m[0].length), ...parts.slice(1)] };
  }
  return { label: null, rest: parts };
}

const tone: Record<string, string> = { Facts: "text-facts", Analysis: "text-analysis", Opinion: "text-opinion" };

export function ReceiptBody({ content }: { content: string }) {
  return (
    <div className="article-body receipt-body">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => {
            const { label, rest } = labelled(children);
            if (!label) return <p>{children}</p>;
            return (
              <p className={label === "Opinion" ? "border-l-2 border-opinion pl-3" : undefined} data-label={label.toLowerCase()}>
                <span className={`label-chip ${tone[label]}`}>{label}</span>
                {rest}
              </p>
            );
          },
          table: ({ children }) => (
            <div className="table-box overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
              <table className="data-table">{children}</table>
            </div>
          ),
          a: ({ href, children }) => (
            <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
              {children}
            </a>
          ),
          h2: ({ children }) => <h2 id={slugify(textOf(children))}>{children}</h2>,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}
