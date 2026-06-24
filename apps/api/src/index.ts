import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth, type Env } from "./auth";
import { authRequired } from "./middleware/auth-required";
import projectsRoute from "./routes/projects";
import diagramsRoute from "./routes/diagrams";
import shareRoute from "./routes/share";
import publicRoute from "./routes/public";

const app = new Hono<{ Bindings: Env }>();

app.use("*", async (c, next) => {
  const webOrigin = c.env.WEB_ORIGIN ?? "http://localhost:5173";
  const isDev = !c.env.WEB_ORIGIN || c.env.WEB_ORIGIN.includes("localhost");

  // In dev, allow any localhost origin (Vite port may vary: 5173, 5174, 5183…)
  const origin = isDev
    ? (requestOrigin: string) =>
        /^http:\/\/localhost:\d+$/.test(requestOrigin) ? requestOrigin : webOrigin
    : webOrigin;

  return cors({
    origin,
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

// Public routes — no auth (must be before authRequired middleware)
app.route("/api/public", publicRoute);

// Protected routes
app.route("/api/projects", authRequired(projectsRoute));
app.route("/api/diagrams", authRequired(diagramsRoute));
app.route("/api/share", authRequired(shareRoute));

export default app;
