import {
  clampCanvasPosition,
  agentPickerCanvas,
  agentPickerViewports,
  type AgentPickerComponentItem,
  type AgentPickerScene,
  type AgentPickerStudy,
} from "./types";

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 10;
export const DEFAULT_TOOLBAR_SAFE_TOP = 104;

export function clampZoom(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
}

export function getCanvasSafeTop(toolbarSafeTop: number, zoom: number) {
  return Math.max(agentPickerCanvas.padding, Math.ceil(toolbarSafeTop / Math.max(zoom, 0.1)) + 16);
}

export function getDefaultStudyPosition(
  item: AgentPickerComponentItem,
  index: number,
  toolbarSafeTop: number,
  zoom: number,
) {
  const config = agentPickerViewports[item.recommendedViewport];
  const column = index % 4;
  const row = Math.floor(index / 4);
  const x = agentPickerCanvas.padding + column * (config.nodeWidth + 24);
  const y = getCanvasSafeTop(toolbarSafeTop, zoom) + row * (config.nodeHeight + 24);

  return clampCanvasPosition(item.recommendedViewport, x, y);
}

export function getNextZIndex(studies: AgentPickerStudy[]) {
  return studies.reduce((maxZIndex, study) => Math.max(maxZIndex, study.zIndex), 0) + 1;
}

export function getLastVisibleStudyId(studies: AgentPickerStudy[]) {
  return [...studies].reverse().find((study) => !study.hidden)?.id ?? null;
}

export function sortStudies(studies: AgentPickerStudy[]) {
  return [...studies].sort((left, right) => left.zIndex - right.zIndex);
}

export function createStudy(
  item: AgentPickerComponentItem,
  studies: AgentPickerStudy[],
  toolbarSafeTop: number,
  zoom: number,
  point?: { x: number; y: number },
) {
  const viewport = item.recommendedViewport;
  const config = agentPickerViewports[viewport];
  const fallback = getDefaultStudyPosition(item, studies.length, toolbarSafeTop, zoom);
  const position = point
    ? clampCanvasPosition(viewport, point.x - config.nodeWidth / 2, point.y - 56)
    : fallback;

  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${item.id}-${Date.now()}`,
    itemId: item.id,
    title: item.shortLabel,
    viewport,
    x: position.x,
    y: position.y,
    zIndex: getNextZIndex(studies),
    hidden: false,
    locked: false,
    propsPatch: {},
  } satisfies AgentPickerStudy;
}

export function autoArrangeStudies(
  studies: AgentPickerStudy[],
  itemsById: Map<string, AgentPickerComponentItem>,
  toolbarSafeTop: number,
  zoom: number,
) {
  let cursorX = agentPickerCanvas.padding;
  let cursorY = getCanvasSafeTop(toolbarSafeTop, zoom);
  let rowHeight = 0;

  return sortStudies(studies).map((study) => {
    const item = itemsById.get(study.itemId);
    const config = agentPickerViewports[study.viewport];

    if (!item) return study;

    if (cursorX + config.nodeWidth > agentPickerCanvas.minWidth - agentPickerCanvas.padding) {
      cursorX = agentPickerCanvas.padding;
      cursorY += rowHeight + 28;
      rowHeight = 0;
    }

    const nextStudy = {
      ...study,
      ...clampCanvasPosition(study.viewport, cursorX, cursorY),
    };

    cursorX += config.nodeWidth + 28;
    rowHeight = Math.max(rowHeight, config.nodeHeight);
    return nextStudy;
  });
}

export function resolveSceneStudies(
  scene: AgentPickerScene,
  itemsById: Map<string, AgentPickerComponentItem>,
  toolbarSafeTop: number,
  zoom: number,
) {
  const studies = sortStudies(
    scene.nodes
      .filter((study) => itemsById.has(study.itemId))
      .map((study, index) => {
        const item = itemsById.get(study.itemId);
        if (!item) return study;

        const fallback = getDefaultStudyPosition(item, index, toolbarSafeTop, zoom);
        const hasValidPosition = Number.isFinite(study.x) && Number.isFinite(study.y);
        const nextPosition = hasValidPosition ? clampCanvasPosition(study.viewport, study.x, study.y) : fallback;

        return {
          ...study,
          x: nextPosition.x,
          y: nextPosition.y,
          zIndex: study.zIndex || index + 1,
          hidden: Boolean(study.hidden),
          locked: Boolean(study.locked),
          propsPatch: study.propsPatch ?? {},
        };
      }),
  );

  return {
    studies,
    selectedStudyId:
      typeof scene.meta.selectedStudyId === "string" && studies.some((study) => study.id === scene.meta.selectedStudyId)
        ? scene.meta.selectedStudyId
        : null,
    revision: scene.meta.revision ?? 0,
    updatedAt: scene.meta.updatedAt,
  };
}
