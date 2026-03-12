import "server-only";

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DevSelectionRecord } from "../lib/devtools/dev-selection";

const PRIMARY_STATE_DIR = ".agent-picker";

function resolveProjectRoot() {
  const cwd = process.cwd();
  const configuredRoot = process.env.AGENT_PICKER_PROJECT_ROOT;

  if (configuredRoot) {
    return path.resolve(cwd, configuredRoot);
  }

  let current = cwd;
  while (true) {
    if (existsSync(path.join(current, PRIMARY_STATE_DIR))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return cwd;
    }

    current = parent;
  }
}

const projectRoot = resolveProjectRoot();
const selectionPath = path.join(
  projectRoot,
  PRIMARY_STATE_DIR,
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
