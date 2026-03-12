"use client";

import { createContext, useContext, useMemo } from "react";
import InternalAgentPickerApp from "../../../web/components/AgentPickerApp";
import InternalAgentDomPicker from "../../../web/components/devtools/AgentDomPicker";
import {
  createAgentPickerRegistry,
  mergeAgentPickerItems,
  type AgentPickerRegistry,
} from "./registry";
import type { AgentPickerComponentItem } from "./types";

interface AgentPickerProviderProps {
  children: React.ReactNode;
  items: AgentPickerComponentItem[];
  itemsById?: Map<string, AgentPickerComponentItem>;
  showDevtoolsInDevelopment?: boolean;
}

interface AgentPickerWorkspaceProps {
  items?: AgentPickerComponentItem[];
  itemsById?: Map<string, AgentPickerComponentItem>;
}

interface AgentPickerProjectProviderProps {
  children: React.ReactNode;
  draftItems?: AgentPickerComponentItem[];
  projectItems?: AgentPickerComponentItem[];
  pageImportItems?: AgentPickerComponentItem[];
  showDevtoolsInDevelopment?: boolean;
}

const AgentPickerRegistryContext = createContext<AgentPickerRegistry | null>(null);

function useResolvedRegistry(
  items?: AgentPickerComponentItem[],
  itemsById?: Map<string, AgentPickerComponentItem>,
): AgentPickerRegistry {
  const context = useContext(AgentPickerRegistryContext);

  return useMemo(() => {
    if (items) {
      return itemsById
        ? { items, itemsById }
        : createAgentPickerRegistry(items);
    }

    if (context) {
      return context;
    }

    throw new Error(
      "AgentPickerWorkspace needs either AgentPickerProvider or explicit items.",
    );
  }, [context, items, itemsById]);
}

export function AgentPickerProvider({
  children,
  items,
  itemsById,
  showDevtoolsInDevelopment = false,
}: AgentPickerProviderProps) {
  const value = useMemo(
    () =>
      itemsById
        ? { items, itemsById }
        : createAgentPickerRegistry(items),
    [items, itemsById],
  );

  return (
    <AgentPickerRegistryContext.Provider value={value}>
      {children}
      {showDevtoolsInDevelopment && process.env.NODE_ENV === "development" ? (
        <InternalAgentDomPicker />
      ) : null}
    </AgentPickerRegistryContext.Provider>
  );
}

export function AgentPickerProjectProvider({
  children,
  draftItems = [],
  projectItems = [],
  pageImportItems = [],
  showDevtoolsInDevelopment = false,
}: AgentPickerProjectProviderProps) {
  const items = useMemo(
    () => mergeAgentPickerItems(draftItems, projectItems, pageImportItems),
    [draftItems, pageImportItems, projectItems],
  );

  return (
    <AgentPickerProvider
      items={items}
      showDevtoolsInDevelopment={showDevtoolsInDevelopment}
    >
      {children}
    </AgentPickerProvider>
  );
}

export function useAgentPickerRegistry() {
  const context = useContext(AgentPickerRegistryContext);
  if (!context) {
    throw new Error("useAgentPickerRegistry must be used inside AgentPickerProvider.");
  }

  return context;
}

export function AgentPickerWorkspace({
  items,
  itemsById,
}: AgentPickerWorkspaceProps) {
  const registry = useResolvedRegistry(items, itemsById);

  return (
    <InternalAgentPickerApp
      items={registry.items}
      itemsById={registry.itemsById}
    />
  );
}

export function AgentPickerDevtools() {
  return <InternalAgentDomPicker />;
}
