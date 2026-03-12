# Install Into a Next.js App Router Host

Agent Picker currently ships an installer for Next.js App Router hosts that use TypeScript and Tailwind CSS.

## Recommended Flow

From your host project root:

```bash
git clone https://github.com/aldegad/agent-picker.git vendor/agent-picker
pnpm install
node ./vendor/agent-picker/tools/init/main.mjs --root .
```

If your host app is not at the project root, point init at it explicitly:

```bash
node ./vendor/agent-picker/tools/init/main.mjs --root . --host apps/web
```

## What Init Adds

The installer wires Agent Picker into your host by:

- creating `components/agent-picker/AgentPickerApp.tsx`
- creating `components/devtools/AgentDomPicker.tsx`
- creating `app/playground/page.tsx` or `src/app/playground/page.tsx`
- adding the dev selection API route
- creating `lib/agent-picker/*` registry files
- seeding `.agent-picker/scene.json`, `.agent-picker/page-imports.json`, and `.agent-picker/host.json`
- updating your host and project root scripts

## Daily Commands

From the host project root:

```bash
pnpm run agent-pickerd:serve
pnpm run agent-picker:web:dev
```

Useful agent commands:

```bash
pnpm run agent-pickerd:get-selection
pnpm run agent-pickerd:get-agent-note
pnpm run agent-pickerd:set-agent-note -- --author codex --status in_progress --message "Investigating the selected UI."
```

## Draft Sources

Add draft components and assets under:

```text
src/components/agent-picker/drafts
```

Or, if your alias root is the project root:

```text
components/agent-picker/drafts
```

Agent Picker generates the draft registry and mirrored public assets during `predev` and `prebuild`.

## Notes

- The current installer targets host projects. Do not run it from the standalone Agent Picker repository root.
- If your team wants a tracked git dependency, a submodule is safer than pushing to a public remote from a private host repo.
- If you prefer a vendored copy without submodules, clone the repo into `vendor/agent-picker` and update it intentionally.
