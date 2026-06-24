import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, desc } from "drizzle-orm";
import { projects } from "../db/schema";
import type { AuthEnv } from "../middleware/auth-required";
import { CreateProjectRequestSchema, UpdateProjectRequestSchema } from "@archlet/shared";

function nanoid() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 21);
}

const app = new Hono<AuthEnv>();

// GET /api/projects — list caller's projects
app.get("/", async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get("user");
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.ownerId, user.id))
    .orderBy(desc(projects.updatedAt));
  return c.json(rows);
});

// POST /api/projects — create project
app.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = CreateProjectRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid request" }, 400);

  const db = drizzle(c.env.DB);
  const user = c.get("user");
  const now = Date.now();
  const id = nanoid();

  await db.insert(projects).values({
    id,
    ownerId: user.id,
    name: parsed.data.name,
    createdAt: now,
    updatedAt: now,
  });

  const insertedRows = await db.select().from(projects).where(eq(projects.id, id));
  const inserted = insertedRows[0];
  if (!inserted) return c.json({ error: "Insert failed" }, 500);
  return c.json(inserted, 201);
});

// PATCH /api/projects/:id — rename
app.patch("/:id", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = UpdateProjectRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid request" }, 400);

  const db = drizzle(c.env.DB);
  const user = c.get("user");
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.ownerId, user.id)));
  if (!existing) return c.json({ error: "Not found" }, 404);

  const now = Date.now();
  await db
    .update(projects)
    .set({ name: parsed.data.name, updatedAt: now })
    .where(eq(projects.id, id));

  const updatedRows = await db.select().from(projects).where(eq(projects.id, id));
  const updated = updatedRows[0];
  if (!updated) return c.json({ error: "Update failed" }, 500);
  return c.json(updated);
});

// DELETE /api/projects/:id — delete (cascade handled by DB)
app.delete("/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get("user");
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.ownerId, user.id)));
  if (!existing) return c.json({ error: "Not found" }, 404);

  await db.delete(projects).where(eq(projects.id, id));
  return c.json({ ok: true });
});

export default app;
