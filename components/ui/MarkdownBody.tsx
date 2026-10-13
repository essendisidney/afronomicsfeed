import { slugify } from "@/lib/format";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="article-body">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Tables scroll sideways inside their own framed box on a phone instead of widening the page. The box is
          // focusable so keyboard users can scroll it too.
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
          h2: ({ children }) => {
            const text = String(children);
            return <h2 id={slugify(text)}>{children}</h2>;
          },
          // A chart or image with its caption (the Markdown title, else the alt text). Spans, not <figure>, because
          // Markdown puts images inside a paragraph and a figure may not sit in a <p>.
          img: ({ src, alt, title }) => (
            <span className="article-figure">
              {/* eslint-disable-next-line @next/next/no-img-element -- Markdown images have no known size for next/image */}
              <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" decoding="async" />
              {title || alt ? <span className="article-caption">{title || alt}</span> : null}
            </span>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
