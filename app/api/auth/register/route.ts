import { NextRequest, NextResponse } from "next/server";
import { register, login, SESSION_COOKIE } from "@/modules/auth/service";
import { setSession } from "../session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const user = register(email, password);
    const token = login(email, password);
    const res = NextResponse.json({ user: { email: user.email } });
    setSession(res, token);
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
