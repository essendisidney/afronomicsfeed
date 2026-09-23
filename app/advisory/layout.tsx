import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advisory",
  description: "Enterprise and licensed-desk contact stub for Afronomics Feed.",
};

export default function AdvisoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
