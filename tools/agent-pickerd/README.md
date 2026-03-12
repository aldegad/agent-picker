# agent-pickerd

`agent-pickerd` is Agent Picker's local state daemon.

It is responsible for:
- reading and writing `.agent-picker/scene.json`
- validating scene payloads
- watching files and publishing SSE updates
- exposing selection and agent note endpoints
- providing a CLI for agents and local tooling

The UI reads and writes the scene through the daemon's HTTP/SSE endpoints.
Agents update the same source of truth through the CLI or the shared state files.

## Running the daemon

In the standalone repository:

```bash
pnpm run agent-pickerd:serve
```

That serves the bundled example host at `./example/next-host`.

Direct CLI usage from the standalone repository:

```bash
pnpm exec agent-pickerd serve --root ./example/next-host
```

In an installed host project, add a root script or use the local package binary directly.

`package.json`:

```json
{
  "scripts": {
    "agent-pickerd:serve": "agent-pickerd serve --root ."
  }
}
```

Then run:

```bash
npm run agent-pickerd:serve
```

Direct CLI usage from an installed host:

```bash
npx agent-pickerd serve --root .
```

The default address is `http://127.0.0.1:4312`.
State files live under the selected host root's `.agent-picker/` directory.
For installed hosts, treat that directory as local state and add `.agent-picker/` to `.gitignore`.

## HTTP API

- `GET /health`
- `GET /scene`
- `GET /agent-note`
- `GET /events`
- `PUT /scene`
- `POST /scene/nodes`
- `PATCH /scene/nodes/:id`
- `DELETE /scene/nodes/:id`
- `GET /dev-selection`
- `POST /dev-selection`
- `DELETE /dev-selection`
- `POST /agent-note`
- `DELETE /agent-note`

## CLI examples

Standalone repository:

```bash
pnpm exec agent-pickerd get-scene --root ./example/next-host
pnpm exec agent-pickerd get-selection --root ./example/next-host
pnpm exec agent-pickerd get-agent-note --root ./example/next-host
pnpm exec agent-pickerd set-agent-note --root ./example/next-host --author codex --status fixed --message "Updated the selected element."
pnpm exec agent-pickerd add-node --root ./example/next-host --id node-welcome-01 --item-id draft-cards-welcomecard --title "Welcome Card" --viewport original --x 120 --y 80 --z-index 1
```

Installed host project:

```bash
npx agent-pickerd get-scene --root .
npx agent-pickerd get-selection --root .
npx agent-pickerd get-agent-note --root .
npx agent-pickerd set-agent-note --root . --author codex --status fixed --message "Updated the selected element."
```
