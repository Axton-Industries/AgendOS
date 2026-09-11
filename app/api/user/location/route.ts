import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { setLocation } from "@/modules/auth/service";

export async function POST(req: NextRequest) {
  const { user } = requireUser();
  const { name, lat, lon } = await req.json();
  if (typeof lat !== "number" || typeof lon !== "number" || !name) {
    return NextResponse.json({ error: "name, lat and lon are required" }, { status: 400 });
  }
  setLocation(user.id, name, lat, lon);
  return NextResponse.json({ ok: true });
}
