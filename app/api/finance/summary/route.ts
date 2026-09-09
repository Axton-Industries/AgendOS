import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getSummary } from "@/modules/finance/service";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  return NextResponse.json({ summary: getSummary(auth.user.id) });
}
