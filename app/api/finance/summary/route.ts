import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getSummary } from "@/modules/finance/service";

export async function GET(req: NextRequest) {
  const user = requireUser();
  return NextResponse.json({ summary: getSummary(user.id) });
}
