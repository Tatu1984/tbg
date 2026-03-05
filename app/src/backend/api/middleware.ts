import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/backend/utils/jwt.util";

export type Role = "owner" | "manager" | "cashier" | "inventory_staff" | "customer";

export async function authenticateRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);
  if (!payload) {
    return { error: "Invalid token", status: 401 };
  }

  return { user: payload };
}

export function authorizeRoles(...allowedRoles: Role[]) {
  return async (req: NextRequest) => {
    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const userRole = auth.user.role as Role;
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return { user: auth.user };
  };
}
