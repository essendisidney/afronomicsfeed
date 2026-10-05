import { slugify } from "@/lib/format";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="article-body">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          // tables scroll sideways on a phone instead of widening the page
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto">
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
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
