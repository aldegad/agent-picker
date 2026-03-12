import { readFileSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

function readPackageJson(directoryPath) {
  return JSON.parse(readFileSync(path.join(directoryPath, "package.json"), "utf8"));
}

export function detectPackageManager(projectRoot) {
  try {
    const packageJson = readPackageJson(projectRoot);
    const packageManager = packageJson.packageManager?.split("@")[0];
    if (packageManager === "pnpm" || packageManager === "npm" || packageManager === "yarn") {
      return packageManager;
    }
  } catch {
    // Ignore missing package.json and fall through to npm.
  }

  return "npm";
}

export function formatSelfRunCommand(packageManager, scriptName) {
  switch (packageManager) {
    case "pnpm":
      return `pnpm run ${scriptName}`;
    case "yarn":
      return `yarn ${scriptName}`;
    case "npm":
    default:
      return `npm run ${scriptName}`;
  }
}

export function formatWorkspaceRunCommand(packageManager, directoryPath, scriptName) {
  switch (packageManager) {
    case "pnpm":
      return `pnpm --dir ${directoryPath} run ${scriptName}`;
    case "yarn":
      return `yarn --cwd ${directoryPath} ${scriptName}`;
    case "npm":
    default:
      return `npm run ${scriptName} --prefix ${directoryPath}`;
  }
}

function resolveCurrentRunner(scriptName, cwd) {
  if (process.env.npm_execpath) {
    const npmExecPath = process.env.npm_execpath;
    if (npmExecPath.endsWith(".js") || npmExecPath.endsWith(".cjs") || npmExecPath.endsWith(".mjs")) {
      return {
        command: process.execPath,
        args: [npmExecPath, "run", scriptName],
      };
    }

    return {
      command: npmExecPath,
      args: ["run", scriptName],
    };
  }

  const packageManager = detectPackageManager(cwd);
  switch (packageManager) {
    case "pnpm":
      return { command: "pnpm", args: ["run", scriptName] };
    case "yarn":
      return { command: "yarn", args: [scriptName] };
    case "npm":
    default:
      return { command: "npm", args: ["run", scriptName] };
  }
}

export function readPackageScripts(cwd = process.cwd()) {
  try {
    return readPackageJson(cwd).scripts ?? {};
  } catch {
    return {};
  }
}

export function spawnPackageScript(scriptName, options = {}) {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const optional = options.optional ?? false;
  const scripts = readPackageScripts(cwd);

  if (!scripts[scriptName]) {
    if (optional) {
      return null;
    }

    throw new Error(`Package script not found: ${scriptName}`);
  }

  const runner = resolveCurrentRunner(scriptName, cwd);
  return spawn(runner.command, runner.args, {
    cwd,
    stdio: "inherit",
    env: process.env,
  });
}
