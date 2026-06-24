import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, desc } from "drizzle-orm";
import { diagrams, projects } from "../db/schema";
import type { AuthEnv } from "../middleware/auth-required";
import {
  CreateDiagramRequestSchema,
  UpdateDiagramRequestSchema,
  RenameDiagramRequestSchema,
  SetEmbedRequestSchema,
  type DiagramResponse,
} from "@archlet/shared";

function nanoid() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 21);
}

const emptyLevelData = () => ({ nodes: [], edges: [] });

const defaultLevels = () => ({
  high: emptyLevelData(),
  mid: emptyLevelData(),
  low: emptyLevelData(),
});

function rowToResponse(row: typeof diagrams.$inferSelect): DiagramResponse {
  return {
    id: row.id,
    projectId: row.projectId,
    ownerId: row.ownerId,
    name: row.name,
    levelData: JSON.parse(row.levelData),
    activeLevel: row.activeLevel as DiagramResponse["activeLevel"],
    publicEmbed: row.publicEmbed === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const app = new Hono<AuthEnv>();

// GET /api/diagrams?projectId= — list diagrams in project (owner-of-project check)
app.get("/", async (c) => {
  const projectId = c.req.query("projectId");
  if (!projectId) return c.json({ error: "projectId required" }, 400);

  const db = drizzle(c.env.DB);
  const user = c.get("user");

  // verify project ownership
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, user.id)));
  if (!project) return c.json({ error: "Not found" }, 404);

  const rows = await db
    .select()
    .from(diagrams)
    .where(eq(diagrams.projectId, projectId))
    .orderBy(desc(diagrams.updatedAt));

  return c.json(rows.map(rowToResponse));
});

// GET /api/diagrams/:id — load full diagram (owner check)
app.get("/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get("user");
  const id = c.req.param("id");

  const [row] = await db
    .select()
    .from(diagrams)
    .where(and(eq(diagrams.id, id), eq(diagrams.ownerId, user.id)));
  if (!row) return c.json({ error: "Not found" }, 404);

  return c.json(rowToResponse(row));
});

// POST /api/diagrams — create diagram
app.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = CreateDiagramRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid request" }, 400);

  const db = drizzle(c.env.DB);
  const user = c.get("user");
  const { projectId, name, levelData } = parsed.data;

  // verify project ownership
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, user.id)));
  if (!project) return c.json({ error: "Not found" }, 404);

  const now = Date.now();
  const id = nanoid();
  const levels = levelData ?? defaultLevels();

  await db.insert(diagrams).values({
    id,
    projectId,
    ownerId: user.id,
    name: name ?? "Untitled diagram",
    levelData: JSON.stringify(levels),
    activeLevel: "high",
    createdAt: now,
    updatedAt: now,
  });

  const insertedRows = await db.select().from(diagrams).where(eq(diagrams.id, id));
  const inserted = insertedRows[0];
  if (!inserted) return c.json({ error: "Insert failed" }, 500);
  return c.json(rowToResponse(inserted), 201);
});

// PUT /api/diagrams/:id — upsert with optimistic concurrency
app.put("/:id", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = UpdateDiagramRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid request" }, 400);

  const db = drizzle(c.env.DB);
  const user = c.get("user");
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(diagrams)
    .where(and(eq(diagrams.id, id), eq(diagrams.ownerId, user.id)));
  if (!existing) return c.json({ error: "Not found" }, 404);

  if (parsed.data.updatedAt < existing.updatedAt) {
    return c.json({ error: "Conflict", serverUpdatedAt: existing.updatedAt }, 409);
  }

  const now = Date.now();
  const updates: Partial<typeof diagrams.$inferInsert> = { updatedAt: now };

  if (parsed.data.activeLevel !== undefined) updates.activeLevel = parsed.data.activeLevel;
  if (parsed.data.levelData !== undefined) {
    updates.levelData = JSON.stringify(parsed.data.levelData);
  }

  await db.update(diagrams).set(updates).where(eq(diagrams.id, id));

  const updatedRows = await db.select().from(diagrams).where(eq(diagrams.id, id));
  const updated = updatedRows[0];
  if (!updated) return c.json({ error: "Update failed" }, 500);
  return c.json(rowToResponse(updated));
});

// PATCH /api/diagrams/:id — rename only (no concurrency check)
app.patch("/:id", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = RenameDiagramRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid request" }, 400);

  const db = drizzle(c.env.DB);
  const user = c.get("user");
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(diagrams)
    .where(and(eq(diagrams.id, id), eq(diagrams.ownerId, user.id)));
  if (!existing) return c.json({ error: "Not found" }, 404);

  const now = Date.now();
  await db
    .update(diagrams)
    .set({ name: parsed.data.name, updatedAt: now })
    .where(eq(diagrams.id, id));

  const updatedRows = await db.select().from(diagrams).where(eq(diagrams.id, id));
  const updated = updatedRows[0];
  if (!updated) return c.json({ error: "Update failed" }, 500);
  return c.json(rowToResponse(updated));
});

// DELETE /api/diagrams/:id — delete (owner check)
app.delete("/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get("user");
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(diagrams)
    .where(and(eq(diagrams.id, id), eq(diagrams.ownerId, user.id)));
  if (!existing) return c.json({ error: "Not found" }, 404);

  await db.delete(diagrams).where(eq(diagrams.id, id));
  return c.json({ ok: true });
});

// PATCH /api/diagrams/:id/embed — toggle public embed (owner only)
app.patch("/:id/embed", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = SetEmbedRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid request" }, 400);

  const db = drizzle(c.env.DB);
  const user = c.get("user");
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(diagrams)
    .where(and(eq(diagrams.id, id), eq(diagrams.ownerId, user.id)));
  if (!existing) return c.json({ error: "Not found" }, 404);

  await db
    .update(diagrams)
    .set({ publicEmbed: parsed.data.enabled ? 1 : 0 })
    .where(eq(diagrams.id, id));

  // Bust CF edge cache for the public embed endpoint
  try {
    const origin = new URL(c.req.url).origin;
    await caches.default.delete(new Request(`${origin}/api/public/embed/${id}`));
  } catch {
    // caches.default not available in local dev — safe to ignore
  }

  return c.json({ ok: true, publicEmbed: parsed.data.enabled });
});

export default app;
