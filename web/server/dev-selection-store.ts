import "server-only";

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DevSelectionRecord } from "../lib/devtools/dev-selection";

const PRIMARY_STATE_DIR = ".agent-picker";
const LEGACY_STATE_DIR = ".design-lab";

function resolveProjectRoot() {
  const cwd = process.cwd();
  const configuredRoot =
    process.env.AGENT_PICKER_PROJECT_ROOT ?? process.env.DESIGN_LAB_PROJECT_ROOT;

  if (configuredRoot) {
    return path.resolve(cwd, configuredRoot);
  }

  let current = cwd;
  while (true) {
    if (
      existsSync(path.join(current, PRIMARY_STATE_DIR)) ||
      existsSync(path.join(current, LEGACY_STATE_DIR))
    ) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return cwd;
    }

    current = parent;
  }
}

function resolveStateDir(projectRoot: string) {
  if (existsSync(path.join(projectRoot, PRIMARY_STATE_DIR))) {
    return PRIMARY_STATE_DIR;
  }

  if (existsSync(path.join(projectRoot, LEGACY_STATE_DIR))) {
    return LEGACY_STATE_DIR;
  }

  return PRIMARY_STATE_DIR;
}

const projectRoot = resolveProjectRoot();
const selectionPath = path.join(
  projectRoot,
  resolveStateDir(projectRoot),
  "dev-selection.json",
);

export function getDevSelectionPath() {
  return selectionPath;
}

export async function readDevSelection() {
  try {
    const raw = await readFile(selectionPath, "utf8");
    return JSON.parse(raw) as DevSelectionRecord;
  } catch {
    return null;
  }
}

export async function writeDevSelection(record: DevSelectionRecord) {
  await mkdir(path.dirname(selectionPath), { recursive: true });
  await writeFile(selectionPath, `${JSON.stringify(record, null, 2)}\n`, "utf8");
  return record;
}
