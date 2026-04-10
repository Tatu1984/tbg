/**
 * Server-side, DB-backed role permissions.
 *
 * Storage: a single row in the `Setting` table with id="role-permissions"
 * and `data` containing a `RolePermissions` JSON object. If the row is
 * absent we fall back to `DEFAULT_PERMISSIONS` and lazily seed it.
 *
 * Caching: an in-process cache holds the permissions for `CACHE_TTL_MS`
 * (or until `invalidatePermissionsCache()` is called after a write).
 * The cache is per-lambda-instance — Vercel will see eventual
 * consistency across instances within `CACHE_TTL_MS`, which is fine
 * for an admin-changed setting.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/database/client";
import { authenticateRequest } from "@/backend/api/middleware";
import {
  type NavKey,
  type RolePermissions,
  type ConfigurableRole,
  CONFIGURABLE_ROLES,
  DEFAULT_PERMISSIONS,
  ROLE_PERMISSIONS_SETTING_ID,
  allowedPagesFor,
} from "@/shared/permissions";

const CACHE_TTL_MS = 30_000;

let cached: { perms: RolePermissions; expiresAt: number } | null = null;

function isValidPermissions(value: unknown): value is RolePermissions {
  if (!value || typeof value !== "object") return false;
  for (const role of CONFIGURABLE_ROLES) {
    const list = (value as Record<string, unknown>)[role];
    if (!Array.isArray(list)) return false;
    if (!list.every((p) => typeof p === "string")) return false;
  }
  return true;
}

/** Read role permissions from DB (with cache + defaults fallback). */
export async function getRolePermissions(): Promise<RolePermissions> {
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.perms;

  let perms: RolePermissions = DEFAULT_PERMISSIONS;
  try {
    const row = await prisma.setting.findUnique({
      where: { id: ROLE_PERMISSIONS_SETTING_ID },
    });
    if (row && isValidPermissions(row.data)) {
      // Merge defaults so newly-added pages don't disappear if the
      // stored row was written before the page existed.
      const stored = row.data as RolePermissions;
      perms = {
        ...DEFAULT_PERMISSIONS,
        ...stored,
      };
    }
  } catch {
    // DB unavailable — fall through to defaults so the app still loads.
  }

  cached = { perms, expiresAt: now + CACHE_TTL_MS };
  return perms;
}

/** Write role permissions to DB and invalidate the cache. */
export async function saveRolePermissions(
  perms: RolePermissions
): Promise<RolePermissions> {
  if (!isValidPermissions(perms)) {
    throw new Error("Invalid role permissions payload");
  }

  await prisma.setting.upsert({
    where: { id: ROLE_PERMISSIONS_SETTING_ID },
    create: { id: ROLE_PERMISSIONS_SETTING_ID, data: perms },
    update: { data: perms },
  });

  invalidatePermissionsCache();
  return perms;
}

export function invalidatePermissionsCache(): void {
  cached = null;
}

/** Returns true if the role can access the given dashboard page. */
export async function canAccessPage(
  role: string,
  page: NavKey
): Promise<boolean> {
  if (role === "owner") return true;
  const perms = await getRolePermissions();
  return allowedPagesFor(role, perms).includes(page);
}

/**
 * Combined auth + page-permission check for API routes.
 *
 * Usage:
 *   const auth = await requirePagePermission(req, "products");
 *   if (auth instanceof NextResponse) return auth;
 *   // auth.user is the JWT payload
 */
export async function requirePagePermission(
  req: NextRequest,
  page: NavKey
): Promise<NextResponse | { user: { id: string; role: string; [k: string]: unknown } }> {
  const auth = await authenticateRequest(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const role = String(auth.user.role || "");
  const allowed = await canAccessPage(role, page);
  if (!allowed) {
    return NextResponse.json(
      { error: `You don't have permission to access ${page}` },
      { status: 403 }
    );
  }
  return { user: auth.user as { id: string; role: string; [k: string]: unknown } };
}

export type { NavKey, RolePermissions, ConfigurableRole };
