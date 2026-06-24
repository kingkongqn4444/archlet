import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";

export type Env = {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
  WEB_ORIGIN?: string;
};

export function createAuth(env: Env) {
  if (!env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET is not set");
  }
  const db = drizzle(env.DB, { schema });
  const baseURL = env.BETTER_AUTH_URL ?? "http://localhost:8787";
  const webOrigin = env.WEB_ORIGIN ?? "http://localhost:5173";
  const isHttps = baseURL.startsWith("https://");

  // In dev, Vite may spin up on :5173, :5174, :5183, etc.
  // Trust a broad range of localhost ports so auth never breaks during development.
  const isDev = baseURL.includes("localhost");
  const devLocalhostOrigins = isDev
    ? Array.from({ length: 100 }, (_, i) => `http://localhost:${5170 + i}`)
    : [];
  const trustedOrigins = [webOrigin, ...devLocalhostOrigins];

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL,
    trustedOrigins,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    advanced: {
      cookiePrefix: "archlet",
    },
    cookies: {
      sessionToken: {
        options: {
          httpOnly: true,
          secure: isHttps,
          sameSite: "lax",
        },
      },
    },
  });
}
