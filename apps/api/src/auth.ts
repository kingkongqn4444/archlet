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

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL,
    trustedOrigins: [webOrigin],
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
