import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { diagrams, shareTokens } from "../db/schema";
import type { Env } from "../auth";
import type { PublicDiagramResponse } from "@archlet/shared";

const app = new Hono<{ Bindings: Env }>();

function cacheKey(req: Request): string {
  return req.url;
}

function rowToPublic(diagram: typeof diagrams.$inferSelect): PublicDiagramResponse {
  return {
    id: diagram.id,
    name: diagram.name,
    levelData: JSON.parse(diagram.levelData),
    activeLevel: diagram.activeLevel as PublicDiagramResponse["activeLevel"],
  };
}

async function cachedResponse(
  req: Request,
  buildResponse: () => Promise<Response | null>
): Promise<Response> {
  // CF Cache API only works in deployed Workers; guard for local dev
  let cache: Cache | null = null;
  try {
    cache = caches.default;
    const cached = await cache.match(req);
    if (cached) return cached;
  } catch {
    cache = null;
  }

  const response = await buildResponse();
  if (!response) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (cache && response.status === 200) {
    const toCache = response.clone();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    cache.put(cacheKey(req), toCache);
  }

  return response;
}

// GET /api/public/diagram/:token — resolve token → diagram JSON (no auth)
app.get("/diagram/:token", async (c) => {
  const token = c.req.param("token");

  return cachedResponse(c.req.raw, async () => {
    const db = drizzle(c.env.DB);
    const now = Date.now();

    const [row] = await db
      .select({
        diagram: diagrams,
        expiresAt: shareTokens.expiresAt,
      })
      .from(shareTokens)
      .innerJoin(diagrams, eq(shareTokens.diagramId, diagrams.id))
      .where(eq(shareTokens.token, token));

    if (!row) return null;
    if (row.expiresAt !== null && row.expiresAt < now) return null;

    const body = JSON.stringify(rowToPublic(row.diagram));
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    });
  });
});

// GET /api/public/embed/:id — public embed (requires public_embed=1)
app.get("/embed/:id", async (c) => {
  const id = c.req.param("id");

  return cachedResponse(c.req.raw, async () => {
    const db = drizzle(c.env.DB);

    const [diagram] = await db
      .select()
      .from(diagrams)
      .where(eq(diagrams.id, id));

    if (!diagram || !diagram.publicEmbed) return null;

    const body = JSON.stringify(rowToPublic(diagram));
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    });
  });
});

export default app;
