import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { faqItems } from "@/lib/demo/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Afronomics Feed. Honest answers only.",
};

export default function FaqPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "FAQ" }]}
      kicker="FAQ"
      title="Straight answers"
      lede="What the product is, what is empty on purpose, and what is not live yet. No invented coverage or checkout claims."
    >
      <p className="text-sm">
        <Link href="/about" className="text-forest underline underline-offset-2">
          About
        </Link>
        {" · "}
        <Link href="/method" className="text-forest underline underline-offset-2">
          Method
        </Link>
        {" · "}
        <Link href="/golive" className="text-forest underline underline-offset-2">
          Go live
        </Link>
        {" · "}
        <Link href="/contact" className="text-forest underline underline-offset-2">
          Contact
        </Link>
        {" · "}
        <Link href="/glossary" className="text-forest underline underline-offset-2">
          Glossary
        </Link>
      </p>

      <ul className="mt-10 space-y-6">
        {faqItems.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-4">
            <p className="font-serif text-xl">{item.question}</p>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{item.answer}</p>
            {item.href ? (
              <Link href={item.href} className="mt-2 inline-block text-sm text-forest underline underline-offset-2">
                Open
              </Link>
            ) : null}
          </li>
        ))}
      </ul>

      <Provenance source="Product FAQ" methodology="Answers describe the build. No invent of live prints." />
    </LayerPage>
  );
}
