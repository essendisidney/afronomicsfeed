export type FaqItem = {
  slug: string;
  question: string;
  answer: string;
  href?: string;
};

/** Product FAQ. Answers stay factual about the build — no invented coverage claims. */
export const faqItems: FaqItem[] = [
  {
    slug: "what-is",
    question: "What is Afronomics?",
    answer:
      "Africa’s Economic Intelligence Layer: NEWS → DATA → CONTEXT → SIGNALS → DECISIONS. Not a generic news site.",
    href: "/about",
  },
  {
    slug: "demo-data",
    question: "Why are many cells empty or Demo?",
    answer:
      "Official prints only land with a cited source and as-of. Empty or Demo means the observation store is not live yet.",
    href: "/method",
  },
  {
    slug: "checkout",
    question: "Can I pay for Pro now?",
    answer: "Checkout and Auth are stubs. Every visitor is Free until billing ships.",
    href: "/pricing",
  },
  {
    slug: "api-keys",
    question: "Are API keys issued?",
    answer: "No. Public routes exist; keys are not minted from this build.",
    href: "/developers",
  },
  {
    slug: "linkedin",
    question: "Is there a LinkedIn page?",
    answer: "Yes. Share intents and the company page are linked from Social.",
    href: "/social",
  },
  {
    slug: "contact",
    question: "How do I reach the desk?",
    answer: "Use Contact doors. There is no fake form that pretends a message was delivered.",
    href: "/contact",
  },
];
