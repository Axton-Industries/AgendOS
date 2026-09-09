import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { geocode } from "@/modules/weather/service";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const name = new URL(req.url).searchParams.get("name")?.trim();
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });
  const place = await geocode(name);
  return NextResponse.json({ place });
}
