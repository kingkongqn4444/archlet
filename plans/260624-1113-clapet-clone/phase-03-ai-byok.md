# Phase 3 — AI BYOK (Bring Your Own Key)

## Context Links
- Brainstorm § 6 (AI flow)
- OpenAI Responses API, Anthropic Messages API, DeepSeek API

## Overview
- Priority: P0 (USP của app)
- Status: pending
- Depends: Phase 1 + Phase 2
- Client gọi thẳng provider AI bằng key user, stream tool calls, apply incremental vào canvas.

## Key Insights
- Mirror clapet: `connect-src` web allow `api.openai.com`, `api.anthropic.com`, `api.deepseek.com` — server KHÔNG proxy.
- Tool-use schema khác nhau 3 providers → abstract `AIClient` interface với adapters.
- Streaming SSE → parse incrementally, apply mỗi tool call ngay (user thấy diagram dựng từng node).
- Abstraction level → đổi system prompt: High = 3-7 nodes, Mid = 8-15, Low = 16+.
- API key plain text trong localStorage v1 — flag rõ XSS risk cho user.

## Requirements
**Functional:**
- Settings: nhập key OpenAI/Anthropic/DeepSeek + chọn default provider + model
- AI panel: prompt input + level selector (High/Mid/Low) + Submit
- Stream tool calls: `add_node`, `add_edge`, `update_node`, `remove_node`, `remove_edge`
- Apply lên Zustand store ngay khi nhận
- Cancel mid-stream (AbortController)
- Show streaming status (typing indicator + current action)

**Non-functional:**
- First node visible < 3s từ submit
- Token budget cảnh báo trong UI

## Architecture
```
apps/web/src/features/ai/
  ├─ ai-panel.tsx              UI panel
  ├─ api-key-dialog.tsx        Nhập key + provider selection
  ├─ providers/
  │   ├─ ai-client.ts          interface AIClient { stream(...): AsyncIterable<ToolCall> }
  │   ├─ openai-client.ts      OpenAI adapter
  │   ├─ anthropic-client.ts   Anthropic adapter
  │   └─ deepseek-client.ts    DeepSeek adapter
  ├─ prompts/
  │   ├─ system-prompt.ts      Template theo level + node type catalog
  │   └─ examples.ts           Few-shot examples
  ├─ tool-schema.ts            JSON schema cho tool calls (Zod)
  ├─ apply-tool-call.ts        Map ToolCall → Zustand actions
  └─ use-ai-generate.ts        React hook orchestrate
```

## Tool Schema (chung)
```typescript
type ToolCall =
  | { name: 'add_node', args: { id, type, label, description?, x, y } }
  | { name: 'add_edge', args: { id, source, target, label? } }
  | { name: 'update_node', args: { id, label?, description? } }
  | { name: 'remove_node', args: { id } }
  | { name: 'remove_edge', args: { id } };
```

## System Prompt skeleton
```
You are an expert system architect. Given a description, produce a system architecture diagram by calling tools.

Available node types: User, API, Database, Cache, Queue, Storage, CDN, LoadBalancer, Worker, External.

Layout: place nodes in logical flow, x ∈ [0, 1200], y ∈ [0, 800]. Spacing >= 200px.

Abstraction level: {HIGH|MID|LOW}
  HIGH: 3-7 nodes, only critical components, no sub-services
  MID:  8-15 nodes, include caches, queues, separation by concern
  LOW:  16+ nodes, granular services, redundancy, sub-components

Output ONLY tool calls. No prose.
```

## Implementation Steps
1. **Settings page** `/account/keys`: form nhập 3 keys + default provider/model dropdown. Save localStorage `archlet_keys_v1`.
2. **AIClient interface** + 3 adapter classes. Mỗi adapter: `async *stream(prompt, level, signal): AsyncIterable<ToolCall>`.
3. **OpenAI adapter**: dùng `/v1/chat/completions` với `tools: [...]`, `stream: true`. Parse `tool_calls` delta SSE.
4. **Anthropic adapter**: `/v1/messages` với `tools: [...]`, `stream: true`. Parse `content_block_start` của type `tool_use`, accumulate `input_json_delta`.
5. **DeepSeek adapter**: chuẩn OpenAI-compatible → reuse OpenAI adapter với khác `baseURL`.
6. **Tool schema validation**: parse từng tool call qua Zod, skip invalid.
7. **apply-tool-call.ts**: nhận ToolCall + Zustand store ref, call action tương ứng. Wrap trong `transient` (không record vào undo cho mỗi step — chỉ 1 undo entry cho cả lần generate).
8. **AI panel UI**: textarea prompt, level radio, "Generate" button. Disabled nếu không có key matching provider. Cancel button khi streaming.
9. **Streaming status**: hiện current tool đang execute ("Adding API Server...") + node count.
10. **Error UX**: 401 → "Invalid API key", quota → "Provider quota exceeded", network → retry button.
11. **Token usage**: nếu provider trả total_tokens, hiển thị `1.2k tokens, ~$0.003 ước tính`.

## Todo List
- [ ] Settings page nhập API keys + default provider
- [ ] localStorage save/load keys với versioned schema
- [ ] AIClient interface + tool schema
- [ ] OpenAI adapter (streaming tool calls)
- [ ] Anthropic adapter (streaming tool calls)
- [ ] DeepSeek adapter (reuse OpenAI)
- [ ] apply-tool-call: ToolCall → Zustand actions
- [ ] AI panel UI (prompt, level, generate, cancel)
- [ ] Streaming status indicator
- [ ] System prompt templates per level
- [ ] Error states (401, quota, network)
- [ ] Smoke test: prompt "Design Twitter clone" tạo diagram đầy đủ

## Success Criteria
- 3 provider chạy được với key thật của user
- "Design Instagram-like service" → 10+ nodes, edges, labels hợp lý trong < 30s
- Cancel mid-stream dừng ngay, state diagram giữ partial
- Đổi level mid → low → re-generate cho diagram chi tiết hơn

## Risk Assessment
| Risk | Likelihood | Mitigation |
|---|---|---|
| API schema khác nhau giữa 3 providers | High | Adapter pattern, type-safe Zod, integration test per provider |
| Tool call JSON malformed | Med | Zod validate, skip invalid, log Sentry |
| Streaming hang | Med | AbortController timeout 60s |
| User leak key khi share screen | High | Mask key trong UI (••••), warn trong settings |

## Security Considerations
- **CRITICAL: localStorage XSS risk** — flag rõ trong settings: "Key plain text trong browser; XSS = leak. v2 sẽ encrypt server-side."
- CSP strict — no inline scripts, no untrusted iframes
- Không log key trong Sentry/PostHog (filter trong `beforeSend`)
- Không gửi key về backend của mình — chỉ tới provider

## Next Steps
→ Phase 4: share + embed diagram
