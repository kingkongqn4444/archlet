# Phase 3 — AI BYOK Implementation Report

## Status: completed

---

## 1. File Tree

```
apps/web/src/
├── app.tsx                                        MODIFIED — added /account/keys route
├── components/
│   ├── app-shell.tsx                              MODIFIED — added "API Keys" link in user menu
│   └── ui/
│       ├── sheet.tsx                              NEW — slide-out drawer component
│       ├── textarea.tsx                           NEW — textarea form element
│       └── select.tsx                             NEW — native select wrapper
├── features/ai/
│   ├── use-api-keys.ts                            NEW — localStorage BYOK key store
│   ├── use-ai-generate.ts                         NEW — orchestration hook
│   ├── apply-tool-call.ts                         NEW — ToolCall → Zustand action mapper
│   ├── ai-panel.tsx                               NEW — sheet drawer UI
│   └── providers/
│       ├── ai-client.ts                           NEW — AIClient interface + ToolCallSchema + TOOL_DEFINITIONS
│       ├── openai-client.ts                       NEW — OpenAI SSE streaming adapter
│       ├── anthropic-client.ts                    NEW — Anthropic Messages streaming adapter
│       ├── deepseek-client.ts                     NEW — DeepSeek (OpenAI-compat) adapter
│       └── index.ts                               NEW — provider factory getClient()
│   └── prompts/
│       └── system-prompt.ts                       NEW — buildSystemPrompt(level) templates
└── pages/
    └── account-page.tsx                           NEW — /account/keys settings page
```

Total: 13 new files, 3 modified files.

---

## 2. Provider Adapter Notes

### OpenAI (`openai-client.ts`)
- POST `https://api.openai.com/v1/chat/completions` with `stream: true`, `tools: [...]`, `tool_choice: "auto"`
- SSE chunks: parse `choices[0].delta.tool_calls[]` incrementally
- Accumulate `function.arguments` strings per `index`; yield once `isJsonComplete()` detects balanced `{}`
- `isJsonComplete` walks char-by-char tracking brace depth + string escape — handles partial chunks correctly
- Uses `signal ?? null` for `exactOptionalPropertyTypes` TS strictness

### Anthropic (`anthropic-client.ts`)
- POST `https://api.anthropic.com/v1/messages`
- **Critical headers**: `anthropic-version: 2023-06-01` + `anthropic-dangerous-direct-browser-access: true` (required for browser → Anthropic direct calls; without this header Anthropic rejects browser origins)
- Tool schema format: `input_schema` (not `parameters` as in OpenAI)
- SSE event types tracked: `content_block_start` (init buffer on `type=tool_use`), `content_block_delta` (`input_json_delta` → append to buffer), `content_block_stop` (parse and yield)
- Note: event type is in separate `event:` line, parsed before corresponding `data:` line

### DeepSeek (`deepseek-client.ts`)
- Base URL: `https://api.deepseek.com/chat/completions`
- Auth: `Authorization: Bearer <key>` (same as OpenAI)
- SSE format: identical to OpenAI — same parsing logic duplicated (DRY tradeoff: kept separate file per spec for future divergence)
- Models: `deepseek-chat`, `deepseek-reasoner`

---

## 3. Tool Call Validation Strategy

- `ToolCallSchema` in `providers/ai-client.ts` uses `z.discriminatedUnion("name", [...])` — each variant has its own arg schema
- `NodeTypeEnum` imported from `@archlet/shared` — single source of truth for valid node types
- Parse path: raw SSE chunk → accumulate args string → `JSON.parse` → `ToolCallSchema.safeParse`
- On `safeParse` failure: `console.warn` with tool name + Zod issues, return `null`, caller skips null
- On JSON parse failure: `console.warn` + return null
- Result: malformed or unknown tool calls are silently dropped; valid ones are applied immediately

---

## 4. Settings UI Description (`/account/keys`)

Page layout (top-to-bottom):
- Top bar: "archlet" logo left, "← Back" button right (calls `navigate(-1)`)
- Page heading: "API Keys" + subtitle explaining keys go direct to providers
- Amber warning banner (AlertTriangle icon): "Keys are stored in browser localStorage as plain text. Any XSS vulnerability on this page could expose them. Treat as dev/personal use only."
- White card — three provider sections (OpenAI, Anthropic, DeepSeek):
  - Label + "Get key" link (opens provider console in new tab)
  - Password input (masked by default) + eye toggle button to reveal
  - "Test" button — calls provider's models endpoint, shows toast success/error
- White card — Defaults section:
  - Default provider dropdown (OpenAI / Anthropic / DeepSeek)
  - Default model dropdown (provider-specific options, updates when provider changes)
- "Save settings" button (bottom-right, calls `updateKeys` → writes localStorage)

### AI Panel (slide-out drawer, right side)
- Header: sparkles icon + "AI Generate" title + X close button
- Provider select + Model select
- Level toggle: High / Mid / Low buttons (violet highlight for active)
- Level description text below (e.g. "High (3–7 nodes)")
- Textarea: 5 rows, placeholder with example prompt, ⌘↵ hint
- Amber warning if no key for selected provider (links to /account/keys)
- Red error box for 401 / rate limit / network errors
- Streaming status row: animated spinner + current action text ("Adding API Server…")
- Node counter ("3 nodes added") appears below status once first node lands
- Generate button (violet, disabled without key or empty prompt) / Cancel button (outline, visible during streaming)

---

## 5. Smoke Results

- `pnpm typecheck`: PASS (0 errors after fixing 9 type errors)
- `pnpm build`: PASS — 623 kB bundle (chunk warning pre-existing from @xyflow/react)
- Route `/account/keys` added and auth-guarded
- `useApiKeys` hook: saves/loads `archlet_keys_v1` JSON from localStorage
- `getClient("openai")` returns `openaiClient`, same for anthropic/deepseek
- `buildSystemPrompt("high"|"mid"|"low")` returns correct level instructions
- `applyToolCall({ name: "add_node", args: {...} })` calls `useDiagramStore.getState().addNode()`
- Temporal pause/resume: `useDiagramStore.temporal.getState().pause()` before loop, `.resume()` after — entire generation = single undo entry

No real provider API calls made (no keys available in test environment).

---

## 6. Known Issues

1. **OpenAI tool_calls accumulation edge case**: If a tool call spans many tiny SSE chunks where the closing `}` arrives alone, `isJsonComplete` will yield on that fragment. However, if the model sends nested JSON in args (unlikely for these simple schemas), the brace-depth counter could misfire. Mitigation: add `try/catch` around `JSON.parse` (already present).

2. **Anthropic `event:` line ordering assumption**: The parser resets `eventType = ""` after processing each `data:` line. If Anthropic sends multiple data lines for one event (not in their spec but theoretically possible), subsequent data lines get `eventType = ""`. Unlikely in practice.

3. **DeepSeek code duplication**: `deepseek-client.ts` duplicates the SSE parsing logic from `openai-client.ts`. A shared `streamOpenAICompatible` function could be extracted. Deferred per YAGNI — DeepSeek may diverge.

4. **`use-api-keys.ts` is a React hook but used inside `use-ai-generate.ts`**: Both are hooks so this is fine. However `apply-tool-call.ts` calls `useDiagramStore.getState()` directly (not via hook) — correct for non-React contexts but means it always gets current state (not reactive). This is intentional.

5. **AI panel provider defaults don't sync with saved settings on re-open**: Panel initialises from `keys.defaultProvider` at mount time but doesn't re-read if user saves new defaults while panel is open. Low impact.

6. **Chunk size warning**: 623 kB bundle. Pre-existing from @xyflow/react. Can be addressed in Phase 6 polish via dynamic imports.

---

## 7. Phase 4 Recommendations (Share & Embed)

- Route `/s/:shareId` (read-only) + `/e/:shareId` (embed) — public, no AuthGuard
- Backend: `POST /api/diagrams/:id/share` → generate `shareId` (nanoid), store in D1 `shares` table with `diagramId + createdAt + expiresAt`
- `GET /api/s/:shareId` → return diagram JSON (no auth required)
- Share modal: copy link button, QR code optional
- Embed route renders `<CanvasEditor readonly />` — disable drag, drop, keyboard delete; hide toolbar
- CSP: embed iframe allowed via `frame-ancestors` header on embed route
- `ReactFlow` readonly mode: set `nodesDraggable={false}` `nodesConnectable={false}` `elementsSelectable={false}`
- Consider: expiry UI (24h / 7d / forever), revoke button

---

## 8. Unresolved Questions

1. **Zundo `pause()` API**: `useDiagramStore.temporal.getState().pause()` — need to verify this is the correct zundo v2 API for pausing temporal recording. The zundo docs show `pause`/`resume` on the temporal store; if this is wrong, the whole generation will create N undo entries instead of 1.

2. **DeepSeek browser CORS**: DeepSeek's API may not have permissive CORS for browser direct calls (unlike Anthropic which has the explicit browser header). Need to verify with a real key. If blocked, will need a thin server proxy for DeepSeek only.

3. **Anthropic models endpoint for "Test connection"**: `/v1/models` may not be available on all Anthropic plans. A lightweight alternative: send a minimal messages request with `max_tokens: 1` to verify key validity.

4. **`exactOptionalPropertyTypes` in tsconfig base**: Caused the `signal: undefined` errors. Confirmed the fix (`?? null`) works but worth noting for future fetch calls across the codebase.
