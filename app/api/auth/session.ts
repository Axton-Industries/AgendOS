import type { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_COOKIE_MAX_AGE } from "@/modules/auth/service";

export function setSession(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}
