import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getMessages } from "@/modules/ai/service";

export async function GET(req: NextRequest) {
  const { user } = requireUser();
  return NextResponse.json({ messages: getMessages(user.id) });
}
