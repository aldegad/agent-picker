"use client";

import { AgentPickerProjectProvider } from "@agent-picker/react";
import { generatedAgentPickerDraftItems } from "@/lib/agent-picker/generated-drafts";
import { generatedAgentPickerPageImportItems } from "@/lib/agent-picker/generated-page-imports";
import { projectAgentPickerItems } from "@/lib/agent-picker/project-items";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AgentPickerProjectProvider
      draftItems={generatedAgentPickerDraftItems}
      projectItems={projectAgentPickerItems}
      pageImportItems={generatedAgentPickerPageImportItems}
      showDevtoolsInDevelopment
    >
      {children}
    </AgentPickerProjectProvider>
  );
}
