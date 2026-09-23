import { slugify } from "@/lib/format";
import Markdown from "react-markdown";

export function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="article-body">
      <Markdown
        components={{
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
