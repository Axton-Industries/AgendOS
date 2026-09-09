import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, type User } from "@/modules/auth/service";

/** Enforces authentication for API routes. Returns 401 response if not logged in. */
export async function requireUser(
  req: NextRequest
): Promise<{ user: User } | { error: NextResponse }> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user };
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
