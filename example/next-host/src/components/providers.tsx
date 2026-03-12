"use client";

import AgentDomPicker from "@/components/devtools/AgentDomPicker";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {process.env.NODE_ENV === "development" ? <AgentDomPicker /> : null}
    </>
  );
}
