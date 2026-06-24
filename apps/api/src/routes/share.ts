import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { diagrams, shareTokens } from "../db/schema";
import type { AuthEnv } from "../middleware/auth-required";
import {
  CreateShareRequestSchema,
  type ShareResponse,
} from "@archlet/shared";

function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 21) + "_";
}

const app = new Hono<AuthEnv>();

// POST /api/share — create share token for a diagram (owner only)
app.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = CreateShareRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid request" }, 400);

  const db = drizzle(c.env.DB);
  const user = c.get("user");
  const { diagramId, expiresIn } = parsed.data;

  const [diagram] = await db
    .select()
    .from(diagrams)
    .where(and(eq(diagrams.id, diagramId), eq(diagrams.ownerId, user.id)));
  if (!diagram) return c.json({ error: "Not found" }, 404);

  const now = Date.now();
  const token = generateToken();
  const expiresAt = expiresIn ? now + expiresIn * 1000 : null;

  await db.insert(shareTokens).values({
    token,
    diagramId,
    createdAt: now,
    expiresAt,
  });

  const webOrigin = c.env.WEB_ORIGIN ?? "https://archlet.app";
  const url = `${webOrigin}/s/${token}`;

  const response: ShareResponse = {
    token,
    url,
    diagramId,
    diagramName: diagram.name,
    createdAt: now,
    expiresAt,
  };

  return c.json(response, 201);
});

// GET /api/share — list user's share tokens with diagram names
app.get("/", async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get("user");

  const rows = await db
    .select({
      token: shareTokens.token,
      diagramId: shareTokens.diagramId,
      diagramName: diagrams.name,
      createdAt: shareTokens.createdAt,
      expiresAt: shareTokens.expiresAt,
    })
    .from(shareTokens)
    .innerJoin(diagrams, eq(shareTokens.diagramId, diagrams.id))
    .where(eq(diagrams.ownerId, user.id));

  const webOrigin = c.env.WEB_ORIGIN ?? "https://archlet.app";
  const result: ShareResponse[] = rows.map((r) => ({
    token: r.token,
    url: `${webOrigin}/s/${r.token}`,
    diagramId: r.diagramId,
    diagramName: r.diagramName,
    createdAt: r.createdAt,
    expiresAt: r.expiresAt,
  }));

  return c.json(result);
});

// DELETE /api/share/:token — revoke (owner only)
app.delete("/:token", async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get("user");
  const token = c.req.param("token");

  const [row] = await db
    .select({ diagramOwnerId: diagrams.ownerId })
    .from(shareTokens)
    .innerJoin(diagrams, eq(shareTokens.diagramId, diagrams.id))
    .where(eq(shareTokens.token, token));

  if (!row) return c.json({ error: "Not found" }, 404);
  if (row.diagramOwnerId !== user.id) return c.json({ error: "Forbidden" }, 403);

  await db.delete(shareTokens).where(eq(shareTokens.token, token));

  // Bust CF edge cache for the public diagram endpoint
  try {
    const origin = new URL(c.req.url).origin;
    const cacheUrl = `${origin}/api/public/diagram/${token}`;
    await caches.default.delete(new Request(cacheUrl));
  } catch {
    // caches.default not available in local dev — safe to ignore
  }

  return c.json({ ok: true });
});

export default app;
