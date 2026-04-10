import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest } from "@/backend/api/middleware";
import {
  getRolePermissions,
  saveRolePermissions,
} from "@/backend/auth/permissions";
import { handleError } from "@/backend/utils/error-handler.util";
import {
  ALL_PAGES,
  type RolePermissions,
} from "@/shared/permissions";

const navKey = z.enum(ALL_PAGES as unknown as readonly [string, ...string[]]);

const permissionsSchema = z.object({
  manager: z.array(navKey),
  cashier: z.array(navKey),
  inventory_staff: z.array(navKey),
});

// GET /api/settings/permissions - any authenticated user can read
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const permissions = await getRolePermissions();
    return NextResponse.json({ permissions });
  } catch (error) {
    return handleError(error);
  }
}

// PUT /api/settings/permissions - owner only
export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    if (String(auth.user.role) !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = permissionsSchema.safeParse(body?.permissions);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid permissions payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const saved = await saveRolePermissions(parsed.data as RolePermissions);
    return NextResponse.json({ permissions: saved });
  } catch (error) {
    return handleError(error);
  }
}
