import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, desc } from "drizzle-orm";
import { mentorChats } from "../db/schema";
import type { AuthEnv } from "../middleware/auth-required";
import { getChapterById, chapterReadmeUrl } from "@archlet/shared";

// BYOK passthrough chat route. Key is supplied in request body and forwarded to
// Anthropic Messages API. Server NEVER persists keys. Conversations history is
// saved to D1 per (user, diagram, chapter) tuple for resume across sessions.
//
// Phase 2 scope: non-streaming (fetch full response, return JSON). SSE streaming
// deferred to Phase 3 once base flow is verified.

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  ts: number;
  tokens?: number;
};

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-4-6";
const MAX_OUTPUT_TOKENS = 4096;
const MAX_HISTORY = 20; // truncate older messages above this

function nanoid() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 21);
}

async function fetchChapterMarkdown(chapterId: string): Promise<string | null> {
  const chapter = getChapterById(chapterId);
  if (!chapter) return null;
  try {
    const res = await fetch(chapterReadmeUrl(chapter));
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function buildSystemPrompt(chapterContext: string | null, diagramJson: unknown): string {
  const lines = [
    "You are a system-design mentor. You help the user learn architecture concepts.",
    "Be concise, technical, and cite specific parts of the provided chapter when relevant.",
    "If the user asks about something not in the chapter, say so explicitly.",
  ];
  if (chapterContext) {
    lines.push("\n=== Chapter Content ===\n", chapterContext);
  }
  if (diagramJson) {
    lines.push("\n=== User's Current Diagram (JSON) ===\n", JSON.stringify(diagramJson, null, 2));
  }
  return lines.join("\n");
}

const app = new Hono<AuthEnv>();

// POST /api/mentor/chat
// body: { byokKey, model?, diagramId?, chapterId?, diagram?, messages: [{role, content, ts}] }
// returns: { id, message: {role: "assistant", content, ts, tokens} }
app.post("/chat", async (c) => {
  const user = c.get("user");
  let body: {
    byokKey?: string;
    model?: string;
    diagramId?: string;
    chapterId?: string;
    diagram?: unknown;
    messages?: ChatMessage[];
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  if (!body.byokKey) return c.json({ error: "byokKey required" }, 400);
  if (!body.messages || !body.messages.length) return c.json({ error: "messages required" }, 400);

  // Build context
  const chapterMd = body.chapterId ? await fetchChapterMarkdown(body.chapterId) : null;
  const system = buildSystemPrompt(chapterMd, body.diagram);

  // Truncate history
  const history = body.messages.slice(-MAX_HISTORY);

  // Call Anthropic
  let upstream: Response;
  try {
    upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": body.byokKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: body.model ?? DEFAULT_MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        system,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
  } catch (err) {
    return c.json({ error: "Upstream fetch failed", detail: String(err) }, 502);
  }

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");
    return c.json({ error: "Upstream error", status: upstream.status, detail: errText }, upstream.status as 400 | 500);
  }

  const upstreamJson = await upstream.json() as {
    content: Array<{ type: string; text?: string }>;
    usage?: { input_tokens?: number; output_tokens?: number };
  };
  const text = upstreamJson.content?.filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n") ?? "";
  const tokensOut = upstreamJson.usage?.output_tokens;

  const now = Date.now();
  const assistantMsg: ChatMessage = {
    role: "assistant",
    content: text,
    ts: now,
    ...(tokensOut !== undefined ? { tokens: tokensOut } : {}),
  };

  // Persist conversation to D1
  const db = drizzle(c.env.DB);
  const fullThread = [...history, assistantMsg];
  const messagesJson = JSON.stringify(fullThread);

  // Find existing thread by (user, diagram?, chapter?) or create new
  const existing = await db
    .select()
    .from(mentorChats)
    .where(
      and(
        eq(mentorChats.userId, user.id),
        body.diagramId ? eq(mentorChats.diagramId, body.diagramId) : eq(mentorChats.diagramId, "" as never),
        body.chapterId ? eq(mentorChats.chapterId, body.chapterId) : eq(mentorChats.chapterId, "" as never),
      )
    )
    .limit(1);

  let chatId: string;
  if (existing[0]) {
    chatId = existing[0].id;
    await db.update(mentorChats).set({ messages: messagesJson, updatedAt: now }).where(eq(mentorChats.id, chatId));
  } else {
    chatId = nanoid();
    await db.insert(mentorChats).values({
      id: chatId,
      userId: user.id,
      diagramId: body.diagramId ?? null,
      chapterId: body.chapterId ?? null,
      messages: messagesJson,
      createdAt: now,
      updatedAt: now,
    });
  }

  return c.json({ id: chatId, message: assistantMsg });
});

// GET /api/mentor/history?diagramId=&chapterId= → restore thread
app.get("/history", async (c) => {
  const user = c.get("user");
  const diagramId = c.req.query("diagramId") ?? null;
  const chapterId = c.req.query("chapterId") ?? null;
  const db = drizzle(c.env.DB);

  const rows = await db
    .select()
    .from(mentorChats)
    .where(
      and(
        eq(mentorChats.userId, user.id),
        diagramId ? eq(mentorChats.diagramId, diagramId) : eq(mentorChats.diagramId, "" as never),
        chapterId ? eq(mentorChats.chapterId, chapterId) : eq(mentorChats.chapterId, "" as never),
      )
    )
    .orderBy(desc(mentorChats.updatedAt))
    .limit(1);

  if (!rows[0]) return c.json({ messages: [] });
  try {
    const messages = JSON.parse(rows[0].messages) as ChatMessage[];
    return c.json({ id: rows[0].id, messages, updatedAt: rows[0].updatedAt });
  } catch {
    return c.json({ messages: [] });
  }
});

// DELETE /api/mentor/thread/:id → clear thread
app.delete("/thread/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const db = drizzle(c.env.DB);
  await db.delete(mentorChats).where(and(eq(mentorChats.id, id), eq(mentorChats.userId, user.id)));
  return c.json({ ok: true });
});

export default app;
