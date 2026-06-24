import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth, type Env } from "./auth";
import { authRequired } from "./middleware/auth-required";
import projectsRoute from "./routes/projects";
import diagramsRoute from "./routes/diagrams";

const app = new Hono<{ Bindings: Env }>();

app.use("*", async (c, next) => {
  return cors({
    origin: c.env.WEB_ORIGIN,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })(c, next);
});

app.get("/api/health", (c) => c.json({ ok: true }));

// Auth routes — no session required
app.on(["GET", "POST"], "/api/auth/**", (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

// Protected routes
app.route("/api/projects", authRequired(projectsRoute));
app.route("/api/diagrams", authRequired(diagramsRoute));

export default app;
