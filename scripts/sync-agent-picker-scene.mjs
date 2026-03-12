import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { resolveHostPaths } from "../tools/shared/project-context.mjs";

const emptyScene = {
  version: 1,
  meta: {
    zoom: 1,
    revision: 0,
  },
  nodes: [],
};

function readScene(sourcePath) {
  try {
    const raw = readFileSync(sourcePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return emptyScene;
  }
}

export function syncAgentPickerScene(cwd = process.cwd()) {
  const { scenePath, publicScenePath } = resolveHostPaths(cwd);
  mkdirSync(dirname(publicScenePath), { recursive: true });
  writeFileSync(publicScenePath, `${JSON.stringify(readScene(scenePath), null, 2)}\n`, "utf8");
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  syncAgentPickerScene();
}
