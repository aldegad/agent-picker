#!/usr/bin/env node

import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { detectPackageManager, formatSelfRunCommand } from "../shared/package-manager.mjs";
import { describeHost, detectHostAtPath, scanHosts } from "./lib/detect-hosts.mjs";
import { installNextAppRouter } from "./lib/install-next-app-router.mjs";

function parseArgs(argv) {
  const args = {
    host: null,
    root: ".",
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--host") {
      args.host = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (token === "--root") {
      args.root = argv[index + 1] ?? ".";
      index += 1;
      continue;
    }

    if (token === "--force") {
      args.force = true;
      continue;
    }

    if (token === "--help" || token === "-h") {
      args.help = true;
      continue;
    }
  }

  return args;
}

function printUsage() {
  process.stdout.write(`Usage: node ./tools/init/main.mjs [--host <path>] [--root <path>] [--force]

Current install support:
- Next.js App Router + TypeScript + Tailwind CSS

Detected but not installable yet:
- React Native / Expo
- Django
`);
}

function readRootPackageName(projectRoot) {
  const packageJsonPath = path.join(projectRoot, "package.json");
  if (!existsSync(packageJsonPath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(packageJsonPath, "utf8")).name ?? null;
  } catch {
    return null;
  }
}

function fail(message, code = 1) {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage();
  process.exit(0);
}

const projectRoot = path.resolve(process.cwd(), args.root);
const rootPackageName = readRootPackageName(projectRoot);
const rootPackageJsonPath = path.join(projectRoot, "package.json");

if (!existsSync(rootPackageJsonPath)) {
  fail("Agent Picker init needs a package.json at the project root so it can wire root scripts.");
}

if (rootPackageName === "agent-picker") {
  fail([
    "Agent Picker init is for host projects, not the shared engine repo itself.",
    "If you only want to smoke-test the shared repo, use:",
    "  pnpm install",
    "  pnpm run agent-pickerd:serve",
    "  pnpm run dev",
  ].join("\n"));
}

const detectedHosts = args.host
  ? [detectHostAtPath(projectRoot, path.resolve(projectRoot, args.host))]
  : scanHosts(projectRoot);

const supportedHosts = detectedHosts.filter((host) => host.status === "supported");

if (supportedHosts.length === 0) {
  const lines = [
    "Agent Picker could not find a supported host in this project.",
    "",
    "Detected hosts:",
    ...detectedHosts.map((host) => `- ${describeHost(host)}${host.reason ? `: ${host.reason}` : ""}`),
    "",
    "Currently installable:",
    "- Next.js App Router + TypeScript + Tailwind CSS",
    "",
    "Planned next:",
    "- React Native / Expo",
  ];
  fail(lines.join("\n"));
}

if (!args.host && supportedHosts.length > 1) {
  fail(
    [
      "Agent Picker found multiple supported hosts.",
      "Run init again with --host <path>.",
      "",
      ...supportedHosts.map((host) => `- ${describeHost(host)}`),
    ].join("\n"),
  );
}

const selectedHost = supportedHosts[0];
const packageManager = detectPackageManager(projectRoot);

if (selectedHost.kind !== "next-app-router") {
  fail(`Unsupported host kind for install: ${selectedHost.kind}`);
}

const result = installNextAppRouter({
  projectRoot,
  host: selectedHost,
  packageManager,
  force: args.force,
});

process.stdout.write([
  "Agent Picker installed successfully.",
  `- host: ${result.hostPath}`,
  `- route root: ${result.routeRoot}`,
  "",
  "Next steps:",
  "- add drafts under components/agent-picker/drafts",
  `- run ${formatSelfRunCommand(packageManager, "agent-pickerd:serve")}`,
  `- run ${formatSelfRunCommand(packageManager, "agent-picker:web:dev")}`,
].join("\n"));
