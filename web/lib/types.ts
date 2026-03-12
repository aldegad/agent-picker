import type { ComponentType } from "react";

export type AgentPickerSourceKind = "project" | "draft" | "page-import";
export type AgentPickerViewport = "desktop" | "mobile" | "original";
export type AgentPickerSyncState = "connecting" | "connected" | "saving" | "offline" | "conflict" | "snapshot";
export type AgentPickerRenderKind = "component" | "asset";

export interface AgentPickerViewportConfig {
  key: AgentPickerViewport;
  label: string;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  frameHeight: number;
  nodeWidth: number;
  nodeHeight: number;
}

interface AgentPickerItemBase {
  id: string;
  title: string;
  shortLabel: string;
  description?: string | null;
  sourceKind: AgentPickerSourceKind;
  category: string;
  componentPath: string;
  sourceRoute?: string | null;
  sourceFilePath?: string | null;
  tags: string[];
  recommendedViewport: AgentPickerViewport;
  renderKind: AgentPickerRenderKind;
}

export interface AgentPickerComponentDraftItem extends AgentPickerItemBase {
  renderKind: "component";
  Component: ComponentType<Record<string, unknown>>;
  props: Record<string, unknown>;
}

export interface AgentPickerAssetDraftItem extends AgentPickerItemBase {
  renderKind: "asset";
  assetUrl: string;
}

export type AgentPickerComponentItem = AgentPickerComponentDraftItem | AgentPickerAssetDraftItem;

export interface AgentPickerStudy {
  id: string;
  itemId: string;
  title: string;
  viewport: AgentPickerViewport;
  x: number;
  y: number;
  zIndex: number;
  hidden?: boolean;
  locked?: boolean;
  propsPatch?: Record<string, unknown>;
}

export interface AgentPickerSceneMeta {
  zoom?: number;
  revision?: number;
  updatedAt?: string;
  selectedStudyId?: string | null;
}

export interface AgentPickerSceneNode {
  id: string;
  itemId: string;
  title: string;
  viewport: AgentPickerViewport;
  x: number;
  y: number;
  zIndex: number;
  hidden?: boolean;
  locked?: boolean;
  propsPatch?: Record<string, unknown>;
}

export interface AgentPickerScene {
  version: number;
  meta: AgentPickerSceneMeta;
  nodes: AgentPickerSceneNode[];
}

export const agentPickerCanvas = {
  minWidth: 1080,
  minHeight: 640,
  maxWidth: 3200,
  maxHeight: 3200,
  padding: 24,
};

export const agentPickerViewports: Record<AgentPickerViewport, AgentPickerViewportConfig> = {
  desktop: {
    key: "desktop",
    label: "Desktop",
    canvasWidth: 1440,
    canvasHeight: 2080,
    scale: 0.2,
    frameHeight: 280,
    nodeWidth: 360,
    nodeHeight: 280,
  },
  mobile: {
    key: "mobile",
    label: "Mobile",
    canvasWidth: 390,
    canvasHeight: 844,
    scale: 0.56,
    frameHeight: 332,
    nodeWidth: 260,
    nodeHeight: 380,
  },
  original: {
    key: "original",
    label: "Original",
    canvasWidth: 720,
    canvasHeight: 720,
    scale: 0.3,
    frameHeight: 200,
    nodeWidth: 200,
    nodeHeight: 200,
  },
};

export const agentPickerViewportList = Object.values(agentPickerViewports);

export function clampCanvasPosition(viewport: AgentPickerViewport, x: number, y: number) {
  const config = agentPickerViewports[viewport];
  const maxX = agentPickerCanvas.maxWidth - config.nodeWidth;
  const maxY = agentPickerCanvas.maxHeight - config.nodeHeight;

  return {
    x: Math.max(0, Math.min(x, maxX)),
    y: Math.max(0, Math.min(y, maxY)),
  };
}

export function getCanvasBounds(studies: Pick<AgentPickerStudy, "viewport" | "x" | "y">[]) {
  let width = studies.length > 0 ? 0 : agentPickerCanvas.minWidth;
  let height = studies.length > 0 ? 0 : agentPickerCanvas.minHeight;

  for (const study of studies) {
    const config = agentPickerViewports[study.viewport];
    width = Math.max(width, study.x + config.nodeWidth + agentPickerCanvas.padding);
    height = Math.max(height, study.y + config.nodeHeight + agentPickerCanvas.padding);
  }

  return {
    width: Math.min(agentPickerCanvas.maxWidth, Math.round(width)),
    height: Math.min(agentPickerCanvas.maxHeight, Math.round(height)),
  };
}
