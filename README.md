# Agent Picker

Agent Picker is a local visual workspace for reviewing UI drafts, arranging them on a board, capturing DOM selections from a running app, and sharing agent progress through a lightweight daemon.

It is organized as a small package workspace:
- `@agent-picker/react`: provider, workspace UI, registry helpers
- `@agent-picker/next`: Next.js route exports for selection capture
- `@agent-picker/server`: `agent-pickerd` CLI and daemon entrypoint

The repository ships with a bundled Next.js example host and can also be vendored into a real product codebase.

## Quick Start

Clone the repository and install dependencies:

```bash
pnpm install
```

Run the example host in one terminal:

```bash
pnpm run dev
```

Run the local daemon in another terminal:

```bash
pnpm run agent-pickerd:serve
```

Then open [http://127.0.0.1:3000/playground](http://127.0.0.1:3000/playground).

The example host stores local state in `example/next-host/.agent-picker/`.

## Install Into an Existing Next.js Host

The preferred integration model is:

- add `AgentPickerProvider` near your app shell
- render `AgentPickerWorkspace` on your playground route
- re-export the selection route from `@agent-picker/next`
- run `agent-pickerd`

The bundled example host uses exactly that shape.

```tsx
import { AgentPickerProjectProvider } from "@agent-picker/react";
import { generatedAgentPickerDraftItems } from "@/lib/agent-picker/generated-drafts";
import { generatedAgentPickerPageImportItems } from "@/lib/agent-picker/generated-page-imports";
import { projectAgentPickerItems } from "@/lib/agent-picker/project-items";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AgentPickerProjectProvider
      draftItems={generatedAgentPickerDraftItems}
      projectItems={projectAgentPickerItems}
      pageImportItems={generatedAgentPickerPageImportItems}
      showDevtoolsInDevelopment
    >
      {children}
    </AgentPickerProjectProvider>
  );
}
```

```tsx
import { AgentPickerWorkspace } from "@agent-picker/react";

export default function PlaygroundPage() {
  return <AgentPickerWorkspace />;
}
```

```ts
export { dynamic, GET, POST } from "@agent-picker/next";
```

If you want to vendor the repo into a host project, clone it into `vendor/agent-picker` and point your host at the package entrypoints there:

```bash
git clone https://github.com/aldegad/agent-picker.git vendor/agent-picker
pnpm install
pnpm run agent-pickerd:serve
```

Detailed integration notes: [docs/install-next-app-router.md](./docs/install-next-app-router.md)

## Repo Layout

- `packages/react/`: provider, workspace component, and registry helpers
- `packages/next/`: Next.js selection route exports
- `packages/server/`: `agent-pickerd` package entrypoints
- `web/`: shared Agent Picker UI, scene hooks, and devtools overlay
- `tools/agent-pickerd/`: local state daemon and CLI
- `tools/init/`: legacy vendored installer for supported app types
- `scripts/`: draft generation, dev orchestration, and QA helpers
- `example/next-host/`: smoke-test host app for the standalone repository

## Agent Workflow

Agent Picker has a shared selection and note model so multiple coding agents can coordinate.

- latest selection: `pnpm run agent-pickerd:get-selection`
- latest note: `pnpm run agent-pickerd:get-agent-note`
- update note: `pnpm run agent-pickerd:set-agent-note -- --author codex --status in_progress --message "..."`

Agent-specific guidance lives here:

- [AGENTS.md](./AGENTS.md)
- [CLAUDE.md](./CLAUDE.md)
- [GEMINI.md](./GEMINI.md)

## Common Commands

- `pnpm run dev`: start the bundled example host
- `pnpm run build`: build the bundled example host
- `pnpm run lint`: typecheck the example host
- `pnpm run test`: run daemon unit tests
- `pnpm run qa:agent-picker`: capture smoke-test screenshots with Playwright
- `pnpm run init`: run the legacy vendored installer from a host project root

## Docs

- [docs/install-next-app-router.md](./docs/install-next-app-router.md)
- [docs/maintainers.md](./docs/maintainers.md)
- [tools/agent-pickerd/README.md](./tools/agent-pickerd/README.md)

## License

[MIT](./LICENSE)
