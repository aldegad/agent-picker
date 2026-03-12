"use client";

import VendorAgentPickerApp from "@agent-picker/web/components/AgentPickerApp";
import { agentPickerItems, agentPickerItemsById } from "@/lib/agent-picker/registry";

export default function AgentPickerApp() {
  return <VendorAgentPickerApp items={agentPickerItems} itemsById={agentPickerItemsById} />;
}
