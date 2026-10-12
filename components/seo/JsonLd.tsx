/**
 * Renders schema.org structured data as a JSON-LD script tag. "<" is escaped so no string in the data can close the
 * script element (the Next.js JSON-LD guide's recommendation); undefined fields are dropped by JSON.stringify.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
