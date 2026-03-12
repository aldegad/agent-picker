#!/usr/bin/env node

import { spawnPackageScript } from "../tools/shared/package-manager.mjs";

const args = process.argv.slice(2);
const scriptName = args[0];
const optional = args.includes("--optional");

if (!scriptName) {
  process.stderr.write("Usage: node ./scripts/run-package-script.mjs <script-name> [--optional]\n");
  process.exit(1);
}

let child;
try {
  child = spawnPackageScript(scriptName, { optional });
} catch (error) {
  process.stderr.write(`[agent-picker] ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}

if (!child) {
  process.exit(0);
}

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
