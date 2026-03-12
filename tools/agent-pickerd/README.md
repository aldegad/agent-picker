# agent-pickerd

`agent-pickerd`는 Agent Picker의 로컬 상태 서버입니다.

주요 역할:
- `.agent-picker/scene.json` 기반 scene 읽기/쓰기
- scene validation
- file watch + SSE publish
- selection / agent note API 제공
- CLI 명령 제공

UI는 이 daemon의 HTTP/SSE endpoint를 통해 scene을 읽고 저장합니다.
에이전트는 CLI 또는 같은 상태 파일을 통해 동일한 source of truth를 수정합니다.

## 실행

루트에서:

```bash
pnpm run agent-pickerd:serve
```

또는 Node만 바로 실행:

```bash
node apps/web/src/vendor/agent-picker/tools/agent-pickerd/main.mjs serve --root .
```

기본 주소는 `http://127.0.0.1:4312`입니다.
상태 파일은 `.agent-picker/`에 저장됩니다.

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

## CLI 예시

```bash
node apps/web/src/vendor/agent-picker/tools/agent-pickerd/main.mjs get-scene --root .
node apps/web/src/vendor/agent-picker/tools/agent-pickerd/main.mjs get-selection --root .
node apps/web/src/vendor/agent-picker/tools/agent-pickerd/main.mjs get-agent-note --root .
node apps/web/src/vendor/agent-picker/tools/agent-pickerd/main.mjs set-agent-note --root . --author codex --status fixed --message "Updated the selected element."
node apps/web/src/vendor/agent-picker/tools/agent-pickerd/main.mjs add-node --root . --id node-logo-01 --item-id draft-logo-01 --title "Logo 01" --viewport original --x 120 --y 80 --z-index 1
node apps/web/src/vendor/agent-picker/tools/agent-pickerd/main.mjs move-node --root . --id node-logo-01 --x 360 --y 160
node apps/web/src/vendor/agent-picker/tools/agent-pickerd/main.mjs remove-node --root . --id node-logo-01
```
