import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const SCAN_SKIP_DIRS = new Set([
  ".git",
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "vendor",
]);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function toRelativePath(projectRoot, targetPath) {
  const relativePath = path.relative(projectRoot, targetPath);
  return relativePath.length > 0 ? toPosix(relativePath) : ".";
}

function readTextIfExists(filePath) {
  try {
    return readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function mergeDependencies(packageJson) {
  return {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
  };
}

function resolveAppRouterLayout(hostRoot) {
  const appLayoutTsx = path.join(hostRoot, "app", "layout.tsx");
  if (existsSync(appLayoutTsx)) {
    return {
      routeRoot: "app",
      layoutPath: appLayoutTsx,
    };
  }

  const srcAppLayoutTsx = path.join(hostRoot, "src", "app", "layout.tsx");
  if (existsSync(srcAppLayoutTsx)) {
    return {
      routeRoot: "src/app",
      layoutPath: srcAppLayoutTsx,
    };
  }

  return null;
}

function collectPackageDirectories(projectRoot) {
  const directories = [];

  function walk(currentPath, depth) {
    if (depth > 4) {
      return;
    }

    if (existsSync(path.join(currentPath, "package.json"))) {
      directories.push(currentPath);
    }

    for (const entry of readdirSync(currentPath, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith(".")) continue;
      if (SCAN_SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(currentPath, entry.name), depth + 1);
    }
  }

  walk(projectRoot, 0);
  return directories;
}

export function describeHost(host) {
  const location = host.path === "." ? "project root" : host.path;
  const statusLabel = host.status === "supported" ? "supported" : "unsupported";
  return `${location} (${host.kind}, ${statusLabel})`;
}

export function detectHostAtPath(projectRoot, hostRoot) {
  const resolvedProjectRoot = path.resolve(projectRoot);
  const resolvedHostRoot = path.resolve(hostRoot);
  const hostPath = toRelativePath(resolvedProjectRoot, resolvedHostRoot);
  const packageJsonPath = path.join(resolvedHostRoot, "package.json");

  if (!existsSync(packageJsonPath)) {
    return {
      path: hostPath,
      absPath: resolvedHostRoot,
      kind: "missing-package-json",
      status: "unsupported",
      reason: "package.json not found.",
    };
  }

  const packageJson = readJson(packageJsonPath);
  const dependencies = mergeDependencies(packageJson);

  if (packageJson.name === "agent-picker" && hostPath === ".") {
    return {
      path: hostPath,
      absPath: resolvedHostRoot,
      kind: "agent-picker-repo",
      status: "unsupported",
      reason: "This is the shared engine repo. Use the standalone example or run init from a host project root instead.",
    };
  }

  if (dependencies.expo) {
    return {
      path: hostPath,
      absPath: resolvedHostRoot,
      packageJson,
      kind: "react-native-expo",
      status: "unsupported",
      reason: "Expo / React Native support is planned next but is not installable yet.",
    };
  }

  if (dependencies["react-native"]) {
    return {
      path: hostPath,
      absPath: resolvedHostRoot,
      packageJson,
      kind: "react-native",
      status: "unsupported",
      reason: "React Native support is planned next but is not installable yet.",
    };
  }

  if (existsSync(path.join(resolvedHostRoot, "manage.py"))) {
    return {
      path: hostPath,
      absPath: resolvedHostRoot,
      kind: "django",
      status: "unsupported",
      reason: "Django hosts are not supported by the installer yet.",
    };
  }

  const pyproject = readTextIfExists(path.join(resolvedHostRoot, "pyproject.toml")).toLowerCase();
  if (pyproject.includes("django")) {
    return {
      path: hostPath,
      absPath: resolvedHostRoot,
      kind: "django",
      status: "unsupported",
      reason: "Django hosts are not supported by the installer yet.",
    };
  }

  if (dependencies.next) {
    const appRouter = resolveAppRouterLayout(resolvedHostRoot);
    if (!appRouter) {
      return {
        path: hostPath,
        absPath: resolvedHostRoot,
        packageJson,
        kind: "next-non-app-router",
        status: "unsupported",
        reason: "Next.js App Router with layout.tsx is required.",
      };
    }

    if (!existsSync(path.join(resolvedHostRoot, "tsconfig.json"))) {
      return {
        path: hostPath,
        absPath: resolvedHostRoot,
        packageJson,
        kind: "next-app-router-js",
        status: "unsupported",
        reason: "The current installer supports TypeScript App Router hosts only.",
      };
    }

    if (!dependencies.tailwindcss && !dependencies["@tailwindcss/postcss"]) {
      return {
        path: hostPath,
        absPath: resolvedHostRoot,
        packageJson,
        kind: "next-app-router-no-tailwind",
        status: "unsupported",
        reason: "Tailwind CSS is required for the current Agent Picker UI.",
      };
    }

    return {
      path: hostPath,
      absPath: resolvedHostRoot,
      packageJson,
      packageJsonPath,
      kind: "next-app-router",
      status: "supported",
      routeRoot: appRouter.routeRoot,
      layoutPath: appRouter.layoutPath,
    };
  }

  return {
    path: hostPath,
    absPath: resolvedHostRoot,
    packageJson,
    kind: "unknown",
    status: "unsupported",
    reason: "No supported host type was detected here.",
  };
}

export function scanHosts(projectRoot) {
  const resolvedProjectRoot = path.resolve(projectRoot);
  return collectPackageDirectories(resolvedProjectRoot)
    .map((directoryPath) => detectHostAtPath(resolvedProjectRoot, directoryPath))
    .sort((left, right) => left.path.localeCompare(right.path));
}
