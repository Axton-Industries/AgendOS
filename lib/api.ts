import { NextResponse } from "next/server";
import { getCurrentUser, type User } from "@/modules/auth/service";

/** Returns the local user. No auth required. */
export function requireUser(): User {
  return getCurrentUser();
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}