import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Picker Design Lab",
  description: "Standalone design lab for the bundled Agent Picker example host.",
};

export default function DesignLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
