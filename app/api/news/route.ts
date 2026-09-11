import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getHeadlines } from "@/modules/news/service";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const { user } = requireUser();
  const category = new URL(req.url).searchParams.get("category") ?? undefined;
  try {
    return NextResponse.json({ articles: await getHeadlines(category) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
