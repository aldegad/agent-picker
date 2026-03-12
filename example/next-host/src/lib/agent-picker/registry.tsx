import { generatedAgentPickerDraftItems } from "./generated-drafts";
import { generatedAgentPickerPageImportItems } from "./generated-page-imports";
import { projectAgentPickerItems } from "./project-items";
import type { AgentPickerComponentItem } from "./types";

export const agentPickerDraftsDirectory = "components/agent-picker/drafts";
export const agentPickerProjectRegistryPath = "src/lib/agent-picker/project-items.tsx";
export const agentPickerPageImportsConfigPath = ".agent-picker/page-imports.json";

export const agentPickerItems: AgentPickerComponentItem[] = [
  ...generatedAgentPickerDraftItems,
  ...projectAgentPickerItems,
  ...generatedAgentPickerPageImportItems,
];

export const agentPickerItemsById = new Map(agentPickerItems.map((item) => [item.id, item]));
