"use client";

import type { ComponentType } from "react";
import {
  AgentPickerDesignLab,
  type AgentPickerComponentItem,
} from "@agent-picker/design-lab";
import WelcomeCard from "../../components/agent-picker/WelcomeCard";

const designLabItems: AgentPickerComponentItem[] = [
  {
    id: "draft-example-welcome-card",
    title: "Welcome Card",
    shortLabel: "Welcome Card",
    description: "Standalone example card shipped with the Agent Picker repository.",
    sourceKind: "draft",
    category: "cards",
    componentPath: "src/components/agent-picker/WelcomeCard.tsx",
    tags: ["example", "welcome", "card"],
    recommendedViewport: "desktop",
    renderKind: "component",
    Component: WelcomeCard as ComponentType<Record<string, unknown>>,
    props: {},
  },
];

export default function DesignLabPage() {
  return <AgentPickerDesignLab items={designLabItems} />;
}
