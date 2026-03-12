import type { Metadata } from "next";
import { AgentPickerWorkspace } from "@agent-picker/react";

export const metadata: Metadata = {
  title: "Agent Picker Playground",
  description: "Standalone playground for the bundled Agent Picker example host.",
};

export default function PlaygroundPage() {
  return <AgentPickerWorkspace />;
}
