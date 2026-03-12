import type { Metadata } from "next";

import AgentPickerApp from "@/components/agent-picker/AgentPickerApp";

export const metadata: Metadata = {
  title: "Agent Picker Playground",
  description: "Standalone playground for the bundled Agent Picker example host.",
};

export default function PlaygroundPage() {
  return <AgentPickerApp />;
}
