import type { Metadata } from "next";

import "./globals.css";

import { Providers } from "../components/providers";

export const metadata: Metadata = {
  title: "Agent Picker Example",
  description: "Standalone smoke-test host for Agent Picker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
