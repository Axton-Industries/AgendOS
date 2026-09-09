import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getMessages } from "@/modules/ai/service";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  return NextResponse.json({ messages: getMessages(auth.user.id) });
}
