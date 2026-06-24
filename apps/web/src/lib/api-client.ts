import type { z } from "zod";

const BASE = import.meta.env["VITE_API_URL"] ?? "http://localhost:8787";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor() {
    super(401, "Unauthorized");
    this.name = "UnauthorizedError";
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  schema?: z.ZodType<T>
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (res.status === 401) throw new UnauthorizedError();

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text);
  }

  const json = (await res.json()) as unknown;
  if (schema) return schema.parse(json);
  return json as T;
}

export const apiClient = {
  get<T>(path: string, schema?: z.ZodType<T>) {
    return request<T>(path, { method: "GET" }, schema);
  },
  post<T>(path: string, body: unknown, schema?: z.ZodType<T>) {
    return request<T>(path, { method: "POST", body: JSON.stringify(body) }, schema);
  },
  put<T>(path: string, body: unknown, schema?: z.ZodType<T>) {
    return request<T>(path, { method: "PUT", body: JSON.stringify(body) }, schema);
  },
  patch<T>(path: string, body: unknown, schema?: z.ZodType<T>) {
    return request<T>(path, { method: "PATCH", body: JSON.stringify(body) }, schema);
  },
  delete<T>(path: string, schema?: z.ZodType<T>) {
    return request<T>(path, { method: "DELETE" }, schema);
  },
};
