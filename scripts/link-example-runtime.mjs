import { lstatSync, mkdirSync, readlinkSync, rmSync, symlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(repoRoot, "example", "next-host", "node_modules");
const targetDir = path.join(repoRoot, "web", "node_modules");

function tryReadLinkTarget(targetPath) {
  try {
    const stat = lstatSync(targetPath);
    if (!stat.isSymbolicLink()) {
      return null;
    }

    return path.resolve(path.dirname(targetPath), readlinkSync(targetPath));
  } catch {
    return null;
  }
}

try {
  lstatSync(sourceDir);
} catch {
  process.stdout.write("agent-picker runtime link skipped: example node_modules not found\n");
  process.exit(0);
}

mkdirSync(path.dirname(targetDir), { recursive: true });

const currentLink = tryReadLinkTarget(targetDir);
if (currentLink === sourceDir) {
  process.exit(0);
}

try {
  lstatSync(targetDir);
  rmSync(targetDir, { force: true, recursive: true });
} catch {
  // Ignore missing target path.
}

const relativeSource = path.relative(path.dirname(targetDir), sourceDir);
try {
  symlinkSync(relativeSource, targetDir, process.platform === "win32" ? "junction" : "dir");
} catch (error) {
  if (!(error && typeof error === "object" && "code" in error && error.code === "EEXIST")) {
    throw error;
  }

  if (tryReadLinkTarget(targetDir) !== sourceDir) {
    throw error;
  }
}
process.stdout.write(`agent-picker runtime link ready: ${targetDir} -> ${relativeSource}\n`);
