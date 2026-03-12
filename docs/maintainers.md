# Maintainer Notes

## Public Repo Safety

Agent Picker is meant to be published from its own repository root. Avoid pushing to the public repository from an unrelated private host repository root.

Safer options:

- work directly in the standalone `agent-picker` clone
- keep a dedicated second clone for the public repo
- export only the Agent Picker subtree when syncing from a host repo

## If You Sync From A Host Repo

Only export the Agent Picker subtree, never the host repository `main` branch.

Example from a host repository:

```bash
git subtree split --prefix <path-to-agent-picker-in-your-host-repo> -b aldegad/agent-picker-export
git push public-agent-picker aldegad/agent-picker-export:main
```

Before any public push, verify:

```bash
git remote -v
git branch --show-current
git log --oneline --decorate -n 5
```

## Release Checklist

- run `pnpm install`
- run `pnpm run lint`
- run `pnpm run test`
- run `pnpm run build`
- run `pnpm run qa:agent-picker` if UI behavior changed
- review `example/next-host/.agent-picker/scene.json` and generated files
- confirm `.github/workflows/secret-scan.yml` is still present

## Example Host Boundaries

`example/next-host/` is a smoke-test consumer of the shared engine. Keep it representative, but do not bake example-only assumptions back into `web/`, `tools/`, or `scripts/` unless they are intentional shared behavior.
