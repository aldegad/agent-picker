# Agent Picker

Agent Picker is a local visual workspace for reviewing UI drafts, arranging them on a board, capturing DOM selections from a running app, and sharing agent progress through a lightweight daemon.

It is designed for two modes:
- a standalone public repository with a bundled Next.js example host
- a vendored `vendor/agent-picker` install inside a real product codebase

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

The recommended install flow is to clone Agent Picker into your host project:

```bash
git clone https://github.com/aldegad/agent-picker.git vendor/agent-picker
pnpm install
node ./vendor/agent-picker/tools/init/main.mjs --root .
```

After init:

```bash
pnpm run agent-pickerd:serve
pnpm run agent-picker:web:dev
```

Detailed install notes: [docs/install-next-app-router.md](./docs/install-next-app-router.md)

## Repo Layout

- `web/`: shared Agent Picker UI, scene hooks, and devtools overlay
- `tools/agent-pickerd/`: local state daemon and CLI
- `tools/init/`: host installer for supported app types
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
- `pnpm run init`: run the installer from a host project root

## Docs

- [docs/install-next-app-router.md](./docs/install-next-app-router.md)
- [docs/maintainers.md](./docs/maintainers.md)
- [tools/agent-pickerd/README.md](./tools/agent-pickerd/README.md)

## License

[MIT](./LICENSE)
