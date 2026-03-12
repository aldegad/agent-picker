# Install Into a Next.js App Router Host

Agent Picker's preferred integration style is now package-oriented:

- `@agent-picker/react` for the provider and workspace page
- `@agent-picker/next` for the selection route
- `@agent-picker/server` for `agent-pickerd`

## Minimal Host Shape

Your host needs four things:

1. Project item sources
2. `AgentPickerProvider` near the app shell
3. A route that renders `AgentPickerWorkspace`
4. A dev selection route export

## Item Sources

Keep your project-specific items under `src/lib/agent-picker/project-items.tsx` or the equivalent path under your alias root:

```tsx
import type { AgentPickerComponentItem } from "@agent-picker/react/types";

export const projectAgentPickerItems: AgentPickerComponentItem[] = [];
```

## Provider

Wrap your app shell with the provider:

```tsx
"use client";

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

## Playground Route

```tsx
import { AgentPickerWorkspace } from "@agent-picker/react";

export default function PlaygroundPage() {
  return <AgentPickerWorkspace />;
}
```

## Selection Route

Create `app/api/devtools/selection/route.ts` or `src/app/api/devtools/selection/route.ts`:

```ts
export { dynamic, GET, POST } from "@agent-picker/next";
```

## Daemon

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

## Legacy Installer

`tools/init/main.mjs` still exists for vendored installs and can bootstrap the older wrapper-based layout. It is now considered a compatibility path rather than the preferred integration model.

## Notes

- If your team wants a tracked git dependency, a submodule is safer than pushing to a public remote from a private host repo.
- If you prefer a vendored copy without submodules, clone the repo into `vendor/agent-picker` and update it intentionally.
