/**
 * NyxID authentication middleware.
 * Trusts identity headers injected by NyxID proxy (X-NyxID-User-*).
 * All requests reach ornn through NyxID proxy which has already verified
 * the user's access token.
 * @module middleware/nyxidAuth
 */

import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import pino from "pino";

const logger = pino({ level: "info" }).child({ module: "nyxidAuth" });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthContext {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export type AuthVariables = {
  auth: AuthContext;
};

// ---------------------------------------------------------------------------
// AppError (inlined from ornn-shared to avoid circular dependency)
// ---------------------------------------------------------------------------

class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// ---------------------------------------------------------------------------
// Header parsing
// ---------------------------------------------------------------------------

/**
 * Extract auth context from NyxID proxy identity headers.
 * Returns null if no identity headers are present (anonymous request).
 */
function extractAuthFromHeaders(c: Context): AuthContext | null {
  const userId = c.req.header("X-NyxID-User-Id");
  if (!userId) {
    return null;
  }

  const email = c.req.header("X-NyxID-User-Email") ?? "";
  const rolesHeader = c.req.header("X-NyxID-User-Roles");
  const permsHeader = c.req.header("X-NyxID-User-Permissions");

  const roles = rolesHeader ? rolesHeader.split(",").filter(Boolean) : [];
  const permissions = permsHeader ? permsHeader.split(",").filter(Boolean) : [];

  return { userId, email, roles, permissions };
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/**
 * Required auth middleware.
 * Reads identity from NyxID proxy headers. Throws 401 if no identity present.
 */
export function nyxidAuthMiddleware() {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const auth = extractAuthFromHeaders(c);
    if (!auth) {
      throw new AppError(401, "AUTH_MISSING", "Missing NyxID identity headers");
    }
    logger.debug({ userId: auth.userId, email: auth.email }, "Authenticated via proxy headers");
    c.set("auth", auth);
    await next();
  });
}

/**
 * Optional auth middleware.
 * Sets auth context if identity headers are present, allows anonymous otherwise.
 */
export function optionalAuthMiddleware() {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const auth = extractAuthFromHeaders(c);
    if (auth) {
      c.set("auth", auth);
    }
    await next();
  });
}

/**
 * Permission check middleware. Requires the user to have ALL specified permissions.
 */
export function requirePermission(...required: string[]) {
  return async (c: Context<{ Variables: AuthVariables }>, next: Next) => {
    const auth = c.get("auth");
    if (!auth) {
      throw new AppError(401, "AUTH_MISSING", "Not authenticated");
    }

    for (const perm of required) {
      if (!auth.permissions.includes(perm)) {
        logger.warn({ userId: auth.userId, missing: perm }, "Permission denied");
        throw new AppError(403, "FORBIDDEN", `Missing permission: ${perm}`);
      }
    }

    await next();
  };
}

/**
 * Resource ownership check middleware.
 * Allows access if the user owns the resource or has ornn:admin:skill permission.
 */
export function requireOwnerOrAdmin(getResourceOwnerId: (c: Context) => Promise<string>) {
  return async (c: Context<{ Variables: AuthVariables }>, next: Next) => {
    const auth = c.get("auth");
    if (!auth) {
      throw new AppError(401, "AUTH_MISSING", "Not authenticated");
    }

    const ownerId = await getResourceOwnerId(c);
    if (auth.userId !== ownerId && !auth.permissions.includes("ornn:admin:skill")) {
      throw new AppError(403, "FORBIDDEN", "You can only operate on your own resources");
    }

    await next();
  };
}

/**
 * Helper to get auth context from request. Throws if not authenticated.
 */
export function getAuth(c: Context<{ Variables: AuthVariables }>): AuthContext {
  const auth = c.get("auth");
  if (!auth) {
    throw new AppError(401, "AUTH_MISSING", "Not authenticated");
  }
  return auth;
}
