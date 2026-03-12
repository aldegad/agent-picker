import type { AgentPickerScene, AgentPickerStudy, AgentPickerSyncState, AgentPickerViewport } from "./types";

const DEFAULT_DAEMON_URL = "http://127.0.0.1:4312";
const DEFAULT_SCENE_SNAPSHOT_URL = "/agent-picker/scene.json";
type RawViewport = AgentPickerViewport | "mark";
export type AgentPickerSceneSource = "daemon" | "snapshot";

export interface AgentPickerSceneEvent {
  type: "scene.updated";
  source: string;
  revision?: number;
  updatedAt?: string;
}

function isViewport(value: unknown): value is RawViewport {
  return value === "desktop" || value === "mobile" || value === "original" || value === "mark";
}

function normalizeZoom(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 1;
}

function normalizeSelectedStudyId(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function normalizeNode(rawNode: unknown): AgentPickerStudy | null {
  if (!rawNode || typeof rawNode !== "object") return null;

  const candidate = rawNode as Record<string, unknown>;
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.itemId !== "string" ||
    typeof candidate.title !== "string" ||
    !isViewport(candidate.viewport)
  ) {
    return null;
  }

  const x = typeof candidate.x === "number" && Number.isFinite(candidate.x) ? candidate.x : 0;
  const y = typeof candidate.y === "number" && Number.isFinite(candidate.y) ? candidate.y : 0;
  const zIndex = typeof candidate.zIndex === "number" && Number.isFinite(candidate.zIndex) ? candidate.zIndex : 1;

  return {
    id: candidate.id,
    itemId: candidate.itemId,
    title: candidate.title,
    viewport: (candidate.viewport === "mark" ? "original" : candidate.viewport) as AgentPickerViewport,
    x,
    y,
    zIndex,
    hidden: Boolean(candidate.hidden),
    locked: Boolean(candidate.locked),
    propsPatch:
      candidate.propsPatch && typeof candidate.propsPatch === "object"
        ? (candidate.propsPatch as Record<string, unknown>)
        : {},
  };
}

export function getAgentPickerDaemonUrl() {
  const raw = process.env.NEXT_PUBLIC_AGENT_PICKER_DAEMON_URL ?? DEFAULT_DAEMON_URL;
  return raw.replace(/\/$/, "");
}

export function getAgentPickerEventsUrl() {
  return `${getAgentPickerDaemonUrl()}/events`;
}

export function getAgentPickerSnapshotUrl() {
  const raw = process.env.NEXT_PUBLIC_AGENT_PICKER_SNAPSHOT_URL ?? DEFAULT_SCENE_SNAPSHOT_URL;
  return raw;
}

export function normalizeScene(scene: unknown): AgentPickerScene {
  if (!scene || typeof scene !== "object") {
    return {
      version: 1,
      meta: { zoom: 1, revision: 0 },
      nodes: [],
    };
  }

  const candidate = scene as Record<string, unknown>;
  const version =
    typeof candidate.version === "number" && Number.isInteger(candidate.version) && candidate.version > 0
      ? candidate.version
      : 1;

  const meta = candidate.meta && typeof candidate.meta === "object" ? (candidate.meta as Record<string, unknown>) : {};
  const rawNodes = Array.isArray(candidate.nodes) ? candidate.nodes : [];
  const nodes = rawNodes
    .map((rawNode) => normalizeNode(rawNode))
    .filter((node): node is AgentPickerStudy => Boolean(node))
    .sort((left, right) => left.zIndex - right.zIndex);

  return {
    version,
    meta: {
      zoom: normalizeZoom(meta.zoom),
      revision:
        typeof meta.revision === "number" && Number.isInteger(meta.revision) && meta.revision >= 0 ? meta.revision : 0,
      updatedAt: typeof meta.updatedAt === "string" ? meta.updatedAt : undefined,
      selectedStudyId: normalizeSelectedStudyId(meta.selectedStudyId),
    },
    nodes,
  };
}

async function requestScene(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return normalizeScene(null);
  }

  return normalizeScene(await response.json());
}

export async function fetchScene(signal?: AbortSignal) {
  return requestScene(`${getAgentPickerDaemonUrl()}/scene`, {
    method: "GET",
    signal,
  });
}

export async function fetchSnapshotScene(signal?: AbortSignal) {
  return requestScene(getAgentPickerSnapshotUrl(), {
    method: "GET",
    signal,
  });
}

export async function fetchAvailableScene(signal?: AbortSignal): Promise<{
  scene: AgentPickerScene;
  source: AgentPickerSceneSource;
}> {
  try {
    return {
      scene: await fetchScene(signal),
      source: "daemon",
    };
  } catch (daemonError) {
    try {
      return {
        scene: await fetchSnapshotScene(signal),
        source: "snapshot",
      };
    } catch {
      throw daemonError;
    }
  }
}

export async function updateSceneMeta(
  updates: Partial<Pick<AgentPickerScene["meta"], "selectedStudyId">>,
  signal?: AbortSignal,
) {
  return requestScene(`${getAgentPickerDaemonUrl()}/scene/meta`, {
    method: "PATCH",
    body: JSON.stringify(updates),
    signal,
  });
}

export async function addSceneNode(node: AgentPickerStudy, signal?: AbortSignal) {
  return requestScene(`${getAgentPickerDaemonUrl()}/scene/nodes`, {
    method: "POST",
    body: JSON.stringify({
      id: node.id,
      itemId: node.itemId,
      title: node.title,
      viewport: node.viewport,
      x: node.x,
      y: node.y,
      zIndex: node.zIndex,
      hidden: Boolean(node.hidden),
      locked: Boolean(node.locked),
      propsPatch: node.propsPatch ?? {},
    }),
    signal,
  });
}

export async function updateSceneNode(
  nodeId: string,
  updates: Partial<Pick<AgentPickerStudy, "title" | "viewport" | "x" | "y" | "zIndex" | "hidden" | "locked" | "propsPatch">>,
  signal?: AbortSignal,
) {
  return requestScene(`${getAgentPickerDaemonUrl()}/scene/nodes/${nodeId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
    signal,
  });
}

export async function removeSceneNode(nodeId: string, signal?: AbortSignal) {
  return requestScene(`${getAgentPickerDaemonUrl()}/scene/nodes/${nodeId}`, {
    method: "DELETE",
    signal,
  });
}

export function createSceneEventSource() {
  return new EventSource(getAgentPickerEventsUrl());
}

export function parseSceneEvent(raw: string): AgentPickerSceneEvent | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed.type !== "scene.updated") return null;

    return {
      type: "scene.updated",
      source: typeof parsed.source === "string" ? parsed.source : "unknown",
      revision: typeof parsed.revision === "number" ? parsed.revision : undefined,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : undefined,
    };
  } catch {
    return null;
  }
}

export function getSyncStateLabel(state: AgentPickerSyncState) {
  switch (state) {
    case "connecting":
      return "Connecting";
    case "saving":
      return "Saving";
    case "snapshot":
      return "View Only";
    case "offline":
      return "Daemon Offline";
    case "conflict":
      return "Remote Changed";
    default:
      return "Synced";
  }
}
