import { Hono } from "hono";
import { createAuth, type Env } from "../auth";
import type { User } from "better-auth";

export type AuthEnv = {
  Bindings: Env;
  Variables: { user: User };
};

/**
 * Wraps a Hono app with session auth — resolves session, sets c.var.user, or returns 401.
 */
export function authRequired(route: Hono<AuthEnv>): Hono<AuthEnv> {
  const guarded = new Hono<AuthEnv>();

  guarded.use("*", async (c, next) => {
    const auth = createAuth(c.env);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    c.set("user", session.user);
    await next();
  });

  guarded.route("/", route);
  return guarded;
}
