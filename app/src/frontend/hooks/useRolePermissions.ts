"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/frontend/api/client";
import {
  type RolePermissions,
  type NavKey,
  DEFAULT_PERMISSIONS,
  allowedPagesFor,
} from "@/shared/permissions";

/**
 * Module-level cache so the navigation, page guards, and the settings
 * editor all share the same fetched value and don't trigger duplicate
 * GETs on every mount.
 */
let cached: RolePermissions | null = null;
let inflight: Promise<RolePermissions> | null = null;
const subscribers = new Set<(p: RolePermissions) => void>();

async function fetchPermissions(): Promise<RolePermissions> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data } = await apiClient.get<{ permissions: RolePermissions }>(
        "/settings/permissions"
      );
      cached = data.permissions;
    } catch {
      // Fall back to defaults so the UI is at least usable.
      cached = DEFAULT_PERMISSIONS;
    } finally {
      inflight = null;
    }
    subscribers.forEach((cb) => cached && cb(cached));
    return cached!;
  })();
  return inflight;
}

/** Force a re-fetch on the next call (used after an admin saves). */
export function invalidateRolePermissionsCache(next?: RolePermissions): void {
  if (next) {
    cached = next;
    subscribers.forEach((cb) => cb(next));
  } else {
    cached = null;
  }
}

export function useRolePermissions(): {
  permissions: RolePermissions | null;
  loading: boolean;
  refetch: () => Promise<void>;
} {
  const [permissions, setPermissions] = useState<RolePermissions | null>(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let alive = true;
    const onUpdate = (p: RolePermissions) => {
      if (alive) setPermissions(p);
    };
    subscribers.add(onUpdate);

    if (!cached) {
      fetchPermissions().then((p) => {
        if (alive) {
          setPermissions(p);
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }

    return () => {
      alive = false;
      subscribers.delete(onUpdate);
    };
  }, []);

  const refetch = useCallback(async () => {
    cached = null;
    setLoading(true);
    const p = await fetchPermissions();
    setPermissions(p);
    setLoading(false);
  }, []);

  return { permissions, loading, refetch };
}

/**
 * Convenience hook for the layout: returns the list of pages the
 * given role can access, plus a loading flag so we don't render the
 * sidebar before we know what to show.
 */
export function useAllowedPages(role: string | undefined): {
  pages: NavKey[];
  loading: boolean;
} {
  const { permissions, loading } = useRolePermissions();
  if (!role) return { pages: [], loading };
  if (!permissions) return { pages: [], loading: true };
  return { pages: allowedPagesFor(role, permissions), loading: false };
}
