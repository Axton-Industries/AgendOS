import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logout, SESSION_COOKIE } from "@/modules/auth/service";

export async function POST() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) logout(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
